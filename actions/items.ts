"use server";

import { db } from "@/db";
import { items, lists } from "@/db/schema";
import { eq, and, gte, lte, or, desc, asc, sql, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const userId = "user_1"; // Shim user

export async function createItem(text: string, listId?: string, dueDate?: string) {
  const [newItem] = await db.insert(items).values({
    text,
    listId,
    dueDate,
    userId,
  }).returning();
  
  revalidatePath("/", "layout");
  return newItem;
}

export async function getItemsByList(listId: string) {
  return db.select()
    .from(items)
    .where(and(eq(items.listId, listId), eq(items.userId, userId), eq(items.isDeleted, false)))
    .orderBy(asc(items.position), desc(items.createdAt));
}

export async function deleteItem(id: string) {
  console.log("deleteItem called", id);
  const result = await db.update(items)
    .set({ isDeleted: true })
    .where(eq(items.id, id))
    .returning();
  console.log("deleteItem result:", result);
  revalidatePath("/", "layout");
}

export async function restoreItem(id: string) {
  await db.update(items)
    .set({ isDeleted: false })
    .where(eq(items.id, id));
  revalidatePath("/", "layout");
}

export async function permanentlyDeleteItem(id: string) {
  await db.delete(items)
    .where(eq(items.id, id));
  revalidatePath("/", "layout");
}

export async function moveItem(id: string, newListId: string, oldListId?: string) {
  console.log("moveItem called", { id, newListId, oldListId });
  const result = await db.update(items)
    .set({ listId: newListId })
    .where(eq(items.id, id))
    .returning();
  console.log("moveItem result:", result);
  revalidatePath("/", "layout");
  revalidatePath(`/lists/${newListId}`);
  if (oldListId) {
    revalidatePath(`/lists/${oldListId}`);
  }
}
export async function getDeletedItems() {
  return db.select()
    .from(items)
    .where(and(eq(items.userId, userId), eq(items.isDeleted, true)))
    .orderBy(desc(items.updatedAt));
}

export async function toggleItemCompletion(id: string, isCompleted: boolean) {
  await db.update(items)
    .set({ isCompleted })
    .where(eq(items.id, id));
  revalidatePath("/", "layout");
}

export async function updateItem(id: string, values: Partial<{ text: string, isCompleted: boolean, dueDate: string | null, isDeleted: boolean, description: string | null, position: number | null }>) {
    console.log("updateItem called", { id, values });
    const result = await db.update(items)
        .set(values)
        .where(eq(items.id, id))
        .returning();
    console.log("updateItem result:", result);
    revalidatePath("/", "layout");
}

export async function reorderItems(updates: { id: string, position: number }[]) {
    // Run updates concurrently
    await Promise.all(
      updates.map(update => 
        db.update(items)
          .set({ position: update.position })
          .where(eq(items.id, update.id))
      )
    );
    revalidatePath("/", "layout");
}

export async function getTodayItems() {
    const today = new Date().toISOString().split('T')[0];
    return db.select()
        .from(items)
        .where(and(like(items.dueDate, `${today}%`), eq(items.userId, userId), eq(items.isDeleted, false)));
}

export async function getAllItems() {
    return db.select({
      item: items,
      list: {
        name: lists.name,
        color: lists.color,
      }
    })
    .from(items)
    .leftJoin(lists, eq(items.listId, lists.id))
    .where(and(eq(items.userId, userId), eq(items.isDeleted, false), eq(items.isCompleted, false)));
}

export async function getScheduledItems() {
    const today = new Date().toISOString().split('T')[0];
    return db.select()
        .from(items)
        .where(and(gte(items.dueDate, today), eq(items.userId, userId), eq(items.isDeleted, false)));
}

export async function getCompletedItems() {
    return db.select()
        .from(items)
        .where(and(eq(items.isCompleted, true), eq(items.userId, userId), eq(items.isDeleted, false)));
}

export async function getItemsCounts() {
  const today = new Date().toISOString().split('T')[0];
  
  const [all] = await db.select({ count: sql<number>`count(*)` }).from(items).where(and(eq(items.userId, userId), eq(items.isDeleted, false)));
  const [todayCount] = await db.select({ count: sql<number>`count(*)` }).from(items).where(and(eq(items.userId, userId), eq(items.isDeleted, false), like(items.dueDate, `${today}%`)));
  const [scheduled] = await db.select({ count: sql<number>`count(*)` }).from(items).where(and(eq(items.userId, userId), eq(items.isDeleted, false), gte(items.dueDate, today)));
  const [completed] = await db.select({ count: sql<number>`count(*)` }).from(items).where(and(eq(items.userId, userId), eq(items.isDeleted, false), eq(items.isCompleted, true)));
  
  return {
    all: all?.count || 0,
    today: todayCount?.count || 0,
    scheduled: scheduled?.count || 0,
    completed: completed?.count || 0,
  };
}

export async function searchItems(query: string) {
  const words = query.trim().split(/\s+/);
  if (words.length === 0) return [];

  const conditions = words.map(word => like(items.text, `%${word}%`));

  return db.select()
    .from(items)
    .where(
      and(
        eq(items.userId, userId),
        eq(items.isDeleted, false),
        ...conditions
      )
    )
    .orderBy(desc(items.createdAt))
    .limit(10);
}
