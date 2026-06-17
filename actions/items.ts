"use server";

import { db } from "@/db";
import { items } from "@/db/schema";
import { eq, and, gte, lte, or, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const userId = "user_1"; // Shim user

export async function createItem(text: string, listId?: string, dueDate?: string) {
  const [newItem] = await db.insert(items).values({
    text,
    listId,
    dueDate,
    userId,
  }).returning();
  
  revalidatePath("/documents");
  return newItem;
}

export async function getItemsByList(listId: string) {
  return db.select()
    .from(items)
    .where(and(eq(items.listId, listId), eq(items.userId, userId)))
    .orderBy(desc(items.createdAt));
}

export async function toggleItemCompletion(id: boolean, isCompleted: boolean) {
  // Fix: id should be string, boolean was a typo in thoughts
}

export async function updateItem(id: string, values: Partial<{ text: string, isCompleted: boolean, dueDate: string }>) {
    await db.update(items)
        .set(values)
        .where(eq(items.id, id));
    revalidatePath("/documents");
}

export async function getTodayItems() {
    const today = new Date().toISOString().split('T')[0];
    return db.select()
        .from(items)
        .where(and(eq(items.dueDate, today), eq(items.userId, userId)));
}

export async function getAllItems() {
    return db.select()
        .from(items)
        .where(eq(items.userId, userId));
}

export async function getScheduledItems() {
    const today = new Date().toISOString().split('T')[0];
    return db.select()
        .from(items)
        .where(and(gte(items.dueDate, today), eq(items.userId, userId)));
}

export async function getCompletedItems() {
    return db.select()
        .from(items)
        .where(and(eq(items.isCompleted, true), eq(items.userId, userId)));
}
