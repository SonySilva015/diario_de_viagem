// hooks/useUser.ts
import { getUserById } from '@/service/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export interface User {
    id: number;
    name: string;
    email: string;
    local?: string;
    desc?: string;
    picture?: string;
}

export default function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userJson = await AsyncStorage.getItem('currentUser');
            if (userJson) {
                const localUser = JSON.parse(userJson);

                // Busca dados atualizados do banco
                const dbUser = await getUserById(localUser.id);
                if (dbUser) {
                    setUser(dbUser);
                    // Atualiza storage com dados do banco
                    await AsyncStorage.setItem('currentUser', JSON.stringify(dbUser));
                } else {
                    // Se não encontrou no banco, usa os dados locais
                    setUser(localUser);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (updatedUser: User) => {
        try {
            await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('currentUser');
            setUser(null);
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    return {
        user,
        loading,
        updateUser,
        logout,
        reload: loadUser,
        isLoggedIn: !!user
    };
}