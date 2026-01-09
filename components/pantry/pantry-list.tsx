import { useAddListItem } from "@/api/list-item/mutations";
import { useConsumePantryItem } from "@/api/pantry/mutations";
import { usePantryItems } from "@/api/pantry/queries";
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
import { Tables } from "@/lib/database.types";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { router } from "expo-router";
import { MoreVertical, RefrigeratorIcon } from "lucide-react-native";
import { useState } from "react";
import { Alert, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { ListItem } from "../list-item";
import RefetchControl from "../refetch-control";
import { Button } from "../ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemTitle,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { PantryItemDropdown } from "./pantry-item-dropdown";

const PantryItem = ({ item }: { item: Tables<"pantry_items"> }) => {
  const { householdId } = useHouseholdStore();
  const { mutateAsync: consumePantryItem, isPending } = useConsumePantryItem(
    householdId ?? ""
  );
  const { mutateAsync: addListItem, isPending: isAddingListItem } =
    useAddListItem(householdId ?? "");
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useAuthStore();
  const handleConsume = async (itemId: string) => {
    await consumePantryItem({
      householdId: householdId ?? "",
      itemId,
      quantity: 1,
    });
  };

  const handlePress = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleAddToGroceryList = async (itemId: string) => {
    if (!householdId || !user) return;
    await addListItem({
      householdId,
      groceryItemId: itemId,
      quantity: 1,
    });

    Alert.alert("Item added to grocery list");
  };

  const handleViewItem = (itemId: string) => {
    router.push({
      pathname: "/(protected)/(modals)/grocery-item",
      params: { id: itemId },
    });
  };

  return (
    <>
      <Animated.View
        layout={LinearTransition.duration(200)}
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="overflow-hidden bg-background"
      >
        <ListItem
          item={{
            id: item.grocery_item_id,
            name: item.name,
            image_url: item.image_url,
            subtitle: `${item.total_quantity} total`,
            is_global: item.is_global,
          }}
          handlePress={handlePress}
          renderRight={() =>
            isPending ? (
              <Spinner />
            ) : (
              <DropdownMenuRoot>
                <DropdownMenuTrigger>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    size="icon"
                  >
                    <Icon as={MoreVertical} className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    key="consume"
                    onSelect={() => handleConsume(item.grocery_item_id ?? "")}
                  >
                    <DropdownMenuItemTitle>Consume</DropdownMenuItemTitle>
                    <DropdownMenuItemIcon ios={{ name: "minus" }} />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    key="add-to-grocery-list"
                    onSelect={() =>
                      handleAddToGroceryList(item.grocery_item_id ?? "")
                    }
                  >
                    <DropdownMenuItemTitle>
                      Add to Grocery List
                    </DropdownMenuItemTitle>
                    <DropdownMenuItemIcon ios={{ name: "scroll" }} />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    key="view-item"
                    onSelect={() => handleViewItem(item.grocery_item_id ?? "")}
                  >
                    <DropdownMenuItemTitle>View Item</DropdownMenuItemTitle>
                    <DropdownMenuItemIcon ios={{ name: "eye" }} />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuRoot>
            )
          }
        />
      </Animated.View>
      {showDropdown && item.grocery_item_id && (
        <PantryItemDropdown itemId={item.grocery_item_id} />
      )}
    </>
  );
};

export default function PantryList() {
  const { householdId } = useHouseholdStore();
  const { data, isLoading, refetch } = usePantryItems(householdId ?? undefined);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  return (
    <BScrollView refreshControl={<RefetchControl refetch={refetch} />}>
      {!data || data.length === 0 ? (
        <Empty>
          <EmptyContent>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon as={RefrigeratorIcon} />
              </EmptyMedia>
              <EmptyTitle>No items in pantry</EmptyTitle>
              <EmptyDescription>
                You don't have any items in your pantry yet. Checkout of your
                grocery list to add items to your pantry.
              </EmptyDescription>
            </EmptyHeader>
          </EmptyContent>
        </Empty>
      ) : (
        data.map((item, index) => (
          <PantryItem key={item.grocery_item_id ?? index} item={item} />
        ))
      )}
    </BScrollView>
  );
}
