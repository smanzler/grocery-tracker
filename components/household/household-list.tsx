import { useHouseholds } from "@/api/household/queries";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useHouseholdStore } from "@/stores/household-store";
import { router } from "expo-router";
import { HomeIcon, PlusIcon } from "lucide-react-native";
import { ScrollView } from "react-native";
import { useUniwind } from "uniwind";

export const HouseholdList = () => {
  const { data, isLoading } = useHouseholds();
  const { selectHousehold } = useHouseholdStore();

  const { theme } = useUniwind();

  if (isLoading) {
    return <Spinner />;
  }

  if (!data || data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon as={HomeIcon} />
          </EmptyMedia>
          <EmptyTitle>No households found</EmptyTitle>
          <EmptyDescription>
            You don't have any households yet. Create a new household to get
            started.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            onPress={() => {
              console.log("create household");
              router.push("/(protected)/(modals)/create-household");
            }}
          >
            <Text>Create Household</Text>
            <Icon as={PlusIcon} color={theme === "dark" ? "black" : "white"} />
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <ScrollView
      className="p-4"
      contentContainerClassName="gap-2"
      contentInsetAdjustmentBehavior="automatic"
    >
      {data.map((household) => (
        <Button
          key={household.id}
          variant="outline"
          onPress={() => selectHousehold(household.id)}
        >
          <Text>{household.name}</Text>
        </Button>
      ))}
      <Button
        onPress={() => {
          console.log("create household");
          router.push("/(protected)/(modals)/create-household");
        }}
      >
        <Text>Create Household</Text>
        <Icon as={PlusIcon} color={theme === "dark" ? "black" : "white"} />
      </Button>
    </ScrollView>
  );
};
