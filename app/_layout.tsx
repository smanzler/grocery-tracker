import "@/global.css";

import { queryClient } from "@/lib/query-client";
import { NAV_THEME } from "@/lib/theme";
import { useAuthStore } from "@/stores/auth-store";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useUniwind } from "uniwind";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
  const { theme } = useUniwind();

  return (
    <ThemeProvider value={NAV_THEME[theme ?? "light"]}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style={theme === "dark" ? "light" : "dark"} />
        <RootLayoutNav />
        <PortalHost />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { isAuthenticated, initializing, initialize } = useAuthStore();

  useEffect(() => {
    initialize().then(() => {
      SplashScreen.hideAsync();
    });
  }, [initialize]);

  if (initializing) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
