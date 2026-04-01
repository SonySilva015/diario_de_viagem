import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);

    return (
        <ScrollView style={styles.container}>

            <Text style={styles.sectionTitle}>Conta</Text>

            <TouchableOpacity style={styles.item}>
                <Ionicons name="person-outline" size={24} color="#3b3026" />
                <Text style={styles.itemText}>Editar Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item}>
                <Ionicons name="key-outline" size={24} color="#3b3026" />
                <Text style={styles.itemText}>Alterar Senha</Text>
            </TouchableOpacity>

            {/* Preferences */}
            <Text style={styles.sectionTitle}>Preferências</Text>

            <View style={styles.switchItem}>
                <View style={styles.switchLeft}>
                    <Ionicons name="moon-outline" size={24} color="#3b3026" />
                    <Text style={styles.itemText}>Modo escuro</Text>
                </View>
                <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    thumbColor={darkMode ? "#3b3026" : "#fff"}
                    trackColor={{ true: "#b9a795", false: "#ccc" }}
                />
            </View>

            <View style={styles.switchItem}>
                <View style={styles.switchLeft}>
                    <Ionicons name="notifications-outline" size={24} color="#3b3026" />
                    <Text style={styles.itemText}>Notificações</Text>
                </View>
                <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    thumbColor={notifications ? "#3b3026" : "#fff"}
                    trackColor={{ true: "#b9a795", false: "#ccc" }}
                />
            </View>

            {/* Privacy */}
            <Text style={styles.sectionTitle}>Privacidade</Text>

            <TouchableOpacity style={styles.item}>
                <Ionicons name="lock-closed-outline" size={24} color="#3b3026" />
                <Text style={styles.itemText}>Política de privacidade</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#3b3026" />
                <Text style={styles.itemText}>Segurança da conta</Text>
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn}>
                <Ionicons name="log-out-outline" size={24} color="#fff" />
                <Text style={styles.logoutText}>Terminar sessão</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#f8f1e7",
        flex: 1,
        paddingTop: 10,
        paddingHorizontal: 20,
        marginBottom: 10
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#3b3026",
        marginBottom: 25,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#3b3026",
        marginTop: 20,
        marginBottom: 12,
    },

    item: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        gap: 12,
    },

    itemText: {
        fontSize: 16,
        color: "#3b3026",
    },

    switchItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 14,
        alignItems: "center",
    },

    switchLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 40,
        backgroundColor: "#3b3026",
        paddingVertical: 14,
        borderRadius: 20,
    },

    logoutText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
