import { Text } from "@/components/ui/text";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function Pantry() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Pantry" }} />
      <View>
        <Text>Pantry</Text>
      </View>
    </>
  );
}
