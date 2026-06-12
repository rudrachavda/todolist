"use server"

import { db } from "@/db"
import { todos, users } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

const GUEST_ID = "guest-user-123"

// Helper function to ensure the guest user exists in the database
// to prevent Foreign Key Constraint errors when adding todos.
async function ensureGuestExists() {
  const guest = await db.select().from(users).where(eq(users.id, GUEST_ID)).get()
  if (!guest) {
    await db.insert(users).values({
      id: GUEST_ID,
      name: "Guest User",
      email: "guest@example.com",
    })
  }
}

export async function getTodos() {
  await ensureGuestExists()
  return db.select().from(todos).where(eq(todos.userId, GUEST_ID))
}

export async function addTodo(title: string) {
  await ensureGuestExists()
  await db.insert(todos).values({
    title,
    userId: GUEST_ID,
  })
  revalidatePath("/")
}

export async function toggleTodo(id: string, completed: boolean) {
  await ensureGuestExists()
  await db.update(todos).set({ completed }).where(and(eq(todos.id, id), eq(todos.userId, GUEST_ID)))
  revalidatePath("/")
}

export async function deleteTodo(id: string) {
  await ensureGuestExists()
  await db.delete(todos).where(and(eq(todos.id, id), eq(todos.userId, GUEST_ID)))
  revalidatePath("/")
}
