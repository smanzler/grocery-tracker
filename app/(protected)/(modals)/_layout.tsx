import { Stack } from "expo-router";

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ presentation: "modal" }}>
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
      <Stack.Screen
        name="update-password"
        options={{
          headerTitle: "Update Password",
          headerLargeTitleEnabled: true,
        }}
      />
      <Stack.Screen
        name="add-list-item-barcode"
        options={{
          headerShown: false,
          animation: "none",
        }}
      />
      <Stack.Screen
        name="grocery-item"
        options={{
          headerShown: false,
          animation: "none",
        }}
      />
    </Stack>
  );
}
