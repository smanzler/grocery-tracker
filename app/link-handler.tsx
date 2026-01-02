import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/lib/supabase";
import { useIntentStore } from "@/stores/intent-store";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert, View } from "react-native";

type HashURL = {
  type?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: string;
  expires_at?: string;
  token_type?: string;
  error?: string;
  error_code?: string;
  error_description?: string;
};

const parseHashURL = (url: string | null): HashURL | null => {
  if (!url) return null;
  const fragment = url.split("#")[1];
  if (!fragment) return null;
  const params = Object.fromEntries(
    fragment.split("&").map((part) => part.split("="))
  );
  return params;
};

export default function LinkHandler() {
  const { type, token } = useLocalSearchParams<{
    type?: string;
    token?: string;
  }>();
  const router = useRouter();
  const setIntent = useIntentStore((s) => s.setIntent);

  const url = Linking.useLinkingURL();

  const parsed = parseHashURL(url);

  console.log(parsed);

  useEffect(() => {
    const handleLink = async () => {
      if (type === "join-household" && token) {
        setIntent({ type, token });

        router.replace("/");
        return;
      }

      if (!!parsed) {
        if (parsed.error) {
          Alert.alert(
            "Error",
            parsed.error_description?.replaceAll("+", " ") ??
              "An unknown error occurred"
          );
          router.replace("/");
          return;
        }

        if (
          parsed.type === "recovery" &&
          parsed.access_token &&
          parsed.refresh_token
        ) {
          const { error } = await supabase.auth.setSession({
            access_token: parsed.access_token,
            refresh_token: parsed.refresh_token,
          });

          if (error) {
            Alert.alert("Error", error.message);
            router.replace("/");
            return;
          }

          setIntent({ type: "update-password", token: parsed.access_token });

          router.replace("/(protected)");
          return;
        }

        if (parsed.access_token && parsed.refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token: parsed.access_token,
            refresh_token: parsed.refresh_token,
          });

          if (error) {
            Alert.alert("Error", error.message);
            router.replace("/");
            return;
          }

          router.replace("/(protected)");
          return;
        }
      }

      router.replace("/");
    };

    handleLink();
  }, [type, token, router, setIntent]);

  return (
    <View className="flex-1 items-center justify-center">
      <Spinner />
    </View>
  );
}
