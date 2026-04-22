import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const collectionsTable = pgTable("collections", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  coverImage: text("cover_image").notNull(),
});

export type Collection = typeof collectionsTable.$inferSelect;
export type InsertCollection = typeof collectionsTable.$inferInsert;
