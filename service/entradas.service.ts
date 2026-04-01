import { db } from '@/db';
import { entraDiario, viagem } from '@/db/schemas';
import { desc, eq } from 'drizzle-orm';


type EntradaDiario = {
    id: number;
    trip_id: number;
    title: string | null;
    content: string;
    picture: string | null;
    date: Date;
};

// em entradas.service.ts
export const insertEntradaDiario = async (
    trip_id: number,
    title: string,
    content: string,
    picture?: string // Adicione o parâmetro opcional
) => {
    const result = await db.insert(entraDiario).values({
        trip_id: trip_id,
        title: title,
        content: content,
        picture: picture || null, // Adicione o campo picture
    }).returning();
    return result[0];
};


// GET - Obter todas as entradas de uma viagem
export const getEntradasByViagemId = async (trip_id: number) => {
    return await db.select().from(entraDiario)
        .where(eq(entraDiario.trip_id, trip_id))
        .orderBy(desc(entraDiario.date));
};

// GET BY ID - Obter entrada por ID
export const getEntradaById = async (id: number): Promise<EntradaDiario> => {
    const result = await db.select().from(entraDiario).where(eq(entraDiario.id, id));
    return result[0];
};

// GET COMPLETE - Obter entrada com dados da viagem (com JOIN)
export const getEntradaCompleta = async (id: number) => {
    const result = await db.select({
        entrada: entraDiario,
        viagem: viagem
    })
        .from(entraDiario)
        .innerJoin(viagem, eq(entraDiario.trip_id, viagem.id))
        .where(eq(entraDiario.id, id));

    return result[0];
};

// UPDATE - Atualizar entrada de diário
export const updateEntradaDiario = async (
    id: number,
    title: string,
    content: string,
) => {
    const result = await db.update(entraDiario)
        .set({
            title: title,
            content: content,
        })
        .where(eq(entraDiario.id, id))
        .returning();
    return result[0];
};

// UPDATE somente título
export const updateEntradaTitulo = async (
    id: number,
    title: string,
) => {
    const result = await db.update(entraDiario)
        .set({ title: title })
        .where(eq(entraDiario.id, id))
        .returning();
    return result[0];
};

// UPDATE somente conteúdo
export const updateEntradaConteudo = async (
    id: number,
    content: string,
) => {
    const result = await db.update(entraDiario)
        .set({ content: content })
        .where(eq(entraDiario.id, id))
        .returning();
    return result[0];
};

// DELETE - Remover entrada de diário
export const deleteEntradaDiario = async (id: number) => {
    return await db.delete(entraDiario).where(eq(entraDiario.id, id));
};



export const getRecentEntradasComViagem = async (limit: number = 5) => {
    return await db
        .select({
            id: entraDiario.id,
            trip_id: entraDiario.trip_id,
            title: entraDiario.title,
            content: entraDiario.content,
            picture: entraDiario.picture,
            date: entraDiario.date,
            viagem_title: viagem.title, // ou viagem.destination
        })
        .from(entraDiario)
        .innerJoin(viagem, eq(entraDiario.trip_id, viagem.id))
        .orderBy(desc(entraDiario.date))
        .limit(limit);
};

type EntradaComViagem = {
    id: number;
    trip_id: number;
    title: string;
    content: string;
    picture: string | null;
    date: Date;
    viagem_title: string;
    viagem_destination: string;
    viagem_picture: string | null;
};
// service/entradas.service.ts
export const getAllEntradasComViagem = async (): Promise<EntradaComViagem[]> => {
    const all = await db
        .select({
            id: entraDiario.id,
            trip_id: entraDiario.trip_id,
            title: entraDiario.title,
            content: entraDiario.content,
            picture: entraDiario.picture,
            date: entraDiario.date,
            viagem_title: viagem.title,
            viagem_destination: viagem.destination,
            viagem_picture: viagem.picture,
        })
        .from(entraDiario)
        .innerJoin(viagem, eq(entraDiario.trip_id, viagem.id))
        .orderBy(desc(entraDiario.date));

    return all
};


