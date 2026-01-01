import { Stack } from "expo-router";

export default function ModalsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="create-household"
        options={{
          headerTitle: "Create Household",
          headerLargeTitleEnabled: true,
        }}
      />
      <Stack.Screen
        name="edit-household"
        options={{
          headerTitle: "Edit Household",
          headerLargeTitleEnabled: true,
        }}
      />
      <Stack.Screen
        name="join-household"
        options={{
          headerTitle: "Join Household",
          headerLargeTitleEnabled: true,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerTitle: "Profile",
          headerLargeTitleEnabled: true,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerTitle: "Settings",
          headerLargeTitleEnabled: true,
        }}
      />
      <Stack.Screen
        name="help-support"
        options={{
          headerTitle: "Help & Support",
          headerLargeTitleEnabled: true,
        }}
      />
    </Stack>
  );
}
