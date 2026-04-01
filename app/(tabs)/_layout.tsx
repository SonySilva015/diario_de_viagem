import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { TouchableOpacity, View } from 'react-native';


export default function Layout() {

  return (
    <Tabs
      screenOptions={
        {
          tabBarActiveTintColor: 'blue',
          tabBarInactiveTintColor: 'gray',
          headerRight: () => (<View style={{ flexDirection: 'row', marginRight: 10 }}>
            <TouchableOpacity
              onPress={() => router.push('../notifications')}
              style={{ marginHorizontal: 8 }}
            >
              <Ionicons name="notifications-outline" size={24} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('../settings')}
              style={{ marginHorizontal: 8 }}
            >
              <Ionicons name="settings-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>),

        }
      }
    >

      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="viagens"
        options={{
          title: "Viagens",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="airplane" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />

    </Tabs>
  );
}

