// app/(screens)/diarios/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Importando funções do serviço
import { getAllEntradasComViagem } from '@/service/entradas.service';

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

export default function AllDiariosScreen() {
    const [entradas, setEntradas] = useState<EntradaComViagem[]>([]);
    const [filteredEntradas, setFilteredEntradas] = useState<EntradaComViagem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedViagem, setSelectedViagem] = useState<string | null>(null);
    const [viagensUnicas, setViagensUnicas] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterAndSortEntradas();
    }, [entradas, searchQuery, sortBy, sortOrder, selectedViagem]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getAllEntradasComViagem();
            setEntradas(data);

            // Extrai viagens únicas para filtro
            const viagens = Array.from(new Set(data.map(e => e.viagem_title)));
            setViagensUnicas(viagens);

        } catch (error) {
            console.error('Erro ao carregar diários:', error);
            Alert.alert('Erro', 'Não foi possível carregar os diários');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filterAndSortEntradas = () => {
        let filtered = [...entradas];

        // Filtro por busca
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                entrada =>
                    entrada.title.toLowerCase().includes(query) ||
                    entrada.content.toLowerCase().includes(query) ||
                    entrada.viagem_title.toLowerCase().includes(query) ||
                    entrada.viagem_destination.toLowerCase().includes(query)
            );
        }

        // Filtro por viagem
        if (selectedViagem) {
            filtered = filtered.filter(entrada => entrada.viagem_title === selectedViagem);
        }

        // Ordenação
        filtered.sort((a, b) => {
            if (sortBy === 'date') {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            } else {
                return sortOrder === 'desc'
                    ? b.title.localeCompare(a.title)
                    : a.title.localeCompare(b.title);
            }
        });

        setFilteredEntradas(filtered);
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getTimeAgo = (date: Date) => {
        const now = new Date();
        const entradaDate = new Date(date);
        const diffMs = now.getTime() - entradaDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoje';
        if (diffDays === 1) return 'Ontem';
        if (diffDays < 7) return `${diffDays} dias atrás`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
        return `${Math.floor(diffDays / 365)} anos atrás`;
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedViagem(null);
        setSortBy('date');
        setSortOrder('desc');
    };

    const renderEntradaItem = ({ item }: { item: EntradaComViagem }) => (
        <TouchableOpacity
            style={styles.entradaCard}
            onPress={() => router.push(`/diario/detail/${item.id}`)}
        >
            {/* Imagem */}
            <View style={styles.entradaImageContainer}>
                {item.picture ? (
                    <Image source={{ uri: item.picture }} style={styles.entradaImage} />
                ) : (
                    <View style={styles.entradaImagePlaceholder}>
                        <Ionicons name="book" size={30} color="#e0d8cc" />
                    </View>
                )}
            </View>

            {/* Informações */}
            <View style={styles.entradaContent}>
                <View style={styles.entradaHeader}>
                    <Text style={styles.entradaTitle} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={styles.entradaTimeAgo}>
                        {getTimeAgo(item.date)}
                    </Text>
                </View>

                <Text style={styles.entradaDate}>
                    <Ionicons name="calendar-outline" size={12} color="#8a7d6e" />{' '}
                    {formatDate(item.date)}
                </Text>

                <Text style={styles.entradaPreview} numberOfLines={2}>
                    {item.content}
                </Text>

                <View style={styles.viagemBadge}>
                    {item.viagem_picture ? (
                        <Image
                            source={{ uri: item.viagem_picture }}
                            style={styles.viagemBadgeImage}
                        />
                    ) : (
                        <View style={styles.viagemBadgePlaceholder}>
                            <Ionicons name="airplane" size={12} color="#fff" />
                        </View>
                    )}
                    <Text style={styles.viagemBadgeText} numberOfLines={1}>
                        {item.viagem_title || item.viagem_destination}
                    </Text>
                </View>
            </View>

            {/* Setinha */}
            <Ionicons name="chevron-forward" size={20} color="#e0d8cc" />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b3026" />
                <Text style={styles.loadingText}>Carregando diários...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#3b3026" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Todos os Diários</Text>
                <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
                    <Ionicons name="filter" size={24} color="#3b3026" />
                </TouchableOpacity>
            </View>

            {/* Barra de pesquisa */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#8a7d6e" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar em diários..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    clearButtonMode="while-editing"
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color="#8a7d6e" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Contador e filtros ativos */}
            <View style={styles.infoContainer}>
                <Text style={styles.countText}>
                    {filteredEntradas.length} {filteredEntradas.length === 1 ? 'diário' : 'diários'}
                </Text>
                {(searchQuery || selectedViagem) && (
                    <TouchableOpacity onPress={clearFilters}>
                        <Text style={styles.clearFiltersText}>Limpar filtros</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Lista de diários */}
            <FlatList
                data={filteredEntradas}
                renderItem={renderEntradaItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="book-outline" size={60} color="#e0d8cc" />
                        <Text style={styles.emptyTitle}>
                            {searchQuery || selectedViagem ? 'Nenhum resultado encontrado' : 'Nenhum diário encontrado'}
                        </Text>
                        <Text style={styles.emptyText}>
                            {searchQuery || selectedViagem
                                ? 'Tente ajustar sua busca ou filtros'
                                : 'Comece criando seu primeiro registro de diário'}
                        </Text>
                        {!searchQuery && !selectedViagem && (
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => router.push('/viagens')}
                            >
                                <Text style={styles.emptyButtonText}>Ver viagens</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />

            {/* Modal de Filtros */}
            <Modal
                visible={filterModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filtros e Ordenação</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#3b3026" />
                            </TouchableOpacity>
                        </View>

                        {/* Ordenação */}
                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>Ordenar por</Text>
                            <View style={styles.sortOptions}>
                                <TouchableOpacity
                                    style={[styles.sortOption, sortBy === 'date' && styles.sortOptionActive]}
                                    onPress={() => setSortBy('date')}
                                >
                                    <Ionicons
                                        name="calendar"
                                        size={18}
                                        color={sortBy === 'date' ? '#fff' : '#3b3026'}
                                    />
                                    <Text style={[
                                        styles.sortOptionText,
                                        sortBy === 'date' && styles.sortOptionTextActive
                                    ]}>
                                        Data
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.sortOption, sortBy === 'title' && styles.sortOptionActive]}
                                    onPress={() => setSortBy('title')}
                                >
                                    <Ionicons
                                        name="text"
                                        size={18}
                                        color={sortBy === 'title' ? '#fff' : '#3b3026'}
                                    />
                                    <Text style={[
                                        styles.sortOptionText,
                                        sortBy === 'title' && styles.sortOptionTextActive
                                    ]}>
                                        Título
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.orderButton}
                                onPress={toggleSortOrder}
                            >
                                <Ionicons
                                    name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'}
                                    size={18}
                                    color="#3b3026"
                                />
                                <Text style={styles.orderButtonText}>
                                    {sortOrder === 'desc' ? 'Decrescente' : 'Crescente'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Filtro por Viagem */}
                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>Filtrar por viagem</Text>
                            <View style={styles.viagemOptions}>
                                <TouchableOpacity
                                    style={[
                                        styles.viagemOption,
                                        !selectedViagem && styles.viagemOptionActive
                                    ]}
                                    onPress={() => setSelectedViagem(null)}
                                >
                                    <Text style={[
                                        styles.viagemOptionText,
                                        !selectedViagem && styles.viagemOptionTextActive
                                    ]}>
                                        Todas as viagens
                                    </Text>
                                </TouchableOpacity>
                                {viagensUnicas.map(viagem => (
                                    <TouchableOpacity
                                        key={viagem}
                                        style={[
                                            styles.viagemOption,
                                            selectedViagem === viagem && styles.viagemOptionActive
                                        ]}
                                        onPress={() => setSelectedViagem(viagem)}
                                    >
                                        <Text style={[
                                            styles.viagemOptionText,
                                            selectedViagem === viagem && styles.viagemOptionTextActive
                                        ]}>
                                            {viagem}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Botões do modal */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalButtonSecondary}
                                onPress={clearFilters}
                            >
                                <Text style={styles.modalButtonSecondaryText}>Limpar tudo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButtonPrimary}
                                onPress={() => setFilterModalVisible(false)}
                            >
                                <Text style={styles.modalButtonPrimaryText}>Aplicar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f1e7',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f1e7',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#3b3026',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0d8cc',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#3b3026',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#e0d8cc',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#3b3026',
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    countText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8a7d6e',
    },
    clearFiltersText: {
        fontSize: 14,
        color: '#3b3026',
        fontWeight: '600',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    entradaCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    entradaImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    entradaImage: {
        width: '100%',
        height: '100%',
    },
    entradaImagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f1e7',
    },
    entradaContent: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
    entradaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    entradaTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#3b3026',
        flex: 1,
        marginRight: 8,
    },
    entradaTimeAgo: {
        fontSize: 12,
        color: '#8a7d6e',
        fontWeight: '500',
    },
    entradaDate: {
        fontSize: 12,
        color: '#8a7d6e',
        marginBottom: 6,
    },
    entradaPreview: {
        fontSize: 14,
        color: '#54483d',
        lineHeight: 18,
        marginBottom: 8,
    },
    viagemBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#f8f1e7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    viagemBadgeImage: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 6,
    },
    viagemBadgePlaceholder: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#3b3026',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    viagemBadgeText: {
        fontSize: 12,
        color: '#3b3026',
        fontWeight: '500',
        maxWidth: 120,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#3b3026',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#8a7d6e',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: '#3b3026',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0d8cc',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#3b3026',
    },
    modalSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3b3026',
        marginBottom: 12,
    },
    sortOptions: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    sortOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        marginHorizontal: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0d8cc',
    },
    sortOptionActive: {
        backgroundColor: '#3b3026',
        borderColor: '#3b3026',
    },
    sortOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3b3026',
        marginLeft: 6,
    },
    sortOptionTextActive: {
        color: '#fff',
    },
    orderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0d8cc',
    },
    orderButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3b3026',
        marginLeft: 8,
    },
    viagemOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    viagemOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e0d8cc',
        marginRight: 8,
        marginBottom: 8,
    },
    viagemOptionActive: {
        backgroundColor: '#3b3026',
        borderColor: '#3b3026',
    },
    viagemOptionText: {
        fontSize: 14,
        color: '#3b3026',
    },
    viagemOptionTextActive: {
        color: '#fff',
    },
    modalButtons: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    modalButtonSecondary: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#3b3026',
        alignItems: 'center',
        marginRight: 8,
    },
    modalButtonSecondaryText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3b3026',
    },
    modalButtonPrimary: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#3b3026',
        alignItems: 'center',
        marginLeft: 8,
    },
    modalButtonPrimaryText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});