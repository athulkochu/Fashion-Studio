import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  numeric,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
  currency: text("currency").notNull().default("USD"),
  category: text("category").notNull(),
  collection: text("collection").notNull(),
  color: text("color").notNull(),
  colorHex: text("color_hex").notNull(),
  sizes: jsonb("sizes").$type<string[]>().notNull(),
  images: jsonb("images").$type<string[]>().notNull(),
  material: text("material").notNull(),
  isNew: boolean("is_new").notNull().default(false),
  isBestSeller: boolean("is_best_seller").notNull().default(false),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("4.8"),
  reviewCount: integer("review_count").notNull().default(0),
  stock: integer("stock").notNull().default(20),
  details: jsonb("details").$type<string[]>().notNull(),
  careInstructions: jsonb("care_instructions").$type<string[]>().notNull(),
  sizeGuide: jsonb("size_guide")
    .$type<
      {
        size: string;
        bust: string;
        waist: string;
        hips: string;
        length: string;
      }[]
    >()
    .notNull(),
  popularity: integer("popularity").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Product = typeof productsTable.$inferSelect;
export type InsertProduct = typeof productsTable.$inferInsert;
