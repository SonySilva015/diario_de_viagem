import { db } from '@/db';
import { viagem } from '@/db/schemas';
import { desc, eq } from 'drizzle-orm';

/// INSERT - Criar uma nova viagem
export const insertViagem = async (
    title: string,
    dest: string,
    pic: string,
) => {
    const result = await db.insert(viagem).values({
        title: title,
        destination: dest,
        picture: pic,
    }
    ).returning();
    return result[0];
};

// GET - Obter todas as viagens
export const getViagens = async () => {
    return await db
        .select()
        .from(viagem)
        .orderBy(desc(viagem.date));
};

// GET BY ID - Obter viagem por ID
export const getViagemById = async (id: number) => {
    const result = await db.select().from(viagem).where(eq(viagem.id, id));
    return result[0];
};

// UPDATE - Atualizar viagem
export const updateViagem = async (
    id: number,
    title: string,
    dest: string,
    pic: string,
) => {
    const result = await db.update(viagem)
        .set(
            {
                title: title,
                destination: dest,
                picture: pic,
            }
        )
        .where(eq(viagem.id, id))
        .returning();
    return result[0];
};

// DELETE - Remover viagem
export const deleteViagem = async (id: number) => {
    return await db.delete(viagem).where(eq(viagem.id, id));
};