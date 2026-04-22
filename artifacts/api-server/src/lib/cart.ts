import { randomBytes } from "crypto";
import { eq, and, inArray } from "drizzle-orm";
import {
  db,
  cartsTable,
  cartItemsTable,
  productsTable,
  type Product,
} from "@workspace/db";
import type { Request, Response } from "express";

const COOKIE_NAME = "lumiere_cart";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 60 * 1000; // 60 days

export async function getOrCreateCart(req: Request, res: Response) {
  let sessionId = req.cookies?.[COOKIE_NAME] as string | undefined;

  if (sessionId) {
    const [existing] = await db
      .select()
      .from(cartsTable)
      .where(eq(cartsTable.sessionId, sessionId));
    if (existing) {
      return existing;
    }
  }

  sessionId = randomBytes(24).toString("hex");
  const [cart] = await db
    .insert(cartsTable)
    .values({ sessionId })
    .returning();

  res.cookie(COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return cart;
}

const SHIPPING_FREE_THRESHOLD = 200;
const SHIPPING_FLAT = 12;
const TAX_RATE = 0.08;

export type CartLine = {
  id: number;
  productId: number;
  slug: string;
  name: string;
  image: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

export type CartView = {
  items: CartLine[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
  currency: string;
};

export async function buildCartView(cartId: number): Promise<CartView> {
  const items = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.cartId, cartId));

  if (items.length === 0) {
    return {
      items: [],
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      itemCount: 0,
      currency: "USD",
    };
  }

  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const products = await db
    .select()
    .from(productsTable)
    .where(inArray(productsTable.id, productIds));
  const productMap = new Map<number, Product>(products.map((p) => [p.id, p]));

  const lines: CartLine[] = items
    .map((it) => {
      const p = productMap.get(it.productId);
      if (!p) return null;
      const price = Number(p.price);
      return {
        id: it.id,
        productId: p.id,
        slug: p.slug,
        name: p.name,
        image: p.images[0] ?? "",
        color: p.color,
        size: it.size,
        price,
        quantity: it.quantity,
        lineTotal: round2(price * it.quantity),
      };
    })
    .filter((x): x is CartLine => x !== null);

  const subtotal = round2(lines.reduce((s, l) => s + l.lineTotal, 0));
  const shipping =
    subtotal === 0 ? 0 : subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FLAT;
  const tax = round2(subtotal * TAX_RATE);
  const total = round2(subtotal + shipping + tax);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);

  return {
    items: lines,
    subtotal,
    shipping,
    tax,
    total,
    itemCount,
    currency: "USD",
  };
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export async function findCartItem(
  cartId: number,
  productId: number,
  size: string,
) {
  const [row] = await db
    .select()
    .from(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.cartId, cartId),
        eq(cartItemsTable.productId, productId),
        eq(cartItemsTable.size, size),
      ),
    );
  return row;
}
