import useUser from '@/hooks/useUser';
import { getUserById, updateUser } from '@/service/user.service';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

interface UserData {
  id: number;
  name: string;
  email: string;
  local?: string;
  desc?: string;
  picture?: string;
}

interface Stats {
  viagens: number;
  locais: number;
  fotos: number;
}

export default function ProfileScreen() {
  const { user: currentUser } = useUser();
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<Stats>({ viagens: 0, locais: 0, fotos: 0 });
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const userData = await getUserById(currentUser.id);
      if (userData) {
        setUser(userData);
        setEditingUser({ ...userData });

        setStats({
          viagens: 12,
          locais: 34,
          fotos: 89
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados do perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editingUser || !user) return;

    // Validações básicas
    if (!editingUser.name.trim()) {
      Alert.alert("Erro", "O nome é obrigatório");
      return;
    }

    if (!editingUser.email.trim()) {
      Alert.alert("Erro", "O email é obrigatório");
      return;
    }

    // Validação simples de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editingUser.email)) {
      Alert.alert("Erro", "Por favor, insira um email válido");
      return;
    }

    setSaving(true);
    try {
      // Chama a função updateUser do service
      const updatedUser = await updateUser(
        user.id,
        editingUser.name,
        editingUser.email,
        editingUser.local || undefined, // Passa undefined se for string vazia
        editingUser.desc || undefined,
        editingUser.picture || undefined
      );

      if (updatedUser) {
        // Atualiza o estado com os dados retornados do banco
        setUser(updatedUser);
        setEditingUser({ ...updatedUser });

        Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
        setEditModalVisible(false);

        // Recarrega os dados para garantir sincronização
        loadUserData();
      } else {
        Alert.alert("Erro", "Não foi possível atualizar o perfil");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      Alert.alert("Erro", "Ocorreu um erro ao atualizar o perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Restaura os dados originais do usuário atual
    if (user) {
      setEditingUser({ ...user });
    }
    setEditModalVisible(false);
  };

  const handleUpdateField = (field: keyof UserData, value: string) => {
    if (editingUser) {
      setEditingUser({
        ...editingUser,
        [field]: value
      });
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('currentUser');
              router.replace('/');
            } catch (error) {
              console.error("Erro ao fazer logout:", error);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b3026" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Usuário não encontrado</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header com botão de logout */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#3b3026" />
          </TouchableOpacity>
        </View>

        {/* Perfil */}
        <View style={styles.profileCenter}>
          {user.picture ? (
            <Image
              source={{ uri: user.picture }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
          )}

          <Text style={styles.profileName}>{user.name}</Text>
          {user.desc ? (
            <Text style={styles.profileBio}>{user.desc}</Text>
          ) : (
            <Text style={styles.profileBioEmpty}>
              Adicione uma descrição sobre você...
            </Text>
          )}

          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>



        {/* Informações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>

          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={22} color="#3b3026" />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>

          {user.local && (
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={22} color="#3b3026" />
              <Text style={styles.infoText}>{user.local}</Text>
            </View>
          )}

          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={22} color="#3b3026" />
            <Text style={styles.infoText}>
              {user.desc ? "Perfil personalizado" : "Perfil básico"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={22} color="#3b3026" />
            <Text style={styles.infoText}>
              Membro desde {new Date().getFullYear()}
            </Text>
          </View>
        </View>



      </ScrollView>

      {/* Modal de Edição de Perfil */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={handleCancelEdit} disabled={saving}>
                <Ionicons name="close" size={24} color="#3b3026" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Foto do perfil (opcional) */}
              <TouchableOpacity style={styles.profileImageEditContainer}>
                {user.picture ? (
                  <Image
                    source={{ uri: user.picture }}
                    style={styles.profileImageEdit}
                  />
                ) : (
                  <View style={styles.profileImageEditPlaceholder}>
                    <Ionicons name="camera" size={30} color="#fff" />
                  </View>
                )}
                <Text style={styles.changePhotoText}>Alterar foto</Text>
              </TouchableOpacity>

              {/* Campos do formulário */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nome *</Text>
                <TextInput
                  style={styles.formInput}
                  value={editingUser?.name || ''}
                  onChangeText={(text) => handleUpdateField('name', text)}
                  placeholder="Seu nome completo"
                  placeholderTextColor="#999"
                  editable={!saving}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email *</Text>
                <TextInput
                  style={styles.formInput}
                  value={editingUser?.email || ''}
                  onChangeText={(text) => handleUpdateField('email', text)}
                  placeholder="seu@email.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!saving}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Localização</Text>
                <TextInput
                  style={styles.formInput}
                  value={editingUser?.local || ''}
                  onChangeText={(text) => handleUpdateField('local', text)}
                  placeholder="Cidade, Estado, País"
                  placeholderTextColor="#999"
                  editable={!saving}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Biografia</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={editingUser?.desc || ''}
                  onChangeText={(text) => handleUpdateField('desc', text)}
                  placeholder="Conte um pouco sobre você..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!saving}
                  maxLength={200}
                />
                <Text style={styles.charCount}>
                  {editingUser?.desc?.length || 0}/200 caracteres
                </Text>
              </View>

              <View style={styles.formNote}>
                <Text style={styles.formNoteText}>* Campos obrigatórios</Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelEdit}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.saveButtonText}>Salvar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f1e7",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f1e7",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#3b3026",
  },
  errorText: {
    fontSize: 18,
    color: "#ff3b30",
    textAlign: "center",
    marginTop: 100,
  },
  backButton: {
    backgroundColor: "#3b3026",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "center",
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3b3026",
  },
  profileCenter: {
    alignItems: "center",
    marginBottom: 25,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileImagePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 12,
    backgroundColor: "#3b3026",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3b3026",
  },
  profileBio: {
    color: "#54483d",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 30,
    fontSize: 14,
    lineHeight: 20,
  },
  profileBioEmpty: {
    color: "#999",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 30,
    fontSize: 14,
    fontStyle: "italic",
  },
  editButton: {
    backgroundColor: "#3b3026",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  statBox: {
    alignItems: "center",
    paddingHorizontal: 15,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3b3026",
  },
  statLabel: {
    color: "#54483d",
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3b3026",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: "#3b3026",
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    fontSize: 15,
    color: "#3b3026",
    flex: 1,
    marginLeft: 10,
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#f8f1e7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0d8cc',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3b3026',
  },
  modalContent: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0d8cc',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: '#e0d8cc',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#3b3026',
    marginLeft: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#8a7d6e',
  },
  cancelButtonText: {
    color: '#3b3026',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos do formulário
  profileImageEditContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImageEdit: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileImageEditPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b3026',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#fff',
  },
  changePhotoText: {
    color: '#3b3026',
    fontSize: 14,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b3026',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#3b3026',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  formNote: {
    marginTop: 10,
    marginBottom: 20,
  },
  formNoteText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});