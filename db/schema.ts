import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const lists = sqliteTable("lists", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  icon: text("icon"),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updatedAt").default(sql`CURRENT_TIMESTAMP`),
});

export const items = sqliteTable("items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  listId: text("listId").references(() => lists.id, { onDelete: "cascade" }),
  userId: text("userId").notNull(),
  text: text("text").notNull(),
  description: text("description"),
  dueDate: text("dueDate"), 
  isCompleted: integer("isCompleted", { mode: "boolean" }).notNull().default(false),
  isDeleted: integer("isDeleted", { mode: "boolean" }).notNull().default(false),
  position: real("position").default(0),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updatedAt").default(sql`CURRENT_TIMESTAMP`),
});

export type List = typeof lists.$inferSelect;
export type NewList = typeof lists.$inferInsert;

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
