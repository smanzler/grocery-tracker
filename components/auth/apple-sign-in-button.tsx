import { supabase } from "@/lib/supabase";
import * as AppleAuthentication from "expo-apple-authentication";
import { useState } from "react";
import { Alert } from "react-native";

export default function AppleSignInButton() {
  const [loading, setLoading] = useState(false);

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
      cornerRadius={12}
      onPress={async () => {
        if (loading) return;

        setLoading(true);
        try {
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });

          if (credential.identityToken) {
            const { error } = await supabase.auth.signInWithIdToken({
              provider: "apple",
              token: credential.identityToken,
            });

            if (error) {
              Alert.alert("Sign In Failed", error.message);
            }
          } else {
            Alert.alert(
              "Sign In Failed",
              "No identity token received from Apple."
            );
          }
        } catch (e: any) {
          if (e.code === "ERR_REQUEST_CANCELED") {
            return;
          }

          Alert.alert(
            "Sign In Failed",
            e.message || "An error occurred during sign in."
          );
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}
