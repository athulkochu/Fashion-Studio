import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  ordersTable,
  cartItemsTable,
  type OrderItemRecord,
} from "@workspace/db";
import { CreateOrderBody, GetOrderParams } from "@workspace/api-zod";
import { buildCartView, getOrCreateCart, round2 } from "../lib/cart";

const router: IRouter = Router();

const SHIPPING_OPTIONS: Record<string, { cost: number; days: [number, number] }> = {
  standard: { cost: 12, days: [5, 7] },
  express: { cost: 24, days: [2, 3] },
  overnight: { cost: 45, days: [1, 1] },
};

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LM-${ts}-${rand}`;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateRange(start: Date, end: Date) {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (start.toDateString() === end.toDateString()) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }

  const cart = await getOrCreateCart(req, res);
  const view = await buildCartView(cart.id);
  if (view.items.length === 0) {
    res.status(400).json({ message: "Your cart is empty" });
    return;
  }

  const shippingOpt = SHIPPING_OPTIONS[parsed.data.shippingMethod];
  const shippingCost = view.subtotal >= 200 ? 0 : shippingOpt.cost;
  const tax = round2(view.subtotal * 0.08);
  const total = round2(view.subtotal + shippingCost + tax);

  const orderItems: OrderItemRecord[] = view.items.map((it) => ({
    productId: it.productId,
    name: it.name,
    image: it.image,
    color: it.color,
    size: it.size,
    price: it.price,
    quantity: it.quantity,
    lineTotal: it.lineTotal,
  }));

  const orderNumber = generateOrderNumber();
  const now = new Date();
  const estimated = formatDateRange(
    addDays(now, shippingOpt.days[0]),
    addDays(now, shippingOpt.days[1]),
  );

  const [order] = await db
    .insert(ordersTable)
    .values({
      orderNumber,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      status: "confirmed",
      items: orderItems,
      subtotal: view.subtotal.toFixed(2),
      shipping: shippingCost.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      currency: "USD",
      shippingAddress: parsed.data.shippingAddress,
      billingAddress: parsed.data.billingAddress,
      shippingMethod: parsed.data.shippingMethod,
      paymentMethod: parsed.data.paymentMethod,
      estimatedDelivery: estimated,
      notes: parsed.data.notes ?? null,
    })
    .returning();

  await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cart.id));

  res.status(201).json(serializeOrder(order));
});

router.get("/orders/:orderNumber", async (req, res): Promise<void> => {
  const parsed = GetOrderParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderNumber, parsed.data.orderNumber));
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  res.json(serializeOrder(order));
});

function serializeOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    email: o.email,
    status: o.status,
    items: o.items,
    subtotal: Number(o.subtotal),
    shipping: Number(o.shipping),
    tax: Number(o.tax),
    total: Number(o.total),
    currency: o.currency,
    shippingAddress: o.shippingAddress,
    billingAddress: o.billingAddress,
    shippingMethod: o.shippingMethod,
    paymentMethod: o.paymentMethod,
    estimatedDelivery: o.estimatedDelivery,
    createdAt: o.createdAt.toISOString(),
  };
}

export default router;
