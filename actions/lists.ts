"use server";

import { db } from "@/db";
import { lists } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const userId = "user_1"; // Shim user

export async function createList(name: string, color: string, icon?: string) {
  const [newList] = await db.insert(lists).values({
    name,
    color,
    icon,
    userId,
  }).returning();
  
  revalidatePath("/documents"); // Using skeleton route for now
  return newList;
}

export async function getLists() {
  return db.select()
    .from(lists)
    .where(eq(lists.userId, userId))
    .orderBy(desc(lists.createdAt));
}

export async function getListById(id: string) {
  const [list] = await db.select()
    .from(lists)
    .where(eq(lists.id, id));
  return list || null;
}
