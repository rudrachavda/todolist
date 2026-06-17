"use server";

import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createDocument(title: string, parentDocument?: string) {
  // Hardcoded user for now until NextAuth is fully wired up
  const userId = "user_1"; 
  
  const [newDoc] = await db.insert(documents).values({
    title,
    userId,
    parentDocument,
  }).returning();
  
  revalidatePath("/documents");
  return newDoc.id;
}

export async function getSidebarDocuments(parentDocument?: string) {
  const userId = "user_1";
  
  return db.select()
    .from(documents)
    .where(
      and(
        eq(documents.userId, userId),
        parentDocument ? eq(documents.parentDocument, parentDocument) : isNull(documents.parentDocument),
        eq(documents.isArchived, false)
      )
    )
    .orderBy(desc(documents.createdAt));
}

export async function archiveDocument(id: string) {
  const userId = "user_1";
  
  await db.update(documents)
    .set({ isArchived: true })
    .where(and(eq(documents.id, id), eq(documents.userId, userId)));
    
  revalidatePath("/documents");
}

export async function updateDocument(id: string, values: Partial<{ title: string, content: string, icon: string, coverImage: string, isPublished: boolean }>) {
  const userId = "user_1";
  
  await db.update(documents)
    .set(values)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)));
    
  revalidatePath(`/documents/${id}`);
}

export async function getDocumentById(id: string) {
  const userId = "user_1";
  const [doc] = await db.select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)));
    
  return doc || null;
}
