import { useHouseholdStore } from "@/stores/household-store";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function ProtectedLayout() {
  const { householdId } = useHouseholdStore();
  useEffect(() => {
    console.log("mounted");
  }, []);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!householdId}>
        <Stack.Screen
          name="index"
          options={{ headerShown: true, animation: "ios_from_left" }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!!householdId}>
        <Stack.Screen name="(tabs)" options={{ animation: "ios_from_right" }} />
      </Stack.Protected>

      <Stack.Screen name="(modals)" options={{ presentation: "modal" }} />
    </Stack>
  );
}
