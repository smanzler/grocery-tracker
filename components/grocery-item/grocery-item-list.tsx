import { useDeleteGroceryItem } from "@/api/grocery-item/mutations";
import { useGroceryItems } from "@/api/grocery-item/queries";
import { useCreateListItem } from "@/api/list-item/mutations";
import { useAddPantryItem } from "@/api/pantry/mutations";
import { BScrollView } from "@/components/scroll/b-scroll-view";
import { Avatar, AvatarImage, ColoredFallback } from "@/components/ui/avatar";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Tables } from "@/lib/database.types";
import { formatFoodGroup } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { router } from "expo-router";
import { Globe, ShoppingBasketIcon } from "lucide-react-native";
import { Alert, Pressable, View } from "react-native";
import RefetchControl from "../refetch-control";
import {
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuItemIcon,
  ContextMenuItemTitle,
  ContextMenuRoot,
  ContextMenuTrigger,
} from "../ui/context-menu";

const GroceryItem = ({ item }: { item: Tables<"grocery_items"> }) => {
  const { user } = useAuthStore();
  const { householdId } = useHouseholdStore();

  const { mutateAsync: addToShoppingList, isPending: isAddingToShoppingList } =
    useCreateListItem(householdId ?? "");
  const { mutateAsync: addToPantry, isPending: isAddingToPantry } =
    useAddPantryItem(householdId ?? "");
  const { mutateAsync: deleteGroceryItem, isPending: isDeletingGroceryItem } =
    useDeleteGroceryItem();

  const handlePress = () => {
    router.push({
      pathname: "/(protected)/(modals)/grocery-item",
      params: { id: item.id },
    });
  };

  const foodGroup = formatFoodGroup(item.food_groups);

  const handleAddToShoppingList = async () => {
    if (!householdId || !user) return;

    await addToShoppingList({
      grocery_item_id: item.id,
      household_id: householdId,
      quantity: 1,
      user_id: user.id,
    });

    router.replace("/(protected)/(tabs)");

    Alert.alert("Item added to shopping list");
  };

  const handleAddToPantry = async () => {
    if (!householdId || !user) return;

    await addToPantry({
      householdId,
      items: [{ grocery_item_id: item.id, quantity: 1 }],
    });

    router.replace("/(protected)/(tabs)/pantry");

    Alert.alert("Item added to pantry");
  };

  const handleEdit = () => {
    router.push({
      pathname: "/(protected)/(modals)/edit-grocery-item",
      params: { id: item.id },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this grocery item?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: handleDeletePress },
      ]
    );
  };

  const handleDeletePress = async () => {
    if (!householdId || !user) return;

    await deleteGroceryItem(item.id);

    Alert.alert("Success", "Grocery item deleted successfully");
  };

  const handleMerge = () => {
    setTimeout(() => {
      router.push({
        pathname: "/(protected)/(modals)/select-grocery-item",
        params: { sourceId: item.id },
      });
    }, 0);
  };

  return (
    <ContextMenuRoot key={item.id}>
      <ContextMenuTrigger>
        <Pressable
          className="flex-row items-center gap-2 rounded-md gap-4 p-1"
          onPress={handlePress}
        >
          <View className="relative">
            <Avatar alt={item.name ?? ""} className="size-12 rounded-md">
              <AvatarImage source={{ uri: item.image_url ?? undefined }} />
              <ColoredFallback
                id={item.id}
                text={item.name?.charAt(0) ?? "I"}
                className="size-12 rounded-md"
              />
            </Avatar>
            {item.is_global && (
              <View className="absolute -bottom-1 -right-1 size-5 bg-blue-500 rounded-full border border-white items-center justify-center">
                <Icon as={Globe} className="size-3 text-white" />
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="flex-shrink text-ellipsis line-clamp-2">
              {item.name ?? ""}
            </Text>
            {(item.brand || foodGroup) && (
              <Text className="text-sm text-muted-foreground line-clamp-2">
                {[item.brand, foodGroup].filter(Boolean).join(" | ")}
              </Text>
            )}
          </View>
          {item.quantity && (
            <Text>
              {item.quantity}
              {item.quantity_unit ? ` ${item.quantity_unit}` : ""}
            </Text>
          )}
        </Pressable>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuItem
            key="add-to-shopping-list"
            onSelect={handleAddToShoppingList}
          >
            <ContextMenuItemTitle>Add to Grocery List</ContextMenuItemTitle>
            <ContextMenuItemIcon ios={{ name: "scroll" }} />
          </ContextMenuItem>
          <ContextMenuItem key="add-to-pantry" onSelect={handleAddToPantry}>
            <ContextMenuItemTitle>Add to Pantry</ContextMenuItemTitle>
            <ContextMenuItemIcon ios={{ name: "refrigerator" }} />
          </ContextMenuItem>
        </ContextMenuGroup>
        {!item.is_global && user?.id === item.user_id && (
          <ContextMenuGroup>
            <ContextMenuItem key="edit" onSelect={handleEdit}>
              <ContextMenuItemTitle>Edit</ContextMenuItemTitle>
              <ContextMenuItemIcon ios={{ name: "pencil" }} />
            </ContextMenuItem>
            <ContextMenuItem key="merge" onSelect={handleMerge}>
              <ContextMenuItemTitle>Merge</ContextMenuItemTitle>
              <ContextMenuItemIcon ios={{ name: "arrow.trianglehead.merge" }} />
            </ContextMenuItem>
            <ContextMenuItem key="delete" destructive onSelect={handleDelete}>
              <ContextMenuItemTitle>Delete</ContextMenuItemTitle>
              <ContextMenuItemIcon ios={{ name: "trash" }} />
            </ContextMenuItem>
          </ContextMenuGroup>
        )}
      </ContextMenuContent>
    </ContextMenuRoot>
  );
};

export default function GroceryItemList() {
  const { data, isLoading, refetch } = useGroceryItems(undefined);

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
                <Icon as={ShoppingBasketIcon} />
              </EmptyMedia>
            </EmptyHeader>
          </EmptyContent>
        </Empty>
      ) : (
        data.map((item) => <GroceryItem key={item.id} item={item} />)
      )}
    </BScrollView>
  );
}
