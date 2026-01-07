import { useDeleteGroceryItem } from "@/api/grocery-item/mutations";
import { useGroceryItem } from "@/api/grocery-item/queries";
import { useCreateListItem } from "@/api/list-item/mutations";
import { useInsertPantryItem } from "@/api/pantry/mutations";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemTitle,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { formatFoodGroup } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { Header } from "@react-navigation/elements";
import { ImageBackground } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Globe, MoreVertical, ShoppingBasketIcon } from "lucide-react-native";
import { Alert, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from "react-native-reanimated";

function GroceryItemContent({
  groceryItem,
}: {
  groceryItem: Tables<"grocery_items">;
}) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const { user } = useAuthStore();
  const { householdId } = useHouseholdStore();
  const { targetId } = useLocalSearchParams<{ targetId?: string }>();

  const { mutateAsync: addToShoppingList, isPending: isAddingToShoppingList } =
    useCreateListItem(householdId ?? "");
  const { mutateAsync: addToPantry, isPending: isAddingToPantry } =
    useInsertPantryItem(householdId ?? "");
  const { mutateAsync: deleteGroceryItem, isPending: isDeletingGroceryItem } =
    useDeleteGroceryItem();

  const IMAGE_HEIGHT = groceryItem.image_url ? 300 : 100;

  const imageContainerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollOffset.value,
          [-IMAGE_HEIGHT, 0, IMAGE_HEIGHT],
          [-IMAGE_HEIGHT / 2, 0, IMAGE_HEIGHT * 0.75]
        ),
      },
      {
        scale: interpolate(
          scrollOffset.value,
          [-IMAGE_HEIGHT, 0, IMAGE_HEIGHT],
          [2, 1, 1]
        ),
      },
    ],
  }));

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollOffset.value,
      [IMAGE_HEIGHT / 1.5, IMAGE_HEIGHT],
      [0, 1]
    ),
  }));

  const foodGroup = formatFoodGroup(groceryItem.food_groups);

  const handleAddToShoppingList = async () => {
    if (!householdId || !user) return;

    await addToShoppingList({
      grocery_item_id: groceryItem.id,
      household_id: householdId,
      quantity: 1,
      user_id: user.id,
    });

    router.back();

    setTimeout(() => {
      router.replace("/(protected)/(tabs)");
    }, 0);

    Alert.alert("Item added to shopping list");
  };

  const handleAddToPantry = async () => {
    if (!householdId || !user) return;

    await addToPantry({
      grocery_item_id: groceryItem.id,
      household_id: householdId,
      quantity: 1,
      user_id: user.id,
    });

    router.back();

    setTimeout(() => {
      router.replace("/(protected)/(tabs)/pantry");
    }, 0);

    Alert.alert("Item added to pantry");
  };

  const handleEdit = () => {
    router.push({
      pathname: "/(protected)/(modals)/edit-grocery-item",
      params: { id: groceryItem.id },
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

    await deleteGroceryItem(groceryItem.id);

    router.back();

    Alert.alert("Success", "Grocery item deleted successfully");
  };

  const handleMerge = () => {
    router.back();
    setTimeout(() => {
      router.push({
        pathname: "/(protected)/(modals)/select-grocery-item",
        params: { sourceId: groceryItem.id },
      });
    }, 0);
  };

  const isLoading =
    isAddingToShoppingList || isAddingToPantry || isDeletingGroceryItem;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <Animated.View
              style={headerStyle}
              className="absolute top-0 left-0 right-0"
            >
              <Header title={groceryItem.name ?? ""} />
            </Animated.View>
          ),
        }}
      />
      <Animated.ScrollView
        ref={scrollRef}
        contentInsetAdjustmentBehavior="automatic"
      >
        {groceryItem.image_url ? (
          <Animated.View
            style={[imageContainerStyle, { height: IMAGE_HEIGHT }]}
            className="w-full overflow-hidden items-center justify-center bg-muted"
          >
            <ImageBackground
              source={groceryItem.image_url}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        ) : (
          <View className="h-12" />
        )}
        <View className="relative flex-1 bg-background p-4 min-h-48">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text variant="h1" className="text-left">
                {groceryItem.name}
              </Text>
              {groceryItem.is_global && (
                <Icon as={Globe} className="size-6 text-blue-500" />
              )}
            </View>
            <DropdownMenuRoot>
              <DropdownMenuTrigger disabled={isLoading}>
                {isLoading ? (
                  <Spinner />
                ) : (
                  <Icon
                    as={MoreVertical}
                    className="size-6 text-muted-foreground"
                  />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    key="add-to-shopping-list"
                    onSelect={handleAddToShoppingList}
                  >
                    <DropdownMenuItemTitle>
                      Add to Grocery List
                    </DropdownMenuItemTitle>
                    <DropdownMenuItemIcon ios={{ name: "scroll" }} />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    key="add-to-pantry"
                    onSelect={handleAddToPantry}
                  >
                    <DropdownMenuItemTitle>Add to Pantry</DropdownMenuItemTitle>
                    <DropdownMenuItemIcon ios={{ name: "refrigerator" }} />
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                {!groceryItem.is_global && user?.id === groceryItem.user_id && (
                  <DropdownMenuGroup>
                    <DropdownMenuItem key="edit" onSelect={handleEdit}>
                      <DropdownMenuItemTitle>Edit</DropdownMenuItemTitle>
                      <DropdownMenuItemIcon ios={{ name: "pencil" }} />
                    </DropdownMenuItem>
                    <DropdownMenuItem key="merge" onSelect={handleMerge}>
                      <DropdownMenuItemTitle>Merge</DropdownMenuItemTitle>
                      <DropdownMenuItemIcon ios={{ name: "merge" }} />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      key="delete"
                      destructive
                      onSelect={handleDelete}
                    >
                      <DropdownMenuItemTitle>Delete</DropdownMenuItemTitle>
                      <DropdownMenuItemIcon ios={{ name: "trash" }} />
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                )}
              </DropdownMenuContent>
            </DropdownMenuRoot>
          </View>
          <Text variant="lead">
            {[groceryItem.brand, foodGroup].filter(Boolean).join(" | ")}
          </Text>
          {groceryItem.quantity && (
            <Text variant="lead">
              {groceryItem.quantity}
              {groceryItem.quantity_unit ? ` ${groceryItem.quantity_unit}` : ""}
            </Text>
          )}
        </View>
      </Animated.ScrollView>
    </>
  );
}

export default function GroceryItem() {
  const { id } = useLocalSearchParams();

  const { data: groceryItem, isLoading } = useGroceryItem(
    typeof id === "string" ? id : undefined
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  if (!groceryItem || !groceryItem.name) {
    return (
      <Empty>
        <EmptyContent>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon as={ShoppingBasketIcon} />
            </EmptyMedia>
            <EmptyTitle>Grocery item not found</EmptyTitle>
            <EmptyDescription>
              The grocery item you are looking for does not exist.
            </EmptyDescription>
          </EmptyHeader>
        </EmptyContent>
      </Empty>
    );
  }

  return <GroceryItemContent groceryItem={groceryItem} />;
}
