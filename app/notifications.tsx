import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function NotificationsScreen() {
    const notifications = [
        {
            id: 1,
            title: "Nova viagem adicionada!",
            message: "A tua viagem para Benguela foi registrada.",
            icon: "airplane-outline",
            date: "Hoje",
        },
        {
            id: 2,
            title: "Backup concluído",
            message: "Os teus dados foram sincronizados.",
            icon: "cloud-outline",
            date: "Ontem",
        },
        {
            id: 3,
            title: "Lembrete",
            message: "Não esqueça de registrar sua visita à Baía de Luanda.",
            icon: "notifications-outline",
            date: "2 dias atrás",
        },
    ];

    return (
        <ScrollView style={styles.container}>


            {notifications.map((item) => (
                <View key={item.id} style={styles.card}>
                    <Ionicons name={item.icon} size={26} color="#3b3026" />
                    <View style={styles.info}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.message}>{item.message}</Text>
                        <Text style={styles.date}>{item.date}</Text>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 20,
        backgroundColor: "#f8f1e7",
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#3b3026",
        marginBottom: 25,
    },

    card: {
        flexDirection: "row",
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 16,
        marginBottom: 16,
        gap: 12,
    },

    info: {
        flex: 1,
    },

    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#3b3026",
    },

    message: {
        marginTop: 2,
        color: "#54483d",
    },

    date: {
        marginTop: 6,
        fontSize: 12,
        color: "#867869",
    },
});
