import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

// Funções do banco
import { deleteViagem, getViagemById, updateViagem } from "@/service/travell.service"; // ajuste o caminho

export default function EditTripScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); // id passado na rota

    const [trip, setTrip] = useState<any>(null);
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Buscar viagem pelo ID ao abrir a tela
    useEffect(() => {
        async function loadTrip() {
            if (!id) return;

            setLoading(true);
            try {
                const viagem = await getViagemById(Number(id)); // função que busca do banco
                if (!viagem) {
                    Alert.alert("Erro", "Viagem não encontrada");
                    router.back();
                    return;
                }
                setTrip(viagem);
                setName(viagem.title); // nome da viagem
                setDate(viagem.destination); // data/destino da viagem
                setImage(viagem.picture); // imagem
            } catch (err) {
                console.error(err);
                Alert.alert("Erro", "Não foi possível carregar a viagem");
                router.back();
            } finally {
                setLoading(false);
            }
        }

        loadTrip();
    }, [id]);

    async function pickImage() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    }

    async function handleSave() {
        if (!trip || !name.trim() || !date.trim() || !image) {
            Alert.alert("Erro", "Todos os campos devem ser preenchidos!");
            return;
        }

        setLoading(true);
        try {
            await updateViagem(trip.id, name, date, image);
            Alert.alert("Sucesso", "Viagem atualizada com sucesso!", [
                { text: "OK", onPress: () => router.replace("/viagens") }
            ]);
        } catch (err) {
            console.error(err);
            Alert.alert("Erro", "Não foi possível atualizar a viagem");
        } finally {
            setLoading(false);
        }
    }

    function handleDelete() {
        if (!trip) return;

        Alert.alert(
            "Confirmar exclusão",
            "Deseja realmente excluir esta viagem?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await deleteViagem(trip.id);
                            Alert.alert("Viagem excluída");
                            router.replace("/");
                        } catch (err) {
                            console.error(err);
                            Alert.alert("Erro", "Não foi possível excluir a viagem");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    }

    if (loading) return <ActivityIndicator size="large" color="#0077cc" style={{ flex: 1, justifyContent: "center" }} />;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Editar Viagem</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <Text style={styles.label}>Data / Destino</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} />

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                <Text style={styles.imagePickerText}>Alterar Imagem</Text>
            </TouchableOpacity>

            {image && <Image source={{ uri: image }} style={styles.previewImage} />}

            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Salvar Alterações</Text>
            </TouchableOpacity>


            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f1e7", padding: 20 },

    title: { fontSize: 22, fontWeight: "800", marginBottom: 20 },

    label: { fontWeight: "600", fontSize: 15, marginBottom: 5 },

    input: { backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#ccc", marginBottom: 15 },

    imagePicker: { backgroundColor: "#dedede", padding: 12, borderRadius: 10, alignItems: "center", marginBottom: 10 },

    imagePickerText: { fontWeight: "600" },
    previewImage: { width: "100%", height: 180, borderRadius: 10, marginBottom: 20 },
    button: { backgroundColor: "#0077cc", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 10 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    deleteBtn: { marginTop: 10, paddingVertical: 12, alignItems: "center" },
    deleteText: { fontSize: 16, color: "#cc0000", fontWeight: "700" },
    cancelBtn: { marginTop: 10, paddingVertical: 10, alignItems: "center" },
    cancelText: { fontSize: 15, color: "#444", fontWeight: "600" },
});
