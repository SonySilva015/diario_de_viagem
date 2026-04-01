// app/(screens)/entrada/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Importando funções do serviço
import { deleteEntradaDiario, getEntradaById, updateEntradaDiario } from '@/service/entradas.service';
import { getViagemById } from '@/service/travell.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type EntradaDiario = {
    id: number;
    trip_id: number;
    title: string;
    content: string;
    picture: string | null;
    date: Date;
};

type Viagem = {
    id: number;
    title: string;
    destination: string;
    picture: string | null;
};

export default function EntradaDetailScreen() {
    const { id } = useLocalSearchParams();
    const entradaId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id as string);

    const [entrada, setEntrada] = useState<EntradaDiario | null>(null);
    const [viagem, setViagem] = useState<Viagem | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Estados para edição
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editPicture, setEditPicture] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [entradaId]);

    useEffect(() => {
        if (entrada && editModalVisible) {
            setEditTitle(entrada.title);
            setEditContent(entrada.content);
            setEditPicture(entrada.picture);
        }
    }, [entrada, editModalVisible]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Carrega dados da entrada
            const entradaData = await getEntradaById(entradaId);
            setEntrada(entradaData);

            // Carrega dados da viagem relacionada
            if (entradaData) {
                const viagemData = await getViagemById(entradaData.trip_id);
                setViagem(viagemData);
            }

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados do diário');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleShare = async () => {
        try {
            if (!entrada) return;

            const message = `📖 *${entrada.title}*\n\n${entrada.content}\n\n_${formatDate(entrada.date)}_`;

            const result = await Share.share({
                message: entrada.picture
                    ? `${message}\n\n📸 Inclui foto!`
                    : message,
                title: entrada.title,
            });

            if (result.action === Share.sharedAction) {
                console.log('Compartilhado com sucesso');
            }
        } catch (error) {
            console.error('Erro ao compartilhar:', error);
            Alert.alert('Erro', 'Não foi possível compartilhar este diário');
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para selecionar uma imagem.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
                allowsEditing: true,
                aspect: [4, 3],
            });

            if (!result.canceled && result.assets[0]) {
                setEditPicture(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Erro ao selecionar imagem:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem');
        }
    };

    const handleSaveEdit = async () => {
        if (!editTitle.trim()) {
            Alert.alert('Campo obrigatório', 'Por favor, digite um título para o registro');
            return;
        }

        if (!editContent.trim()) {
            Alert.alert('Campo obrigatório', 'Por favor, escreva o conteúdo do diário');
            return;
        }

        setIsSaving(true);
        try {
            await updateEntradaDiario(
                entradaId,
                editTitle.trim(),
                editContent.trim(),
                editPicture || undefined
            );

            // Atualiza os dados locais
            if (entrada) {
                setEntrada({
                    ...entrada,
                    title: editTitle.trim(),
                    content: editContent.trim(),
                    picture: editPicture,
                });
            }

            Alert.alert('Sucesso', 'Diário atualizado com sucesso!');
            setEditModalVisible(false);
        } catch (error) {
            console.error('Erro ao atualizar diário:', error);
            Alert.alert('Erro', 'Não foi possível atualizar o diário');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);

            await deleteEntradaDiario(entradaId);

            Alert.alert(
                'Sucesso',
                'Diário excluído com sucesso!',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back()
                    }
                ]
            );

        } catch (error) {
            console.error('Erro ao excluir:', error);
            Alert.alert('Erro', 'Não foi possível excluir o diário');
        } finally {
            setIsDeleting(false);
            setDeleteModalVisible(false);
        }
    };

    const hasChanges = () => {
        if (!entrada) return false;
        return editTitle !== entrada.title ||
            editContent !== entrada.content ||
            editPicture !== entrada.picture;
    };

    const handleCancelEdit = () => {
        if (hasChanges()) {
            Alert.alert(
                'Descartar alterações',
                'Você tem alterações não salvas. Deseja descartá-las?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Descartar',
                        style: 'destructive',
                        onPress: () => setEditModalVisible(false)
                    }
                ]
            );
        } else {
            setEditModalVisible(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b3026" />
                <Text style={styles.loadingText}>Carregando diário...</Text>
            </SafeAreaView>
        );
    }

    if (!entrada) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={60} color="#e0d8cc" />
                <Text style={styles.errorTitle}>Diário não encontrado</Text>
                <Text style={styles.errorText}>
                    O diário que você está procurando não existe ou foi removido.
                </Text>
                <TouchableOpacity
                    style={styles.errorButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.errorButtonText}>Voltar</Text>
                </TouchableOpacity>
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

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.headerActionButton}
                        onPress={handleShare}
                    >
                        <Ionicons name="share-outline" size={20} color="#3b3026" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.headerActionButton}
                        onPress={() => setEditModalVisible(true)}
                    >
                        <Ionicons name="create-outline" size={20} color="#3b3026" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.headerActionButton}
                        onPress={() => setDeleteModalVisible(true)}
                    >
                        <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Cabeçalho do diário */}
                <View style={styles.headerContent}>
                    <Text style={styles.dateText}>
                        <Ionicons name="calendar-outline" size={16} color="#8a7d6e" />{' '}
                        {formatDate(entrada.date)}
                    </Text>

                    <Text style={styles.title}>{entrada.title}</Text>

                    {viagem && (
                        <TouchableOpacity
                            style={styles.viagemLink}
                            onPress={() => router.push(`/detail/${viagem.id}`)}
                        >
                            <View style={styles.viagemInfo}>
                                {viagem.picture ? (
                                    <Image
                                        source={{ uri: viagem.picture }}
                                        style={styles.viagemImage}
                                    />
                                ) : (
                                    <View style={styles.viagemImagePlaceholder}>
                                        <Ionicons name="airplane" size={14} color="#fff" />
                                    </View>
                                )}
                                <Text style={styles.viagemTitle}>
                                    {viagem.title || viagem.destination}
                                </Text>
                                <Ionicons name="chevron-forward" size={16} color="#8a7d6e" />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Imagem do diário */}
                {entrada.picture && (
                    <TouchableOpacity
                        style={styles.imageContainer}
                        onPress={() => setImageModalVisible(true)}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={{ uri: entrada.picture }}
                            style={styles.image}
                        />
                        <View style={styles.imageOverlay}>
                            <Ionicons name="expand" size={24} color="#fff" />
                        </View>
                    </TouchableOpacity>
                )}

                {/* Conteúdo do diário */}
                <View style={styles.contentContainer}>
                    <Text style={styles.content}>{entrada.content}</Text>

                    {/* Metadata */}
                    <View style={styles.metadata}>
                        <View style={styles.metadataItem}>
                            <Ionicons name="document-text-outline" size={16} color="#8a7d6e" />
                            <Text style={styles.metadataText}>
                                {entrada.content.length} caracteres
                            </Text>
                        </View>

                        <View style={styles.metadataItem}>
                            <Ionicons name="time-outline" size={16} color="#8a7d6e" />
                            <Text style={styles.metadataText}>
                                Criado em {new Date(entrada.date).toLocaleDateString('pt-BR')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Ações */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setEditModalVisible(true)}
                    >
                        <Ionicons name="create-outline" size={20} color="#3b3026" />
                        <Text style={styles.actionButtonText}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleShare}
                    >
                        <Ionicons name="share-outline" size={20} color="#3b3026" />
                        <Text style={styles.actionButtonText}>Compartilhar</Text>
                    </TouchableOpacity>
                </View>

                {/* Espaço no final */}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Modal de visualização de imagem */}
            <Modal
                visible={imageModalVisible}
                transparent={true}
                onRequestClose={() => setImageModalVisible(false)}
            >
                <View style={styles.imageModalContainer}>
                    <TouchableOpacity
                        style={styles.imageModalClose}
                        onPress={() => setImageModalVisible(false)}
                    >
                        <Ionicons name="close" size={30} color="#fff" />
                    </TouchableOpacity>

                    <Image
                        source={{ uri: entrada.picture || '' }}
                        style={styles.fullImage}
                        resizeMode="contain"
                    />
                </View>
            </Modal>

            {/* Modal de confirmação de exclusão */}
            <Modal
                visible={deleteModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.deleteModalOverlay}>
                    <View style={styles.deleteModalContent}>
                        <View style={styles.deleteModalHeader}>
                            <Ionicons name="warning" size={40} color="#ff9500" />
                            <Text style={styles.deleteModalTitle}>Excluir Diário</Text>
                            <Text style={styles.deleteModalText}>
                                Tem certeza que deseja excluir este diário?
                                Esta ação não pode ser desfeita.
                            </Text>
                        </View>

                        <View style={styles.deleteModalButtons}>
                            <TouchableOpacity
                                style={styles.deleteModalCancel}
                                onPress={() => setDeleteModalVisible(false)}
                                disabled={isDeleting}
                            >
                                <Text style={styles.deleteModalCancelText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.deleteModalConfirm, isDeleting && styles.deleteModalDisabled]}
                                onPress={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.deleteModalConfirmText}>Excluir</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de Edição */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCancelEdit}
            >
                <KeyboardAvoidingView
                    style={styles.editModalContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.editModalContent}>
                        {/* Header do modal */}
                        <View style={styles.editModalHeader}>
                            <TouchableOpacity
                                onPress={handleCancelEdit}
                                disabled={isSaving}
                            >
                                <Ionicons name="close" size={24} color="#3b3026" />
                            </TouchableOpacity>
                            <Text style={styles.editModalTitle}>Editar Diário</Text>
                            <TouchableOpacity
                                onPress={handleSaveEdit}
                                disabled={isSaving || !hasChanges()}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#3b3026" />
                                ) : (
                                    <Text style={[
                                        styles.editModalSave,
                                        !hasChanges() && styles.editModalSaveDisabled
                                    ]}>
                                        Salvar
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.editModalScroll}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Seletor de imagem */}
                            <TouchableOpacity
                                style={styles.editImagePicker}
                                onPress={pickImage}
                                disabled={isSaving}
                            >
                                {editPicture ? (
                                    <View style={styles.editImageWithActions}>
                                        <Image
                                            source={{ uri: editPicture }}
                                            style={styles.editPreviewImage}
                                        />
                                        <View style={styles.editImageActions}>
                                            <TouchableOpacity
                                                style={styles.editImageActionButton}
                                                onPress={pickImage}
                                                disabled={isSaving}
                                            >
                                                <Ionicons name="camera" size={18} color="#fff" />
                                                <Text style={styles.editImageActionText}>Trocar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.editImageActionButton, styles.editRemoveButton]}
                                                onPress={() => setEditPicture(null)}
                                                disabled={isSaving}
                                            >
                                                <Ionicons name="trash" size={18} color="#fff" />
                                                <Text style={styles.editImageActionText}>Remover</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.editImagePlaceholder}>
                                        <Ionicons name="camera" size={28} color="#3b3026" />
                                        <Text style={styles.editImagePickerText}>Adicionar Foto</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            {/* Título */}
                            <View style={styles.editFormGroup}>
                                <Text style={styles.editLabel}>Título *</Text>
                                <TextInput
                                    style={styles.editInput}
                                    placeholder="Título do diário"
                                    value={editTitle}
                                    onChangeText={setEditTitle}
                                    maxLength={100}
                                    editable={!isSaving}
                                />
                                <Text style={styles.editCharCount}>
                                    {editTitle.length}/100 caracteres
                                </Text>
                            </View>

                            {/* Conteúdo */}
                            <View style={styles.editFormGroup}>
                                <Text style={styles.editLabel}>Conteúdo *</Text>
                                <TextInput
                                    style={[styles.editInput, styles.editTextArea]}
                                    placeholder="Escreva sobre sua experiência..."
                                    value={editContent}
                                    onChangeText={setEditContent}
                                    multiline
                                    numberOfLines={8}
                                    textAlignVertical="top"
                                    editable={!isSaving}
                                    maxLength={1000}
                                />
                                <Text style={styles.editCharCount}>
                                    {editContent.length}/1000 caracteres
                                </Text>
                            </View>

                            {/* Botão de salvar no final */}
                            <TouchableOpacity
                                style={[
                                    styles.editSaveButton,
                                    isSaving && styles.editSaveButtonDisabled,
                                    !hasChanges() && styles.editSaveButtonDisabled
                                ]}
                                onPress={handleSaveEdit}
                                disabled={isSaving || !hasChanges()}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                                        <Text style={styles.editSaveButtonText}>Salvar Alterações</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <View style={{ height: 30 }} />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f1e7',
        paddingHorizontal: 40,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#3b3026',
        marginTop: 16,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#8a7d6e',
        textAlign: 'center',
        marginBottom: 24,
    },
    errorButton: {
        backgroundColor: '#3b3026',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    errorButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerActionButton: {
        padding: 4,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dateText: {
        fontSize: 14,
        color: '#8a7d6e',
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#3b3026',
        marginBottom: 16,
        lineHeight: 32,
    },
    viagemLink: {
        marginTop: 8,
    },
    viagemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f8f1e7',
        borderRadius: 8,
    },
    viagemImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    viagemImagePlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#3b3026',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    viagemTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#3b3026',
    },
    imageContainer: {
        position: 'relative',
        marginTop: 20,
    },
    image: {
        width: '100%',
        height: 300,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
        color: '#54483d',
        marginBottom: 24,
    },
    metadata: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0d8cc',
    },
    metadataItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metadataText: {
        fontSize: 14,
        color: '#8a7d6e',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginTop: 16,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0d8cc',
        gap: 8,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3b3026',
    },
    imageModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageModalClose: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 4,
    },
    fullImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH * 0.75,
    },
    deleteModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    deleteModalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    deleteModalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    deleteModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#3b3026',
        marginTop: 12,
        marginBottom: 8,
    },
    deleteModalText: {
        fontSize: 14,
        color: '#8a7d6e',
        textAlign: 'center',
        lineHeight: 20,
    },
    deleteModalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    deleteModalCancel: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0d8cc',
        alignItems: 'center',
    },
    deleteModalCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3b3026',
    },
    deleteModalConfirm: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#ff3b30',
        alignItems: 'center',
    },
    deleteModalDisabled: {
        opacity: 0.6,
    },
    deleteModalConfirmText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    // Estilos do Modal de Edição
    editModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    editModalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    editModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0d8cc',
    },
    editModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#3b3026',
    },
    editModalSave: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3b3026',
    },
    editModalSaveDisabled: {
        color: '#8a7d6e',
        opacity: 0.5,
    },
    editModalScroll: {
        paddingHorizontal: 20,
    },
    editImagePicker: {
        marginTop: 20,
        marginBottom: 20,
    },
    editImageWithActions: {
        position: 'relative',
    },
    editPreviewImage: {
        width: '100%',
        height: 180,
        borderRadius: 10,
    },
    editImageActions: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        flexDirection: 'row',
        gap: 10,
    },
    editImageActionButton: {
        backgroundColor: 'rgba(59, 48, 38, 0.8)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        gap: 4,
    },
    editRemoveButton: {
        backgroundColor: 'rgba(255, 59, 48, 0.8)',
    },
    editImageActionText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    editImagePlaceholder: {
        backgroundColor: '#f8f1e7',
        borderWidth: 2,
        borderColor: '#e0d8cc',
        borderStyle: 'dashed',
        borderRadius: 10,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editImagePickerText: {
        marginTop: 8,
        fontSize: 14,
        color: '#3b3026',
        fontWeight: '500',
    },
    editFormGroup: {
        marginBottom: 20,
    },
    editLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3b3026',
        marginBottom: 6,
    },
    editInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#3b3026',
    },
    editTextArea: {
        minHeight: 120,
        paddingTop: 12,
        textAlignVertical: 'top',
    },
    editCharCount: {
        textAlign: 'right',
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    editSaveButton: {
        backgroundColor: '#3b3026',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 10,
    },
    editSaveButtonDisabled: {
        backgroundColor: '#8a7d6e',
        opacity: 0.6,
    },
    editSaveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});