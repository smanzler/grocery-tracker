import { ProfileButton } from "@/components/auth/profile-button";
import { HouseholdList } from "@/components/household/household-list";
import { Header } from "@react-navigation/elements";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function Home() {
  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <Header
              title="Households"
              headerLeft={() => <ProfileButton />}
              headerRight={() => <View className="size-8" />}
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
