import { Tabs } from "expo-router";
import { List, Refrigerator, ShoppingCart } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="pantry"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Refrigerator color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => <List color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="ingredients"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
