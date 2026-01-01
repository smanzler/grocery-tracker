import { useHouseholdStore } from "@/stores/household-store";
import { useIntentStore } from "@/stores/intent-store";
import { router, Stack, usePathname } from "expo-router";
import { useEffect, useRef } from "react";

export default function ProtectedLayout() {
  const { householdId } = useHouseholdStore();
  const { pendingIntent } = useIntentStore();
  const pathname = usePathname();
  const handledRef = useRef(false);

  useEffect(() => {
    if (!pendingIntent || handledRef.current) return;

    if (pendingIntent.type === "join-household" && pendingIntent.token) {
      handledRef.current = true;

      if (!pathname.includes("join-household")) {
        setTimeout(() => {
          router.push("/(protected)/(modals)/join-household");
        }, 50);
      }
    }
  }, [pendingIntent, pathname, router]);

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
