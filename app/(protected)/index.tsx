import { HouseholdList } from "@/components/household/household-list";
import { Stack } from "expo-router";

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Households" }} />
      <HouseholdList />
    </>
  );
}
