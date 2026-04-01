import { db } from '@/db';
import { media } from '@/db/schemas';
import { eq } from 'drizzle-orm';


export const insertMedia = async (
    entry_id: number,
    uri: string,
    description: string,
) => {
    const result = await db.insert(media).values({
        entry_id: entry_id,
        uri: uri,
        description: description,
    }).returning();
    return result[0];
};

/// INSERT MULTIPLE - Adicionar múltiplas mídias de uma vez
export const insertMultipleMedia = async (
    medias: { entry_id: number; uri: string; description?: string }[]
) => {
    const result = await db.insert(media).values(medias).returning();
    return result;
};

// GET - Obter todas as mídias de uma entrada
export const getMediaByEntryId = async (entry_id: number) => {
    return await db.select().from(media)
        .where(eq(media.entry_id, entry_id));
};

// GET BY ID - Obter mídia por ID
export const getMediaById = async (id: number) => {
    const result = await db.select().from(media).where(eq(media.id, id));
    return result[0];
};

// UPDATE - Atualizar mídia
export const updateMedia = async (
    id: number,
    uri: string,
    description: string,
) => {
    const result = await db.update(media)
        .set({
            uri: uri,
            description: description,
        })
        .where(eq(media.id, id))
        .returning();
    return result[0];
};

// UPDATE somente URI
export const updateMediaUri = async (
    id: number,
    uri: string,
) => {
    const result = await db.update(media)
        .set({ uri: uri })
        .where(eq(media.id, id))
        .returning();
    return result[0];
};

// UPDATE somente descrição
export const updateMediaDescricao = async (
    id: number,
    description: string,
) => {
    const result = await db.update(media)
        .set({ description: description })
        .where(eq(media.id, id))
        .returning();
    return result[0];
};

// DELETE - Remover mídia
export const deleteMedia = async (id: number) => {
    return await db.delete(media).where(eq(media.id, id));
};

// DELETE ALL BY ENTRY - Remover todas as mídias de uma entrada
export const deleteMediaByEntryId = async (entry_id: number) => {
    return await db.delete(media).where(eq(media.entry_id, entry_id));
};