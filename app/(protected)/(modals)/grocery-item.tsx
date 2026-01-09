import { useDeleteGroceryItem } from "@/api/grocery-item/mutations";
import { useGroceryItem } from "@/api/grocery-item/queries";
import { useCreateListItem } from "@/api/list-item/mutations";
import { usePantryEvents } from "@/api/pantry/events/queries";
import { useAddPantryItem } from "@/api/pantry/mutations";
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
import { format } from "date-fns";
import { ImageBackground } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  ArrowDownToLine,
  Globe,
  Home,
  MoreVertical,
  Plus,
  RefreshCw,
  ShoppingBasketIcon,
  Trash2,
} from "lucide-react-native";
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

  const { data: history } = usePantryEvents(householdId ?? "", groceryItem.id);

  const { mutateAsync: addToShoppingList, isPending: isAddingToShoppingList } =
    useCreateListItem(householdId ?? "");
  const { mutateAsync: addToPantry, isPending: isAddingToPantry } =
    useAddPantryItem(householdId ?? "");
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
      itemId: groceryItem.id,
      quantity: 1,
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
        <View className="relative flex-1 bg-background p-4">
          <View className="flex-row items-start gap-2 mb-1">
            <Text variant="h1" className="text-left flex-shrink flex-1">
              {groceryItem.name}
            </Text>
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
          <View className="flex-row items-center gap-2 mb-2">
            {groceryItem.is_global ? (
              <>
                <Icon as={Globe} className="size-5 text-blue-500" />
                <Text variant="lead" className="text-blue-500">
                  Global
                </Text>
              </>
            ) : (
              <>
                <Icon as={Home} className="size-5 text-muted-foreground" />
                <Text variant="lead" className="text-muted-foreground">
                  Household
                </Text>
              </>
            )}
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

        <View className="p-4">
          <Text variant="h3" className="mb-3">
            History
          </Text>
          {!history || history.length === 0 ? (
            <Empty>
              <EmptyContent>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Icon as={ShoppingBasketIcon} />
                  </EmptyMedia>
                  <EmptyTitle>No history found</EmptyTitle>
                  <EmptyDescription>
                    Your household has not added this item to the pantry yet.
                  </EmptyDescription>
                </EmptyHeader>
              </EmptyContent>
            </Empty>
          ) : (
            <View className="gap-2">
              {history.map((item) => {
                const eventConfig = {
                  add: {
                    icon: Plus,
                    label: "Added to pantry",
                    color: "text-green-500",
                  },
                  restock: {
                    icon: RefreshCw,
                    label: "Restocked",
                    color: "text-blue-500",
                  },
                  consume: {
                    icon: ArrowDownToLine,
                    label: "Consumed",
                    color: "text-orange-500",
                  },
                  remove: {
                    icon: Trash2,
                    label: "Removed from pantry",
                    color: "text-destructive",
                  },
                }[item.event] || {
                  icon: ShoppingBasketIcon,
                  label: item.event,
                  color: "text-muted-foreground",
                };

                return (
                  <View
                    key={item.id}
                    className="flex-row items-center justify-between py-2 px-3 bg-muted rounded-lg"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <Icon
                        as={eventConfig.icon}
                        className={`size-4 ${eventConfig.color}`}
                      />
                      <Text className="font-medium">{eventConfig.label}</Text>
                    </View>
                    <Text className="text-sm text-muted-foreground">
                      {format(new Date(item.created_at), "MMM d, yyyy hh:mm a")}
                    </Text>
                  </View>
                );
              })}
            </View>
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
