import { useHouseholdStore } from "@/stores/household-store";
import { Stack } from "expo-router";

export default function ProtectedLayout() {
  const { householdId } = useHouseholdStore();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!householdId}>
        <Stack.Screen
          name="index"
          options={{ headerShown: true, animation: "none" }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!!householdId}>
        <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
      </Stack.Protected>

      <Stack.Screen name="(modals)" options={{ presentation: "modal" }} />
    </Stack>
  );
}
