import { useIntentStore } from "@/stores/intent-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

export default function LinkHandler() {
  const { type, token } = useLocalSearchParams<{
    type?: string;
    token?: string;
  }>();
  const router = useRouter();
  const setIntent = useIntentStore((s) => s.setIntent);

  useEffect(() => {
    if (type === "join-household" && token) {
      setIntent({ type, token });

      router.replace("/");
    } else {
      router.replace("/");
    }
  }, [type, token, router, setIntent]);

  return null;
}
