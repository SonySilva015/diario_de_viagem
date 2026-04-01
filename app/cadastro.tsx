import { insertUser } from '@/service/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function CadastroScreen() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [local, setLocal] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [picture, setPicture] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string>("");

  const emailRef = useRef<TextInput>(null);
  const localRef = useRef<TextInput>(null);
  const descRef = useRef<TextInput>(null);

  // Função para validar email
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Função para validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (name.trim().length < 3) {
      newErrors.name = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!validateEmail(email)) {
      newErrors.email = "Email inválido";
    }

    if (desc.length > 200) {
      newErrors.desc = "Descrição não pode ter mais de 200 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para escolher foto da galeria
  const pickImage = async () => {
    try {
      setImageLoading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos da permissão para acessar sua galeria de fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
        exif: false,
      });

      if (!result.canceled && result.assets[0].uri) {
        const selectedImage = result.assets[0];

        // Valida tamanho da imagem (opcional, máximo 10MB)
        if (selectedImage.fileSize && selectedImage.fileSize > 10 * 1024 * 1024) {
          Alert.alert('Imagem muito grande', 'Por favor, selecione uma imagem menor que 10MB');
          return;
        }

        setPicture(selectedImage.uri);
        setErrors(prev => ({ ...prev, picture: '' }));
      }
    } catch (error) {
      console.error('Erro ao escolher imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    } finally {
      setImageLoading(false);
    }
  };

  // Função para tirar foto com câmera
  const takePhoto = async () => {
    try {
      setImageLoading(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos da permissão para usar a câmera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setPicture(result.assets[0].uri);
        setErrors(prev => ({ ...prev, picture: '' }));
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleCadastrar = async () => {
    if (!validateForm()) {
      Alert.alert("Atenção", "Por favor, corrija os erros no formulário");
      return;
    }

    setLoading(true);

    try {
      // Cria o usuário
      const newUser = await insertUser(
        name.trim(),
        email.trim(),
        local.trim() || undefined,
        desc.trim() || undefined,
        picture || undefined
      );

      // Salva o usuário criado
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));

      // Mostra mensagem de sucesso
      Alert.alert(
        "Sucesso!",
        "Perfil criado com sucesso!",
        [
          {
            text: "OK",
            onPress: () => router.replace('./(tabs)/home')
          }
        ]
      );

    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);

      // Tratamento de erros específicos
      if (error.message?.includes('UNIQUE') || error.message?.includes('duplicate')) {
        Alert.alert("Erro", "Este email já está cadastrado. Tente outro email.");
      } else {
        Alert.alert("Erro", "Não foi possível criar usuário. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      "Escolher Foto",
      "Como você quer adicionar sua foto?",
      [
        {
          text: "Tirar Foto",
          onPress: takePhoto
        },
        {
          text: "Escolher da Galeria",
          onPress: pickImage
        },
        {
          text: "Cancelar",
          style: "cancel"
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Criar Perfil</Text>
            <Text style={styles.subtitle}>Complete seu perfil para começar</Text>
          </View>

          {/* Seção da Foto */}
          <View style={styles.photoSection}>
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={handleImagePicker}
              disabled={imageLoading}
            >
              {imageLoading ? (
                <View style={styles.photoPlaceholder}>
                  <ActivityIndicator size="large" color="#007AFF" />
                </View>
              ) : picture ? (
                <Image
                  source={{ uri: picture }}
                  style={styles.photo}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>+</Text>
                  <Text style={styles.photoPlaceholderSubtext}>Adicionar foto</Text>
                </View>
              )}
            </TouchableOpacity>

            {picture && (
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => setPicture(null)}
                disabled={imageLoading}
              >
                <Text style={styles.removePhotoText}>Remover foto</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            {/* Campo Nome */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome *</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'name' && styles.inputFocused,
                  errors.name && styles.inputError
                ]}
                placeholder="Seu nome completo"
                placeholderTextColor="#666"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setErrors(prev => ({ ...prev, name: '' }));
                }}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField('')}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                blurOnSubmit={false}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Campo Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                ref={emailRef}
                style={[
                  styles.input,
                  focusedField === 'email' && styles.inputFocused,
                  errors.email && styles.inputError
                ]}
                placeholder="seu@email.com"
                placeholderTextColor="#666"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrors(prev => ({ ...prev, email: '' }));
                }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => localRef.current?.focus()}
                blurOnSubmit={false}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Campo Localização */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Localização</Text>
              <TextInput
                ref={localRef}
                style={[
                  styles.input,
                  focusedField === 'local' && styles.inputFocused
                ]}
                placeholder="Cidade, País"
                placeholderTextColor="#666"
                value={local}
                onChangeText={setLocal}
                onFocus={() => setFocusedField('local')}
                onBlur={() => setFocusedField('')}
                returnKeyType="next"
                onSubmitEditing={() => descRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            {/* Campo Descrição */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sobre você</Text>
              <TextInput
                ref={descRef}
                style={[
                  styles.input,
                  styles.textArea,
                  focusedField === 'desc' && styles.inputFocused,
                  errors.desc && styles.inputError
                ]}
                placeholder="Conte um pouco sobre você..."
                placeholderTextColor="#666"
                value={desc}
                onChangeText={(text) => {
                  setDesc(text);
                  setErrors(prev => ({ ...prev, desc: '' }));
                }}
                onFocus={() => setFocusedField('desc')}
                onBlur={() => setFocusedField('')}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={200}
                returnKeyType="done"
                blurOnSubmit={true}
              />
              <View style={styles.charCountContainer}>
                <Text style={[
                  styles.charCount,
                  errors.desc && styles.charCountError
                ]}>
                  {desc.length}/200
                </Text>
              </View>
              {errors.desc && (
                <Text style={styles.errorText}>{errors.desc}</Text>
              )}
            </View>

            {/* Botão de Cadastro */}
            <TouchableOpacity
              style={[
                styles.button,
                (!name || !email || loading) && styles.buttonDisabled,
                loading && styles.buttonLoading
              ]}
              onPress={handleCadastrar}
              disabled={!name || !email || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>
                  Criar Perfil
                </Text>
              )}
            </TouchableOpacity>

            {/* Link para voltar */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
    textAlign: 'center',
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  photoPlaceholder: {
    alignItems: "center",
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontSize: 36,
    color: "#007AFF",
    fontWeight: "200",
  },
  photoPlaceholderSubtext: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  removePhotoButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  removePhotoText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  inputFocused: {
    borderColor: "#007AFF",
    backgroundColor: "#fff",
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFF5F5",
  },
  textArea: {
    height: 100,
    paddingTop: 15,
    paddingBottom: 15,
  },
  charCountContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  charCount: {
    fontSize: 12,
    color: "#999",
  },
  charCountError: {
    color: "#FF3B30",
  },
  errorText: {
    fontSize: 12,
    color: "#FF3B30",
    marginTop: 5,
  },
  button: {
    width: "100%",
    height: 56,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    shadowColor: "transparent",
  },
  buttonLoading: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#666",
    fontSize: 16,
  },
});