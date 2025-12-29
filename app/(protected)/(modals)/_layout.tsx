import { Stack } from "expo-router";

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="create-household" />
      <Stack.Screen name="edit-household" />
    </Stack>
  );
}
