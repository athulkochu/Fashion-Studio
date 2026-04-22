import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, collectionsTable, productsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/collections", async (_req, res): Promise<void> => {
  const collections = await db.select().from(collectionsTable);
  const counts = await db
    .select({
      collection: productsTable.collection,
      count: sql<number>`count(*)::int`,
    })
    .from(productsTable)
    .groupBy(productsTable.collection);
  const countMap = new Map(counts.map((c) => [c.collection, c.count]));
  res.json(
    collections.map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      coverImage: c.coverImage,
      productCount: countMap.get(c.slug) ?? 0,
    })),
  );
});

export default router;
