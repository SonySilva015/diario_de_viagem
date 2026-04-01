import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';


export const user = sqliteTable("user", {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    local: text('local'),
    desc: text('desc'),
    picture: text('picture')
});


// Tabela de viagens
export const viagem = sqliteTable('viagem', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    destination: text('destination'),
    picture: text('picture'),
    date: text('date').default(sql`CURRENT_TIMESTAMP`),
});

// Tabela de entradas do diário
export const entraDiario = sqliteTable('diary_entries', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    trip_id: integer('trip_id').notNull().references(() => viagem.id, { onDelete: 'cascade' }),
    picture: text('picture'),
    title: text('title'),
    content: text('content').notNull(),
    date: text('date').default(sql`CURRENT_TIMESTAMP`),
});

// Tabela de fotos ou mídias
export const media = sqliteTable('media', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    entry_id: integer('entry_id').notNull().references(() => entraDiario.id, { onDelete: 'cascade' }),
    uri: text('uri').notNull(),
    description: text('description'),
});
