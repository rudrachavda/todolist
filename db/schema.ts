import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const lists = sqliteTable("lists", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(), // Hex or predefined name
  icon: text("icon"), // Lucide icon name or emoji
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const items = sqliteTable("items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  listId: text("list_id").references(() => lists.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  text: text("text").notNull(),
  description: text("description"),
  dueDate: text("due_date"), // ISO string or simple date
  isCompleted: integer("is_completed", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export type List = typeof lists.$inferSelect;
export type NewList = typeof lists.$inferInsert;

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
