import { ProfileButton } from "@/components/auth/profile-button";
import { Tabs } from "expo-router";
import { ScrollText, ShoppingBasket, Utensils } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerLeft: () => <ProfileButton />,
        headerLeftContainerStyle: { paddingLeft: 16 },
        headerRightContainerStyle: { paddingRight: 16 },
      }}
    >
      <Tabs.Screen
        name="pantry"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Utensils color={color} size={size} />
          ),
          headerTitle: "Pantry",
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <ScrollText color={color} size={size} />
          ),
          headerTitle: "Grocery List",
        }}
      />
      <Tabs.Screen
        name="grocery-items"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <ShoppingBasket color={color} size={size} />
          ),
          headerTitle: "Grocery Items",
        }}
      />
    </Tabs>
  );
}
