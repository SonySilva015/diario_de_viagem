
import { Stack } from "expo-router";
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { db } from '../db';
import migrations from '../drizzle/migrations';

import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

const Viagens = () => {
  const { success, error } = useMigrations(db, migrations);


  if (!success && !error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Erro de migração: {error.message}</Text>
      </View>
    );
  }
  return (

    <Stack
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="settings"
        options={{ title: 'configurações', headerShown: true }}
      />
      <Stack.Screen
        name="detail/[id]"
        options={{ title: 'detalhes da viagem', headerShown: true }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{ title: 'editar viagem', headerShown: true }}
      />
      <Stack.Screen
        name="diario/[id]/diario"
        options={{ title: 'diário da viagem', headerShown: true }}
      />

      <Stack.Screen
        name="galeria/[id]"
        options={{ title: 'galeria da viagem', headerShown: false }}
      />

    </Stack>
  )
}

export default Viagens 