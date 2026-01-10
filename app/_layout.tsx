import { Toast } from "@/components/toast";
import { Spinner } from "@/components/ui/spinner";
import "@/global.css";

import { queryClient } from "@/lib/query-client";
import { NAV_THEME } from "@/lib/theme";
import { useAuthStore } from "@/stores/auth-store";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useUniwind } from "uniwind";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
  const { theme } = useUniwind();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <ThemeProvider value={NAV_THEME[theme ?? "light"]}>
          <QueryClientProvider client={queryClient}>
            <StatusBar style={theme === "dark" ? "light" : "dark"} />
            <RootLayoutNav />
            <PortalHost />
            <Toast />
          </QueryClientProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { isAuthenticated, initializing, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (initializing)
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );

  return (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
