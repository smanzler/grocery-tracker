import { Stack } from "expo-router";
import React from "react";

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        animation: "none",
      }}
    >
      <Stack.Screen name="index" options={{ headerTitle: "Sign In" }} />
      <Stack.Screen name="sign-up" options={{ headerTitle: "Sign Up" }} />
      <Stack.Screen
        name="forgot-password"
        options={{ headerTitle: "Forgot Password", animation: "default" }}
      />
      <Stack.Screen
        name="email-sent-success"
        options={{
          headerTitle: "Email Sent Successfully",
        }}
      />
    </Stack>
  );
};

export default Layout;
