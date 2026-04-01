import { db } from '@/db';
import { user } from '@/db/schemas';
import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  useEffect(() => {
    const bootstrap = async () => {
      try {
        // 🔒 pequena garantia extra
        await new Promise(res => setTimeout(res, 300));

        const result = await db
          .select()
          .from(user)
          .limit(1)
          .all();

        const hasUser = result.length > 0;

        setTimeout(() => {
          router.replace(hasUser ? "/(tabs)/home" : "/cadastro");
        }, 2000);

      } catch (error) {
        console.error("Erro ao verificar usuário:", error);
        router.replace("/cadastro");
      }
    };

    bootstrap();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diário de Viagens</Text>
      <Text style={styles.subtitle}>Registre suas aventuras ✈️</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3b3026", // cor do seu tema
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#d8b4fe",
    fontSize: 16,
    marginTop: 8,
  },
});