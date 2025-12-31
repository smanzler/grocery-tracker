import { usePantryItems } from "@/api/pantry/queries";
import { PantryItem } from "@/components/pantry/pantry-item";
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
import { PlusIcon, RefrigeratorIcon } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { useUniwind } from "uniwind";

export default function Pantry() {
  const { theme } = useUniwind();
  const { householdId } = useHouseholdStore();
  const { data, isLoading } = usePantryItems(householdId ?? undefined);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Empty>
        <EmptyContent>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon as={RefrigeratorIcon} />
            </EmptyMedia>
            <EmptyTitle>No items in pantry</EmptyTitle>
            <EmptyDescription>
              You don't have any items in your pantry yet. Add items to your
              grocery list and mark them as bought, or add items directly to the
              pantry.
            </EmptyDescription>
          </EmptyHeader>
          <Button>
            <Text>Add Item</Text>
            <Icon as={PlusIcon} color={theme === "dark" ? "black" : "white"} />
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <ScrollView className="px-6" contentContainerClassName="gap-2 py-4">
      {data.map((item) => (
        <PantryItem key={item.id} item={item} />
      ))}
    </ScrollView>
  );
}
