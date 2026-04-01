// app/(screens)/diario/[id].tsx
import { insertEntradaDiario } from '@/service/entradas.service';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AddDiaryScreen() {
    const { id } = useLocalSearchParams();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [picture, setPicture] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const tripId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id as string);

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
                setPicture(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Erro ao selecionar imagem:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem');
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert('Campo obrigatório', 'Por favor, digite um título para o registro');
            return;
        }

        if (!content.trim()) {
            Alert.alert('Campo obrigatório', 'Por favor, escreva o conteúdo do diário');
            return;
        }

        setLoading(true);
        try {
            // Em produção, você precisaria fazer upload da imagem primeiro
            // Aqui estamos usando a URI local
            const imageUrl = picture; // Em produção: await uploadImage(picture);

            await insertEntradaDiario(
                tripId,
                title.trim(),
                content.trim(),
                imageUrl || undefined
            );

            Alert.alert(
                'Sucesso',
                'Registro adicionado ao diário!',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back()
                    }
                ]
            );
        } catch (error) {
            console.error('Erro ao adicionar registro:', error);
            Alert.alert('Erro', 'Não foi possível adicionar o registro ao diário');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#3b3026" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Novo Registro</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Formulário */}
                <View style={styles.formContainer}>
                    {/* Seletor de imagem */}
                    <TouchableOpacity
                        style={styles.imagePicker}
                        onPress={pickImage}
                        disabled={loading}
                    >
                        {picture ? (
                            <Image source={{ uri: picture }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="camera" size={30} color="#3b3026" />
                                <Text style={styles.imagePickerText}>Adicionar Foto</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {picture && (
                        <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => setPicture(null)}
                            disabled={loading}
                        >
                            <Ionicons name="trash-outline" size={16} color="#fff" />
                            <Text style={styles.removeImageText}>Remover Foto</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Título *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Primeiro dia em Benguela"
                            value={title}
                            onChangeText={setTitle}
                            maxLength={100}
                            editable={!loading}
                        />
                        <Text style={styles.charCount}>
                            {title.length}/100 caracteres
                        </Text>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Conteúdo *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Descreva sua experiência neste dia..."
                            value={content}
                            onChangeText={setContent}
                            multiline
                            numberOfLines={8}
                            textAlignVertical="top"
                            editable={!loading}
                            maxLength={1000}
                        />
                        <Text style={styles.charCount}>
                            {content.length}/1000 caracteres
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.submitButtonText}>Salvar Registro</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f1e7',
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
    formContainer: {
        padding: 20,
    },
    imagePicker: {
        marginBottom: 20,
    },
    imagePlaceholder: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e0d8cc',
        borderStyle: 'dashed',
        borderRadius: 10,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    imagePickerText: {
        marginTop: 10,
        fontSize: 16,
        color: '#3b3026',
        fontWeight: '500',
    },
    removeImageButton: {
        backgroundColor: '#ff3b30',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    removeImageText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 8,
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3b3026',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        color: '#3b3026',
    },
    textArea: {
        minHeight: 150,
        paddingTop: 14,
    },
    charCount: {
        textAlign: 'right',
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: '#3b3026',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 20,
    },
    submitButtonDisabled: {
        backgroundColor: '#8a7d6e',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});