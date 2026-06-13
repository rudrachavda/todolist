import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const lists = sqliteTable('lists', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    color: text('color'),
    createdAt: integer('createdAt', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
});

export const todos = sqliteTable('todos', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    // The cascade delete ensures if a list goes, its todos go too
    listId: text('listId').references(() => lists.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    notes: text('notes'),
    completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
    dueDate: integer('dueDate', { mode: 'timestamp_ms' }),
    createdAt: integer('createdAt', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
});