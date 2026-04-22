import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql, ne } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  ListNewArrivalsQueryParams,
  ListBestSellersQueryParams,
  GetProductBySlugParams,
  ListRelatedProductsParams,
} from "@workspace/api-zod";
import {
  serializeProduct,
  serializeProductDetail,
} from "../lib/serialize";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }
  const {
    q,
    category,
    collection,
    color,
    size,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    pageSize = 24,
  } = parsed.data;

  const conditions = [] as ReturnType<typeof eq>[];
  if (q) {
    const term = `%${q}%`;
    const orCond = or(
      ilike(productsTable.name, term),
      ilike(productsTable.description, term),
      ilike(productsTable.tagline, term),
    );
    if (orCond) conditions.push(orCond as never);
  }
  if (category) conditions.push(eq(productsTable.category, category));
  if (collection) conditions.push(eq(productsTable.collection, collection));
  if (color) conditions.push(eq(productsTable.color, color));
  if (size)
    conditions.push(
      sql`${productsTable.sizes} @> ${JSON.stringify([size])}::jsonb` as never,
    );
  if (minPrice != null)
    conditions.push(gte(productsTable.price, String(minPrice)) as never);
  if (maxPrice != null)
    conditions.push(lte(productsTable.price, String(maxPrice)) as never);

  const whereExpr = conditions.length > 0 ? and(...conditions) : undefined;

  let orderExpr;
  switch (sort) {
    case "price_asc":
      orderExpr = asc(productsTable.price);
      break;
    case "price_desc":
      orderExpr = desc(productsTable.price);
      break;
    case "popular":
      orderExpr = desc(productsTable.popularity);
      break;
    case "newest":
    default:
      orderExpr = desc(productsTable.createdAt);
  }

  const offset = (page - 1) * pageSize;

  const [items, totalRow] = await Promise.all([
    db
      .select()
      .from(productsTable)
      .where(whereExpr)
      .orderBy(orderExpr)
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(productsTable)
      .where(whereExpr),
  ]);

  const total = totalRow[0]?.count ?? 0;

  res.json({
    items: items.map(serializeProduct),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

router.get("/products/featured", async (_req, res): Promise<void> => {
  const items = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.isBestSeller, true))
    .orderBy(desc(productsTable.popularity))
    .limit(8);
  res.json(items.map(serializeProduct));
});

router.get("/products/new-arrivals", async (req, res): Promise<void> => {
  const parsed = ListNewArrivalsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }
  const limit = parsed.data.limit ?? 8;
  const items = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.isNew, true))
    .orderBy(desc(productsTable.createdAt))
    .limit(limit);
  res.json(items.map(serializeProduct));
});

router.get("/products/best-sellers", async (req, res): Promise<void> => {
  const parsed = ListBestSellersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }
  const limit = parsed.data.limit ?? 8;
  const items = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.isBestSeller, true))
    .orderBy(desc(productsTable.popularity))
    .limit(limit);
  res.json(items.map(serializeProduct));
});

router.get("/products/:slug", async (req, res): Promise<void> => {
  const parsed = GetProductBySlugParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }
  const [item] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.slug, parsed.data.slug));
  if (!item) {
    res.status(404).json({ message: "Dress not found" });
    return;
  }
  res.json(serializeProductDetail(item));
});

router.get("/products/:slug/related", async (req, res): Promise<void> => {
  const parsed = ListRelatedProductsParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }
  const [item] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.slug, parsed.data.slug));
  if (!item) {
    res.json([]);
    return;
  }
  const related = await db
    .select()
    .from(productsTable)
    .where(
      and(
        ne(productsTable.id, item.id),
        or(
          eq(productsTable.collection, item.collection),
          eq(productsTable.category, item.category),
        ),
      ),
    )
    .orderBy(desc(productsTable.popularity))
    .limit(4);
  res.json(related.map(serializeProduct));
});

router.get("/facets", async (_req, res): Promise<void> => {
  const all = await db.select().from(productsTable);
  const countBy = <T extends string>(arr: T[]) => {
    const m = new Map<T, number>();
    for (const v of arr) m.set(v, (m.get(v) ?? 0) + 1);
    return Array.from(m.entries()).map(([value, count]) => ({ value, count }));
  };
  const categories = countBy(all.map((p) => p.category));
  const collections = countBy(all.map((p) => p.collection));
  const colorMap = new Map<string, { hex: string; count: number }>();
  for (const p of all) {
    const e = colorMap.get(p.color);
    if (e) e.count += 1;
    else colorMap.set(p.color, { hex: p.colorHex, count: 1 });
  }
  const colors = Array.from(colorMap.entries()).map(([value, { hex, count }]) => ({
    value,
    hex,
    count,
  }));
  const sizeCount = new Map<string, number>();
  for (const p of all)
    for (const s of p.sizes) sizeCount.set(s, (sizeCount.get(s) ?? 0) + 1);
  const sizeOrder = ["XS", "S", "M", "L", "XL"];
  const sizes = Array.from(sizeCount.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => sizeOrder.indexOf(a.value) - sizeOrder.indexOf(b.value));
  const prices = all.map((p) => Number(p.price));
  const min = prices.length > 0 ? Math.min(...prices) : 0;
  const max = prices.length > 0 ? Math.max(...prices) : 0;

  res.json({
    categories,
    collections,
    colors,
    sizes,
    priceRange: { min, max },
  });
});

export default router;
