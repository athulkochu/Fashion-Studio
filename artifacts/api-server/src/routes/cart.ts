import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import {
  AddCartItemBody,
  UpdateCartItemBody,
  UpdateCartItemParams,
  RemoveCartItemParams,
} from "@workspace/api-zod";
import { buildCartView, findCartItem, getOrCreateCart } from "../lib/cart";

const router: IRouter = Router();

router.get("/cart", async (req, res): Promise<void> => {
  const cart = await getOrCreateCart(req, res);
  const view = await buildCartView(cart.id);
  res.json(view);
});

router.delete("/cart", async (req, res): Promise<void> => {
  const cart = await getOrCreateCart(req, res);
  await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cart.id));
  res.json(await buildCartView(cart.id));
});

router.post("/cart/items", async (req, res): Promise<void> => {
  const parsed = AddCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }
  const { productId, size, quantity = 1 } = parsed.data;

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId));
  if (!product) {
    res.status(404).json({ message: "Dress not found" });
    return;
  }
  if (!product.sizes.includes(size)) {
    res.status(400).json({ message: "Selected size unavailable" });
    return;
  }

  const cart = await getOrCreateCart(req, res);
  const existing = await findCartItem(cart.id, productId, size);
  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({
      cartId: cart.id,
      productId,
      size,
      quantity,
    });
  }

  res.json(await buildCartView(cart.id));
});

router.patch("/cart/items/:itemId", async (req, res): Promise<void> => {
  const params = UpdateCartItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }
  const body = UpdateCartItemBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ message: body.error.message });
    return;
  }
  const cart = await getOrCreateCart(req, res);
  if (body.data.quantity === 0) {
    await db
      .delete(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.id, params.data.itemId),
          eq(cartItemsTable.cartId, cart.id),
        ),
      );
  } else {
    await db
      .update(cartItemsTable)
      .set({ quantity: body.data.quantity })
      .where(
        and(
          eq(cartItemsTable.id, params.data.itemId),
          eq(cartItemsTable.cartId, cart.id),
        ),
      );
  }
  res.json(await buildCartView(cart.id));
});

router.delete("/cart/items/:itemId", async (req, res): Promise<void> => {
  const params = RemoveCartItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }
  const cart = await getOrCreateCart(req, res);
  await db
    .delete(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.id, params.data.itemId),
        eq(cartItemsTable.cartId, cart.id),
      ),
    );
  res.json(await buildCartView(cart.id));
});

export default router;
