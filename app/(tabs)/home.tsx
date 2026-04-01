import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Importando funções do serviço (ajuste os caminhos conforme necessário)
import { getRecentEntradasComViagem } from '@/service/entradas.service';
import { getViagens } from '@/service/travell.service';

type Viagem = {
  id: number;
  title: string;
  destination: string;
  start_date: Date;
  end_date: Date;
  picture: string | null;
};

type EntradaDiario = {
  id: number;
  trip_id: number;
  title: string;
  content: string;
  picture: string | null;
  date: Date;
  viagem_title?: string; // Para mostrar o título da viagem relacionada
};

export default function HomeScreen() {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [entradasRecentes, setEntradasRecentes] = useState<EntradaDiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar viagens
      const viagensData = await getViagens();
      setViagens(viagensData);

      // Carregar entradas recentes
      const entradasData = await getRecentEntradasComViagem(5); // Últimas 5 entradas
      setEntradasRecentes(entradasData);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTripDates = (start: Date, end: Date) => {
    const startDate = new Date(start).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short'
    });
    const endDate = new Date(end).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    return `${startDate} – ${endDate}`;
  };

  // Imagem padrão para quando não houver imagem
  const defaultImage = "https://images.unsplash.com/photo-1501785888041-af3ef285b470";

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b3026" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="map-outline" size={28} color="#3b3026" />
          <Text style={styles.headerTitle}>Diário de viagens</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* My Trips */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Minhas viagens</Text>
          <TouchableOpacity onPress={() => router.push('/viagens')}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {viagens.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="airplane-outline" size={40} color="#e0d8cc" />
            <Text style={styles.emptyText}>Nenhuma viagem encontrada</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/(tabs)/viagens')}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Criar Primeira Viagem</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tripsScroll}
          >
            {viagens.map((viagem) => (
              <TouchableOpacity
                key={viagem.id}
                style={styles.tripCard}
                onPress={() => router.push(`/detail/${viagem.id}`)}
              >
                <Image
                  source={{ uri: viagem.picture || defaultImage }}
                  style={styles.tripImage}
                />
                <View style={styles.tripOverlay} />
                <View style={styles.tripInfo}>
                  <Text style={styles.tripTitle} numberOfLines={1}>
                    {viagem.title || viagem.destination}
                  </Text>
                  <Text style={styles.tripDates} numberOfLines={1}>
                    {formatTripDates(viagem.start_date, viagem.end_date)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Recent Entries */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Entradas Recentes</Text>
          <TouchableOpacity onPress={() => router.push('/diario')}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {entradasRecentes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={40} color="#e0d8cc" />
            <Text style={styles.emptyText}>Nenhuma entrada encontrada</Text>
            {viagens.length > 0 && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push(`/diario/${viagens[0].id}`)}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Criar Primeira Entrada</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.entriesContainer}>
            {entradasRecentes.map((entrada) => (
              <TouchableOpacity
                key={entrada.id}
                style={styles.entryCard}
                onPress={() => router.push(`/diario/detail/${entrada.id}`)}
              >
                <Image
                  source={{ uri: entrada.picture || defaultImage }}
                  style={styles.entryImage}
                />
                <View style={styles.entryInfo}>
                  <Text style={styles.entryTitle} numberOfLines={1}>
                    {entrada.title}
                  </Text>
                  <Text style={styles.entryDate} numberOfLines={1}>
                    {formatDate(entrada.date)}
                  </Text>
                  {entrada.viagem_title && (
                    <View style={styles.entryTripBadge}>
                      <Ionicons name="airplane" size={12} color="#8a7d6e" />
                      <Text style={styles.entryTripText} numberOfLines={1}>
                        {entrada.viagem_title}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Stats */}
        {viagens.length > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Estatísticas</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="airplane-outline" size={30} color="#3b3026" />
                <Text style={styles.statNumber}>{viagens.length}</Text>
                <Text style={styles.statLabel}>Viagens</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="book-outline" size={30} color="#3b3026" />
                <Text style={styles.statNumber}>{entradasRecentes.length}</Text>
                <Text style={styles.statLabel}>Entradas</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="images-outline" size={30} color="#3b3026" />
                <Text style={styles.statNumber}>
                  {entradasRecentes.filter(e => e.picture).length}
                </Text>
                <Text style={styles.statLabel}>Fotos</Text>
              </View>
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Floating Action Button */}
      {viagens.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push(`/diario/${viagens[0].id}`)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

/* ---------------------- STYLES ---------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f1e7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f1e7",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#3b3026",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0d8cc",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3b3026",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3b3026",
  },
  seeAll: {
    fontSize: 14,
    color: "#8a7d6e",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#8a7d6e",
    marginTop: 12,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#3b3026",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  tripsScroll: {
    paddingLeft: 20,
    marginBottom: 10,
  },
  tripCard: {
    width: 280,
    height: 180,
    borderRadius: 18,
    overflow: "hidden",
    marginRight: 15,
    position: "relative",
  },
  tripImage: {
    width: "100%",
    height: "100%",
  },
  tripOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  tripInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  tripDates: {
    marginTop: 4,
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
  },
  entriesContainer: {
    paddingHorizontal: 20,
  },
  entryCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
    gap: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  entryImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  entryInfo: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#3b3026",
  },
  entryDate: {
    marginTop: 4,
    color: "#54483d",
    fontSize: 14,
  },
  entryTripBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  entryTripText: {
    fontSize: 12,
    color: "#8a7d6e",
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3b3026",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#8a7d6e",
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#3b3026",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});