import { pgTable, text, serial, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').unique().notNull(),
    name: text('name'),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
    id: text('id').primaryKey(),
    userId: serial('user_id').references(() => users.id),
    expiresAt: timestamp('expires_at').notNull(),
});

export const conversations = pgTable('conversations', {
    id: serial('id').primaryKey(),
    userId: serial('user_id').references(() => users.id),
    title: text('title'),
    createdAt: timestamp('created_at').defaultNow(),
    messages: jsonb('messages'),
});

export const memories = pgTable('memories', {
    id: serial('id').primaryKey(),
    userId: serial('user_id').references(() => users.id),
    content: text('content').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
});
