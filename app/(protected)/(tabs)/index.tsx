import { Text } from "@/components/ui/text";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function Home() {
  const renderContent = () => {
    return (
      <View className="flex-1 items-start justify-start p-4">
        <Text>No items in list</Text>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Grocery List",
        }}
      />
      {renderContent()}
    </>
  );
}
