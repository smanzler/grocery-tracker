import { ProfileButton } from "@/components/auth/profile-button";
import { HouseholdList } from "@/components/household/household-list";
import { Header } from "@react-navigation/elements";
import { Stack } from "expo-router";

export default function Home() {
  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <Header
              title="Grocery List"
              headerLeft={() => <ProfileButton />}
              headerLeftContainerStyle={{ paddingLeft: 16 }}
            />
          ),
        }}
      />
      <HouseholdList />
    </>
  );
}
