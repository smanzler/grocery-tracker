import { ProfileButton } from "@/components/auth/profile-button";
import { HouseholdList } from "@/components/household/household-list";
import { Icon } from "@/components/ui/icon";
import { Header } from "@react-navigation/elements";
import { router, Stack } from "expo-router";
import { MailIcon } from "lucide-react-native";
import { Pressable } from "react-native";

export default function Home() {
  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <Header
              title="Households"
              headerLeft={() => <ProfileButton />}
              headerRight={() => (
                <Pressable
                  onPress={() =>
                    router.push("/(protected)/(modals)/join-household")
                  }
                >
                  <Icon as={MailIcon} className="size-4" />
                </Pressable>
              )}
              headerLeftContainerStyle={{ paddingLeft: 16 }}
              headerRightContainerStyle={{ paddingRight: 16 }}
            />
          ),
        }}
      />
      <HouseholdList />
    </>
  );
}
