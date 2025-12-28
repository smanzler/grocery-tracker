import { Text } from "@/components/ui/text";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function Ingredients() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Ingredients" }} />
      <View>
        <Text>Ingredients</Text>
      </View>
    </>
  );
}
