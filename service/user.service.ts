import { db } from '@/db';
import { user } from '@/db/schemas';
import { eq } from 'drizzle-orm';

/// INSERT - Criar um novo usuário
export const insertUser = async (
    name: string,
    email: string,
    local?: string,
    desc?: string,
    picture?: string
) => {
    const result = await db.insert(user).values({
        name: name,
        email: email,
        local: local,
        desc: desc,
        picture: picture
    }).returning();
    return result[0];
};



// GET BY ID - Obter usuário por ID
export const getUserById = async (id: number) => {
    const result = await db.select().from(user).where(eq(user.id, id));
    return result[0];
};


// UPDATE - Atualizar usuário completo
export const updateUser = async (
    id: number,
    name: string,
    email: string,
    local?: string,
    desc?: string,
    picture?: string
) => {
    const result = await db.update(user)
        .set({
            name: name,
            email: email,
            local: local,
            desc: desc,
            picture: picture
        })
        .where(eq(user.id, id))
        .returning();
    return result[0];
};









