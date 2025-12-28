import "@/global.css";

import { queryClient } from "@/lib/query-client";
import { NAV_THEME } from "@/lib/theme";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
        <Stack screenOptions={{ headerShown: false }} />
        <PortalHost />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
