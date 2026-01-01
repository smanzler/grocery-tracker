import { useAuthStore } from "@/stores/auth-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

export default function LinkHandler() {
  const { type, token } = useLocalSearchParams<{
    type?: string;
    token?: string;
  }>();

  const { user, initializing } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;

    if (type === "join-household" && token) {
      if (!user) {
        router.replace({
          pathname: "/(auth)",
          params: {
            redirectTo: `/link-handler?type=join-household&token=${token}`,
          },
        });
      } else {
        router.replace("/");

        setTimeout(() => {
          router.push({
            pathname: "/(protected)/(modals)/join-household",
            params: { token },
          });
        }, 0);
      }
      return;
    }

    router.replace("/");
  }, [type, token, user, initializing]);

  return null;
}
