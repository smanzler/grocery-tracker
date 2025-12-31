import { useUpdateListItem } from "@/api/list-item/mutations";
import { useListItems } from "@/api/list-item/queries";
import { BScrollView } from "@/components/scroll/b-scroll-view";
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
import { Tables } from "@/lib/database.types";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { ShoppingCartIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { AnimatedCheckbox } from "./animated-checkbox";

export default function ListItemList() {
  const { householdId } = useHouseholdStore();
  const { data, isLoading } = useListItems(householdId ?? undefined);
  const { user } = useAuthStore();
  const { mutateAsync: updateListItem, isPending } = useUpdateListItem(
    householdId ?? ""
  );

  if (isLoading || !user || !householdId) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  const handleCompleteChange = async (item: Tables<"list_items">) => {
    if (isPending) return;
    await updateListItem({
      id: item.id,
      checked: !item.checked,
    });
  };

  if (!data || data.length === 0) {
    return (
      <Empty>
        <EmptyContent className="max-w-[300px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon as={ShoppingCartIcon} />
            </EmptyMedia>
            <EmptyTitle>No items in list</EmptyTitle>
            <EmptyDescription>
              You don't have any items in your grocery list yet. Add items to
              your list to get started.
            </EmptyDescription>
          </EmptyHeader>
        </EmptyContent>
      </Empty>
    );
  }

  const sortedData = [...data].sort((a, b) => {
    if (new Date(a.created_at) < new Date(b.created_at)) return 1;
    if (new Date(a.created_at) > new Date(b.created_at)) return -1;
    return 0;
  });

  return (
    <BScrollView>
      {sortedData.map((item) => (
        <Pressable
          key={item.id}
          className="flex-row items-center justify-between p-2 rounded-md bg-card"
          onPress={() => handleCompleteChange(item)}
          disabled={isPending}
        >
          <View className="flex-row items-center gap-2">
            <AnimatedCheckbox checked={item.checked} />
            <Text>{item.quantity}</Text>
            <Text>{item.grocery_items?.name ?? ""}</Text>
          </View>
        </Pressable>
      ))}
    </BScrollView>
  );
}
