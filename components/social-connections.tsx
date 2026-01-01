import AppleSignInButton from "@/components/auth/apple-sign-in-button";
import GoogleSignInButton from "@/components/auth/google-sign-in-button";
import { View } from "react-native";

export function SocialConnections() {
  return (
    <View className="flex-col gap-3">
      <AppleSignInButton />
      <GoogleSignInButton />
    </View>
  );
}
