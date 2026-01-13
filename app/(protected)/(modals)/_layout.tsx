import { Stack } from "expo-router";

export default function ModalsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="create-household"
        options={{
          headerTitle: "Create Household",
          headerLargeTitleEnabled: true,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="edit-household"
        options={{
          headerTitle: "Edit Household",
          headerLargeTitleEnabled: true,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="join-household"
        options={{
          headerTitle: "Join Household",
          headerLargeTitleEnabled: true,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerTitle: "Profile",
          headerLargeTitleEnabled: true,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerTitle: "Settings",
          headerLargeTitleEnabled: true,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="help-support"
        options={{
          headerTitle: "Help & Support",
          headerLargeTitleEnabled: true,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="update-password"
        options={{
          headerTitle: "Update Password",
          headerLargeTitleEnabled: true,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="add-list-item-barcode"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="grocery-item"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="edit-grocery-item"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="select-grocery-item"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="scan-receipt"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
