import { deleteViagem, getViagens, insertViagem } from '@/service/travell.service'; // Corrigido o nome do arquivo
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Definindo o tipo Viagem
interface Viagem {
  id: number;
  title: string;
  destination: string;
  picture: string;
  created_at?: string;
}

export default function TravelsScreen() {
  const [tab, setTab] = useState<'add' | 'list'>('list');
  const [tripTitle, setTripTitle] = useState('');
  const [tripDestination, setTripDestination] = useState('');
  const [tripImage, setTripImage] = useState<string | null>(null);
  const [trips, setTrips] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Carregar viagens do banco de dados
  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const viagens = await getViagens();
      setTrips(viagens);
    } catch (error) {
      console.error('Erro ao carregar viagens:', error);
      Alert.alert('Erro', 'Não foi possível carregar as viagens');
    } finally {
      setLoading(false);
    }
  };

  async function pickImage() {
    try {
      // Solicitar permissão para acessar a galeria
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
        setTripImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  }

  async function handleAddTrip() {
    // Validações
    if (!tripTitle.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, digite o título da viagem');
      return;
    }

    if (!tripDestination.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, digite o destino da viagem');
      return;
    }

    if (!tripImage) {
      Alert.alert('Imagem necessária', 'Por favor, selecione uma imagem para a viagem');
      return;
    }

    setSaving(true);
    try {
      // Aqui você normalmente enviaria a imagem para um servidor
      // e obteria a URL. Por enquanto, usaremos a URI local.
      // Em produção, você precisa fazer upload da imagem primeiro.
      const imageUrl = tripImage; // Em produção, substitua pela URL do upload

      // Inserir no banco de dados
      const novaViagem = await insertViagem(
        tripTitle.trim(),
        tripDestination.trim(),
        imageUrl
      );

      if (novaViagem) {
        // Atualizar a lista localmente
        setTrips([novaViagem, ...trips]);

        // Limpar formulário
        setTripTitle('');
        setTripDestination('');
        setTripImage(null);

        Alert.alert('Sucesso', 'Viagem adicionada com sucesso!');

        // Alternar para a aba de lista
        setTab('list');
      }
    } catch (error) {
      console.error('Erro ao adicionar viagem:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a viagem');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTrip(id: number) {
    Alert.alert(
      'Excluir Viagem',
      'Tem certeza que deseja excluir esta viagem?\nEsta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(id);

              // Chama a função deleteViagem do service
              await deleteViagem(id);

              // Atualizar a lista localmente
              setTrips(trips.filter(t => t.id !== id));

              Alert.alert('Sucesso', 'Viagem excluída com sucesso!');
            } catch (error) {
              console.error('Erro ao excluir viagem:', error);
              Alert.alert('Erro', 'Não foi possível excluir a viagem');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  }

  function editTrip(id: number) {
    router.push(`/edit/${id}`);
  }

  function viewDetails(id: number) {
    router.push(`/detail/${id}`);
  }

  // Renderizar o conteúdo baseado na aba selecionada
  const renderContent = () => {
    if (tab === 'add') {
      return (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <ScrollView
            style={styles.addContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            <Text style={styles.label}>Título da Viagem *</Text>
            <TextInput
              placeholder="Ex: Férias em Benguela"
              value={tripTitle}
              onChangeText={setTripTitle}
              style={styles.input}
              maxLength={100}
            />

            <Text style={styles.label}>Destino *</Text>
            <TextInput
              placeholder="Ex: Benguela, Angola"
              value={tripDestination}
              onChangeText={setTripDestination}
              style={styles.input}
              maxLength={100}
            />

            <TouchableOpacity
              style={styles.imagePicker}
              onPress={pickImage}
              disabled={saving}
            >
              <Ionicons name="image-outline" size={20} color="#3b3026" style={{ marginRight: 8 }} />
              <Text style={styles.imagePickerText}>
                {tripImage ? 'Trocar Imagem' : 'Selecionar Imagem de Capa'}
              </Text>
            </TouchableOpacity>

            {tripImage && (
              <>
                <Image source={{ uri: tripImage }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setTripImage(null)}
                  disabled={saving}
                >
                  <Ionicons name="trash-outline" size={16} color="#fff" />
                  <Text style={styles.removeImageText}>Remover Imagem</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.button, saving && styles.buttonDisabled]}
              onPress={handleAddTrip}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>Adicionar Viagem</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      );
    }

    // Aba de lista
    if (loading && trips.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b3026" />
          <Text style={styles.loadingText}>Carregando viagens...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={loadTrips}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="airplane-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma viagem encontrada</Text>
            <Text style={styles.emptySubtext}>
              Comece adicionando sua primeira viagem!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setTab('add')}
            >
              <Text style={styles.emptyButtonText}>Adicionar Viagem</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.picture }}
              style={styles.cardImage}
            />

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDestination}>{item.destination}</Text>
              {item.created_at && (
                <Text style={styles.cardDate}>
                  Criada em: {new Date(item.created_at).toLocaleDateString('pt-AO')}
                </Text>
              )}
            </View>

            {/* Botões de ação */}
            <View style={styles.buttonsColumn}>
              <TouchableOpacity
                style={[styles.actionButton, styles.viewButton]}
                onPress={() => viewDetails(item.id)}
              >
                <Ionicons name="eye" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Ver</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => editTrip(item.id)}
              >
                <Ionicons name="pencil" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteTrip(item.id)}
                disabled={deletingId === item.id}
              >
                {deletingId === item.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="trash" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Excluir</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* TABS */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, tab === 'add' && styles.activeTab]}
            onPress={() => setTab('add')}
          >
            <Text style={[styles.tabText, tab === 'add' && styles.activeTabText]}>
              Adicionar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, tab === 'list' && styles.activeTab]}
            onPress={() => setTab('list')}
          >
            <Text style={[styles.tabText, tab === 'list' && styles.activeTabText]}>
              Minhas Viagens
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo */}
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ---------------------- STYLES ---------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f1e7',
  },

  container: {
    flex: 1,
    paddingTop: 50,
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#3b3026',
  },

  /* TABS */
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#e0d8cc',
    marginHorizontal: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },

  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },

  activeTab: {
    backgroundColor: '#3b3026',
  },

  tabText: {
    fontSize: 15,
    color: '#54483d',
    fontWeight: '600',
  },

  activeTabText: {
    color: '#fff',
  },

  /* FORM */
  addContainer: {
    flex: 1,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b3026',
    marginBottom: 8,
    marginTop: 5,
  },

  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    fontSize: 16,
    color: '#3b3026',
  },

  imagePicker: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  imagePickerText: {
    fontWeight: '600',
    color: '#3b3026',
    fontSize: 16,
  },

  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#fff',
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

  button: {
    backgroundColor: '#3b3026',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },

  buttonDisabled: {
    backgroundColor: '#8a7d6e',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  /* LIST */
  listContainer: {
    paddingTop: 10,
    paddingBottom: 20,
  },

  /* CARD */
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0d8cc',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b3026',
    marginBottom: 4,
  },

  cardDestination: {
    fontSize: 14,
    color: '#54483d',
    marginBottom: 4,
  },

  cardDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  buttonsColumn: {
    flexDirection: 'column',
    gap: 8,
    marginLeft: 10,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 70,
  },

  viewButton: {
    backgroundColor: '#1a2024',
  },

  editButton: {
    backgroundColor: '#774c08',
  },

  deleteButton: {
    backgroundColor: '#850a0a',
  },

  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b3026',
    marginTop: 16,
    marginBottom: 8,
  },

  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },

  emptyButton: {
    backgroundColor: '#3b3026',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },

  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});