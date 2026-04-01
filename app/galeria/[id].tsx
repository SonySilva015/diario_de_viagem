// app/(screens)/galeria/[id].tsx
import { getEntradasByViagemId } from '@/service/entradas.service';
import { getViagemById } from '@/service/travell.service';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type EntradaDiario = {
    id: number;
    trip_id: number;
    title: string;
    content: string;
    picture: string | null;
    date: Date;
};

export default function GalleryScreen() {
    const { id } = useLocalSearchParams();
    const tripId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id as string);

    const [viagem, setViagem] = useState<any>(null);
    const [entradas, setEntradas] = useState<EntradaDiario[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<'viagem' | 'diarios'>('viagem');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, [tripId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Carrega dados da viagem
            const viagemData = await getViagemById(tripId);
            setViagem(viagemData);

            // Carrega entradas do diário
            const entradasData = await getEntradasByViagemId(tripId);
            setEntradas(entradasData);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados da galeria');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    // Fotos da viagem (imagem principal e outras que você pode ter)
    const viagemPhotos = viagem?.picture ? [viagem.picture] : [];

    // Fotos dos diários (filtra apenas entradas com fotos)
    const diarioPhotos = entradas
        .filter(entrada => entrada.picture)
        .map(entrada => ({
            uri: entrada.picture!,
            title: entrada.title,
            date: entrada.date,
        }));

    const allPhotos = [
        ...viagemPhotos.map(uri => ({ uri, type: 'viagem' as const })),
        ...diarioPhotos.map(item => ({ ...item, type: 'diario' as const })),
    ];

    const openImage = (uri: string) => {
        setSelectedImage(uri);
        setImageModalVisible(true);
    };

    const renderPhotoItem = ({ item }: { item: any }) => {
        if (item.type === 'viagem') {
            return (
                <TouchableOpacity
                    style={styles.photoCard}
                    onPress={() => openImage(item.uri)}
                >
                    <Image source={{ uri: item.uri }} style={styles.photoImage} />
                    <View style={styles.photoBadge}>
                        <Ionicons name="airplane" size={12} color="#fff" />
                        <Text style={styles.badgeText}>Viagem</Text>
                    </View>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    style={styles.photoCard}
                    onPress={() => openImage(item.uri)}
                >
                    <Image source={{ uri: item.uri }} style={styles.photoImage} />
                    <View style={styles.photoInfo}>
                        <View style={[styles.photoBadge, styles.diarioBadge]}>
                            <Ionicons name="book" size={12} color="#fff" />
                            <Text style={styles.badgeText}>Diário</Text>
                        </View>
                        <Text style={styles.photoTitle} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={styles.photoDate}>
                            {new Date(item.date).toLocaleDateString('pt-BR')}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b3026" />
                <Text style={styles.loadingText}>Carregando galeria...</Text>
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
                <Text style={styles.headerTitle}>
                    Galeria - {viagem?.destination || 'Viagem'}
                </Text>
                <TouchableOpacity onPress={() => router.push(`/diario/${tripId}`)}>
                    <Ionicons name="add-circle" size={24} color="#3b3026" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'viagem' && styles.activeTab]}
                    onPress={() => setActiveTab('viagem')}
                >
                    <Ionicons
                        name="airplane"
                        size={20}
                        color={activeTab === 'viagem' ? '#fff' : '#3b3026'}
                    />
                    <Text style={[
                        styles.tabText,
                        activeTab === 'viagem' && styles.activeTabText
                    ]}>
                        Viagem ({viagemPhotos.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'diarios' && styles.activeTab]}
                    onPress={() => setActiveTab('diarios')}
                >
                    <Ionicons
                        name="book"
                        size={20}
                        color={activeTab === 'diarios' ? '#fff' : '#3b3026'}
                    />
                    <Text style={[
                        styles.tabText,
                        activeTab === 'diarios' && styles.activeTabText
                    ]}>
                        Diários ({diarioPhotos.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Conteúdo */}
            <FlatList
                data={activeTab === 'viagem'
                    ? viagemPhotos.map(uri => ({ uri, type: 'viagem' as const }))
                    : diarioPhotos.map(item => ({ ...item, type: 'diario' as const }))
                }
                renderItem={renderPhotoItem}
                keyExtractor={(item, index) => `${item.type}-${index}`}
                numColumns={2}
                columnWrapperStyle={styles.photoRow}
                contentContainerStyle={styles.photoList}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="images-outline" size={60} color="#e0d8cc" />
                        <Text style={styles.emptyTitle}>Nenhuma foto encontrada</Text>
                        <Text style={styles.emptyText}>
                            {activeTab === 'viagem'
                                ? 'Adicione uma foto à sua viagem'
                                : 'Adicione fotos aos seus registros de diário'
                            }
                        </Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => router.push(`/diario/${tripId}`)}
                        >
                            <Ionicons name="add" size={20} color="#fff" />
                            <Text style={styles.addButtonText}>Criar Registro</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* Modal para visualização em tela cheia */}
            <Modal
                visible={imageModalVisible}
                transparent={true}
                onRequestClose={() => setImageModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => setImageModalVisible(false)}
                    >
                        <Ionicons name="close" size={30} color="#fff" />
                    </TouchableOpacity>

                    <ScrollView
                        maximumZoomScale={3}
                        minimumZoomScale={1}
                        contentContainerStyle={styles.modalScrollContent}
                    >
                        <Image
                            source={{ uri: selectedImage || '' }}
                            style={styles.fullScreenImage}
                            resizeMode="contain"
                        />
                    </ScrollView>
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
        flex: 1,
        textAlign: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 8,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: 'transparent',
    },
    activeTab: {
        backgroundColor: '#3b3026',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3b3026',
        marginLeft: 8,
    },
    activeTabText: {
        color: '#fff',
    },
    photoList: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    photoRow: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    photoCard: {
        width: (SCREEN_WIDTH - 30) / 2,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    photoImage: {
        width: '100%',
        height: 150,
    },
    photoInfo: {
        padding: 10,
    },
    photoBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(59, 48, 38, 0.8)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    diarioBadge: {
        backgroundColor: 'rgba(106, 90, 205, 0.8)', // Purple color for diary
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 4,
    },
    photoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3b3026',
        marginTop: 20,
        marginBottom: 4,
    },
    photoDate: {
        fontSize: 12,
        color: '#999',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
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
        paddingHorizontal: 40,
        marginBottom: 24,
    },
    addButton: {
        backgroundColor: '#3b3026',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 4,
    },
    modalScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.8,
    },
});