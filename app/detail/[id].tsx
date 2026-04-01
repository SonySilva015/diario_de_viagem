import { deleteEntradaDiario, getEntradasByViagemId } from '@/service/entradas.service';
import { getViagemById } from '@/service/travell.service';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from "expo-router";
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

// Interface para o diário - atualizada com o campo picture
interface DiaryEntry {
    id: number;
    trip_id: number;
    title: string | null;
    content: string;
    date: string;
    picture?: string; // Novo campo adicionado
}

// Interface para a viagem
interface Trip {
    id: number;
    title: string;
    destination: string;
    picture: string;
    created_at?: string;
    diary?: DiaryEntry[];
}

export default function TripDetailsScreen() {
    const { id } = useLocalSearchParams();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingDiaryId, setDeletingDiaryId] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            loadTrip();
        }
    }, [id]);

    const loadTrip = async () => {
        try {
            setLoading(true);
            const tripId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id as string);

            console.log('🔄 Carregando viagem ID:', tripId);

            // Buscar viagem do banco de dados
            const tripData = await getViagemById(tripId);
            console.log('✅ Dados da viagem:', tripData);

            if (tripData) {
                // Buscar diários reais do banco
                const diarios = await getEntradasByViagemId(tripId);
                console.log('📝 Diários encontrados:', diarios);

                const tripWithDiary: Trip = {
                    ...tripData,
                    diary: diarios.map(d => ({
                        id: d.id,
                        trip_id: d.trip_id,
                        title: d.title || 'Registro sem título',
                        content: d.content,
                        date: d.date || new Date().toISOString(),
                        picture: d.picture // Inclui a imagem se existir
                    }))
                };

                setTrip(tripWithDiary);
            } else {

                Alert.alert('Erro', 'Viagem não encontrada');
            }
        } catch {

            Alert.alert('Erro', 'Não foi possível carregar os detalhes da viagem');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadTrip();
    };

    function openAddDiary() {
        if (!trip) return;
        router.push(`/diario/${trip.id}`);
    }

    function openGallery() {
        if (!trip) return;
        router.push(`/galeria/${trip.id}`);
    }

    function openEditTrip() {
        if (!trip) return;
        router.push(`/edit/${trip.id}`);
    }

    async function deleteDiaryEntry(diaryId: number) {
        Alert.alert(
            'Excluir Registro',
            'Tem certeza que deseja excluir este registro do diário?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setDeletingDiaryId(diaryId);
                            // Excluir do banco de dados
                            await deleteEntradaDiario(diaryId);

                            // Atualizar o estado local
                            if (trip && trip.diary) {
                                const updatedDiary = trip.diary.filter(item => item.id !== diaryId);
                                setTrip({ ...trip, diary: updatedDiary });
                                Alert.alert('Sucesso', 'Registro excluído com sucesso!');
                            }
                        } catch (error) {
                            console.error('Erro ao excluir registro:', error);
                            Alert.alert('Erro', 'Não foi possível excluir o registro');
                        } finally {
                            setDeletingDiaryId(null);
                        }
                    }
                }
            ]
        );
    }

    function viewDiaryDetails(diaryId: number) {
        if (!trip) return;
        router.push(`/diario/detail/${diaryId}`);
    }

    function viewDiaryImage(diary: DiaryEntry) {
        if (!diary.picture) return;


    }

    // Função para formatar a data do SQLite
    function formatSQLiteDate(dateString: string) {
        if (!dateString) return 'Data não informada';

        try {
            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                const timestamp = parseInt(dateString);
                if (!isNaN(timestamp)) {
                    const dateFromTimestamp = new Date(timestamp);
                    return dateFromTimestamp.toLocaleDateString('pt-AO');
                }
                return 'Data inválida';
            }

            return date.toLocaleDateString('pt-AO', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b3026" />
                <Text style={styles.loadingText}>Carregando detalhes da viagem...</Text>
            </View>
        );
    }

    if (!trip) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="sad-outline" size={60} color="#ccc" />
                <Text style={styles.emptyTitle}>Viagem não encontrada</Text>
                <Text style={styles.emptyText}>
                    A viagem que você está procurando não existe ou foi removida.
                </Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#3b3026']}
                    tintColor="#3b3026"
                />
            }
            showsVerticalScrollIndicator={false}
        >
            {/* Header com imagem */}
            <View style={styles.header}>
                <Image
                    source={{ uri: trip.picture }}
                    style={styles.coverImage}
                    resizeMode="cover"
                />
                <View style={styles.overlay} />

            </View>

            {/* Informações da viagem */}
            <View style={styles.content}>
                <View style={styles.tripHeader}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{trip.title}</Text>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={openEditTrip}
                        >
                            <Ionicons name="create-outline" size={20} color="#3b3026" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={18} color="#54483d" />
                        <Text style={styles.destination}>{trip.destination}</Text>
                    </View>

                    {trip.created_at && (
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={18} color="#54483d" />
                            <Text style={styles.date}>
                                Criada em: {formatSQLiteDate(trip.created_at)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Botões de ação */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.primaryButton]}
                        onPress={openAddDiary}
                    >
                        <Ionicons name="journal-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Adicionar Diário</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.secondaryButton]}
                        onPress={openGallery}
                    >
                        <Ionicons name="images-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Ver Galeria</Text>
                    </TouchableOpacity>
                </View>

                {/* Seção de Diários */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Registros do Diário</Text>
                        <Text style={styles.sectionCount}>
                            {trip.diary?.length || 0} registros
                        </Text>
                    </View>

                    {trip.diary && trip.diary.length > 0 ? (
                        trip.diary.map((item) => (
                            <View key={item.id} style={styles.diaryCard}>
                                {/* Imagem do diário (se existir) */}
                                {item.picture && (
                                    <TouchableOpacity
                                        onPress={() => viewDiaryImage(item)}
                                        activeOpacity={0.7}
                                    >
                                        <Image
                                            source={{ uri: item.picture }}
                                            style={styles.diaryImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.imageOverlay}>
                                            <Ionicons name="expand" size={24} color="#fff" />
                                        </View>
                                    </TouchableOpacity>
                                )}

                                <View style={[
                                    styles.diaryContent,
                                    !item.picture && { paddingTop: 16 }
                                ]}>
                                    <View style={styles.diaryHeader}>
                                        <Text style={styles.diaryTitle}>
                                            {item.title}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => deleteDiaryEntry(item.id)}
                                            style={styles.deleteButton}
                                            disabled={deletingDiaryId === item.id}
                                        >
                                            {deletingDiaryId === item.id ? (
                                                <ActivityIndicator size="small" color="#ff3b30" />
                                            ) : (
                                                <Ionicons name="trash-outline" size={18} color="#ff3b30" />
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.diaryDate}>
                                        <Ionicons name="time-outline" size={14} color="#999" />{' '}
                                        {formatSQLiteDate(item.date)}
                                    </Text>

                                    <Text style={styles.diaryText} numberOfLines={3}>
                                        {item.content}
                                    </Text>

                                    <View style={styles.diaryFooter}>
                                        <TouchableOpacity
                                            style={styles.readMoreButton}
                                            onPress={() => viewDiaryDetails(item.id)}
                                        >
                                            <Text style={styles.readMoreText}>Ler mais</Text>
                                            <Ionicons name="chevron-forward" size={14} color="#3b3026" />
                                        </TouchableOpacity>

                                        {item.picture && (
                                            <TouchableOpacity
                                                style={styles.viewImageButton}
                                                onPress={() => viewDiaryImage(item)}
                                            >
                                                <Ionicons name="image" size={14} color="#3b3026" />
                                                <Text style={styles.viewImageText}>Ver imagem</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyDiary}>
                            <Ionicons name="journal-outline" size={50} color="#e0d8cc" />
                            <Text style={styles.emptyDiaryTitle}>Nenhum registro ainda</Text>
                            <Text style={styles.emptyDiaryText}>
                                Comece a documentar suas experiências nesta viagem!
                            </Text>
                            <TouchableOpacity
                                style={styles.emptyDiaryButton}
                                onPress={openAddDiary}
                            >
                                <Text style={styles.emptyDiaryButtonText}>Criar Primeiro Registro</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Informações adicionais */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Informações da Viagem</Text>

                    <View style={styles.infoItem}>
                        <Ionicons name="flag-outline" size={18} color="#3b3026" />
                        <Text style={styles.infoLabel}>Destino:</Text>
                        <Text style={styles.infoValue}>{trip.destination}</Text>
                    </View>

                    {trip.created_at && (
                        <View style={styles.infoItem}>
                            <Ionicons name="calendar-outline" size={18} color="#3b3026" />
                            <Text style={styles.infoLabel}>Data de criação:</Text>
                            <Text style={styles.infoValue}>
                                {formatSQLiteDate(trip.created_at)}
                            </Text>
                        </View>
                    )}

                    <View style={styles.infoItem}>
                        <Ionicons name="book-outline" size={18} color="#3b3026" />
                        <Text style={styles.infoLabel}>Registros no diário:</Text>
                        <Text style={styles.infoValue}>{trip.diary?.length || 0}</Text>
                    </View>

                    {/* Estatísticas de fotos */}
                    <View style={styles.infoItem}>
                        <Ionicons name="camera-outline" size={18} color="#3b3026" />
                        <Text style={styles.infoLabel}>Fotos no diário:</Text>
                        <Text style={styles.infoValue}>
                            {trip.diary?.filter(d => d.picture).length || 0}
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

/* ---------------------- ESTILOS ---------------------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f1e7",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f1e7',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#3b3026',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f1e7',
        padding: 20,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#3b3026',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#54483d',
        textAlign: 'center',
        marginBottom: 24,
    },
    backButton: {
        backgroundColor: '#3b3026',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        position: 'relative',
        height: 250,
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    backButtonFloating: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    tripHeader: {
        marginBottom: 20,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#3b3026',
        flex: 1,
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0d8cc',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    destination: {
        fontSize: 16,
        color: '#54483d',
        marginLeft: 8,
        fontWeight: '500',
    },
    date: {
        fontSize: 14,
        color: '#54483d',
        marginLeft: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 30,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 10,
        gap: 8,
    },
    primaryButton: {
        backgroundColor: '#3b3026',
    },
    secondaryButton: {
        backgroundColor: '#774c08',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#3b3026',
    },
    sectionCount: {
        fontSize: 14,
        color: '#999',
        backgroundColor: '#e0d8cc',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    diaryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0d8cc',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
    },
    diaryImage: {
        width: '100%',
        height: 180,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    diaryContent: {
        padding: 16,
        paddingTop: 0,
    },
    diaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 12,
    },
    diaryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#3b3026',
        flex: 1,
    },
    deleteButton: {
        padding: 4,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    diaryDate: {
        fontSize: 14,
        color: '#999',
        marginBottom: 12,
    },
    diaryText: {
        fontSize: 15,
        color: '#54483d',
        lineHeight: 22,
        marginBottom: 16,
    },
    diaryFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    readMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    readMoreText: {
        fontSize: 14,
        color: '#3b3026',
        fontWeight: '500',
    },
    viewImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f8f1e7',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
    },
    viewImageText: {
        fontSize: 12,
        color: '#3b3026',
        fontWeight: '500',
    },
    emptyDiary: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e0d8cc',
        borderStyle: 'dashed',
    },
    emptyDiaryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#3b3026',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDiaryText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginBottom: 20,
    },
    emptyDiaryButton: {
        backgroundColor: '#3b3026',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    emptyDiaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    infoSection: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0d8cc',
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#3b3026',
        marginBottom: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 15,
        color: '#54483d',
        fontWeight: '600',
        marginLeft: 8,
        marginRight: 8,
        minWidth: 120,
    },
    infoValue: {
        fontSize: 15,
        color: '#3b3026',
        flex: 1,
    },
});