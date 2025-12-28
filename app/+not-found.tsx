import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Link, Stack } from "expo-router";
import { HelpCircle } from "lucide-react-native";
import { View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center">
        <Icon as={HelpCircle} className="size-10" />

        <Text className="text-2xl font-bold">This screen doesn't exist.</Text>

        <Link href="/" asChild replace>
          <Button variant="link">
            <Text className="underline">Go to home screen!</Text>
          </Button>
        </Link>
      </View>
    </>
  );
}
