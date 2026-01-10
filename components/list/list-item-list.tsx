import {
  useAddListItem,
  useRemoveListItem,
  useToggleListItemChecked,
} from "@/api/list-item/mutations";
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
import { Tables } from "@/lib/database.types";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  Ellipsis,
  Minus,
  Plus,
  ShoppingBasket,
  ShoppingCartIcon,
  Trash,
  X,
} from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Pressable, View } from "react-native";
import {
  default as Swipeable,
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  FadeIn,
  FadeOut,
  interpolateColor,
  LinearTransition,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useCSSVariable } from "uniwind";
import { ListItem as ListItemComponent } from "../list-item";
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
import { Text } from "../ui/text";
import { AnimatedCheckbox } from "./animated-checkbox";

const ListItem = ({
  item,
}: {
  item: Tables<"list_items"> & { grocery_items: Tables<"grocery_items"> };
}) => {
  const { user } = useAuthStore();

  const { mutate: toggleListItemChecked, isPending } = useToggleListItemChecked(
    item.household_id ?? ""
  );
  const { mutate: removeListItem, isPending: isRemovingItem } =
    useRemoveListItem(item.household_id ?? "");
  const { mutate: addListItem, isPending: isAddingItem } = useAddListItem(
    item.household_id ?? ""
  );

  const [muted, green500] = useCSSVariable([
    "--color-muted",
    "--color-green-500",
  ]);

  const swipeableRef = useRef<SwipeableMethods>(null);

  const isDraggingRef = useRef(false);
  const overshootingLeftRef = useRef(false);
  const hasTriggeredLeftHaptic = useSharedValue(false);

  const OVERSHOOT_THRESHOLD = 150;

  const animatedChecked = useSharedValue(item.checked ? 1 : 0);

  useEffect(() => {
    animatedChecked.value = withTiming(item.checked ? 1 : 0, { duration: 300 });
  }, [item.checked, animatedChecked]);

  const handleDragStart = () => {
    isDraggingRef.current = true;
    overshootingLeftRef.current = false;
    hasTriggeredLeftHaptic.value = false;
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
  };

  const handleCompleteChangeAction = () => {
    if (!item.household_id || !item.grocery_item_id) return;

    toggleListItemChecked({
      householdId: item.household_id ?? "",
      groceryItemId: item.grocery_item_id ?? "",
    });

    swipeableRef.current?.close();
  };

  const handleSwipeableWillOpen = (direction: "left" | "right") => {
    if (direction === "right" && overshootingLeftRef.current) {
      handleCompleteChangeAction();
    }
  };

  const updateOvershootLeft = (value: boolean) => {
    overshootingLeftRef.current = value;
  };

  const triggerLeftHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleCompleteChange = () => {
    if (isPending || isDraggingRef.current) return;

    if (!item.household_id || !item.grocery_item_id) return;

    toggleListItemChecked({
      householdId: item.household_id,
      groceryItemId: item.grocery_item_id,
    });
  };

  const handleSubtractQuantity = () => {
    if (!item.household_id || !item.grocery_item_id) return;

    removeListItem({
      householdId: item.household_id,
      groceryItemId: item.grocery_item_id,
      quantity: 1,
    });
  };

  const handleAddQuantity = () => {
    if (!item.household_id || !item.grocery_item_id) return;

    addListItem({
      householdId: item.household_id,
      groceryItemId: item.grocery_item_id,
      quantity: 1,
    });
  };

  const handleViewItem = () => {
    if (!item.household_id || !item.grocery_item_id) return;

    swipeableRef.current?.close();

    router.push({
      pathname: "/(protected)/(modals)/grocery-item",
      params: { id: item.grocery_item_id },
    });
  };

  const handleRemove = () => {
    if (!item.household_id || !item.grocery_item_id) return;

    removeListItem({
      householdId: item.household_id,
      groceryItemId: item.grocery_item_id,
      quantity: item.total_quantity,
    });
  };

  const handleEdit = () => {
    if (!item.household_id || !item.grocery_item_id) return;

    swipeableRef.current?.close();

    router.push({
      pathname: "/(protected)/(modals)/edit-grocery-item",
      params: { id: item.grocery_item_id },
    });
  };

  return (
    <Animated.View
      className="rounded-md overflow-hidden"
      layout={LinearTransition.duration(200)}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
    >
      <Swipeable
        ref={swipeableRef}
        overshootFriction={4}
        onSwipeableOpenStartDrag={handleDragStart}
        onSwipeableWillClose={handleDragEnd}
        onSwipeableWillOpen={handleSwipeableWillOpen}
        renderLeftActions={(_, translation) => {
          const opacity = useDerivedValue(() => {
            return withTiming(translation.value > 50 ? 1 : 0, {
              duration: 200,
            });
          });

          const backgroundStyle = useAnimatedStyle(() => {
            const isOvershoot = translation.value > OVERSHOOT_THRESHOLD;

            if (isOvershoot && !hasTriggeredLeftHaptic.value) {
              hasTriggeredLeftHaptic.value = true;
              scheduleOnRN(triggerLeftHaptic);
            }

            scheduleOnRN(updateOvershootLeft, isOvershoot);

            const backgroundColor = interpolateColor(
              animatedChecked.value,
              [0, 1],
              [
                (green500 as string) || "#22c55e",
                (muted as string) || "#d4d4d8",
              ]
            );

            return {
              width: translation.value + 8,
              backgroundColor,
            };
          });

          const iconStyle = useAnimatedStyle(() => {
            return {
              opacity: opacity.value,
            };
          });

          const whiteIconStyle = useAnimatedStyle(() => {
            return {
              opacity: withTiming(1 - animatedChecked.value, { duration: 300 }),
            };
          });

          const blackIconStyle = useAnimatedStyle(() => {
            return {
              opacity: withTiming(animatedChecked.value, { duration: 300 }),
            };
          });

          return (
            <Pressable
              onPress={handleCompleteChangeAction}
              className="relative h-full"
              style={{ width: OVERSHOOT_THRESHOLD }}
            >
              <Animated.View
                className="absolute top-0 left-0 h-full items-center justify-center"
                style={backgroundStyle}
              >
                <Animated.View style={iconStyle}>
                  <View className="relative">
                    <Animated.View style={whiteIconStyle}>
                      <Icon
                        as={ShoppingBasket}
                        className="size-5"
                        color="#ffffff"
                      />
                    </Animated.View>
                    <Animated.View
                      style={[
                        blackIconStyle,
                        { position: "absolute", top: 0, left: 0 },
                      ]}
                    >
                      <Icon as={X} className="size-5" color="#000000" />
                    </Animated.View>
                  </View>
                </Animated.View>
              </Animated.View>
            </Pressable>
          );
        }}
        renderRightActions={(_, translation) => {
          const BUTTON_WIDTH = 70;

          const opacity = useDerivedValue(() => {
            return withTiming(-translation.value > BUTTON_WIDTH ? 1 : 0, {
              duration: 200,
            });
          });

          const backgroundStyle = useAnimatedStyle(() => {
            return {
              width: -translation.value + 8,
            };
          });

          const iconStyle = useAnimatedStyle(() => {
            return {
              opacity: opacity.value,
            };
          });

          return (
            <View className="h-full" style={{ width: BUTTON_WIDTH * 2 }}>
              <Animated.View
                style={backgroundStyle}
                className="absolute top-0 right-0 h-full items-center justify-center flex-row"
              >
                <View className="flex-1">
                  <DropdownMenuRoot>
                    <DropdownMenuTrigger asChild>
                      <Pressable className="h-full items-center justify-center bg-muted">
                        <Animated.View style={iconStyle}>
                          <Icon as={Ellipsis} className="size-5" />
                        </Animated.View>
                      </Pressable>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        key="view-item"
                        onSelect={handleViewItem}
                      >
                        <DropdownMenuItemTitle>View Item</DropdownMenuItemTitle>
                        <DropdownMenuItemIcon ios={{ name: "eye" }} />
                      </DropdownMenuItem>
                      {user?.id === item.grocery_items.user_id &&
                        !item.grocery_items.is_global && (
                          <DropdownMenuItem key="edit" onSelect={handleEdit}>
                            <DropdownMenuItemTitle>Edit</DropdownMenuItemTitle>
                            <DropdownMenuItemIcon ios={{ name: "pencil" }} />
                          </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                  </DropdownMenuRoot>
                </View>
                <Pressable
                  onPress={handleRemove}
                  className="h-full items-center justify-center bg-destructive flex-1"
                >
                  <Animated.View style={iconStyle}>
                    <Icon
                      as={Trash}
                      className="size-5 text-destructive-foreground"
                    />
                  </Animated.View>
                </Pressable>
              </Animated.View>
            </View>
          );
        }}
      >
        <Pressable
          className="flex-row items-center gap-3 px-4 rounded-md bg-background"
          onPress={handleCompleteChange}
        >
          <AnimatedCheckbox checked={item.checked} />
          <ListItemComponent
            item={{
              id: item.grocery_item_id,
              name: item.grocery_items.name,
              image_url: item.grocery_items.image_url,
              subtitle: item.grocery_items.brand,
              is_global: item.grocery_items.is_global,
            }}
            handlePress={handleCompleteChange}
            renderRight={() => (
              <View className="flex-row items-center justify-center gap-2">
                <Button
                  variant="outline"
                  className="rounded-full size-7 px-0"
                  onPress={handleSubtractQuantity}
                >
                  <Icon as={Minus} className="size-4" />
                </Button>
                <Text>{item.total_quantity}</Text>
                <Button
                  variant="outline"
                  className="rounded-full size-7 px-0"
                  onPress={handleAddQuantity}
                >
                  <Icon as={Plus} className="size-4" />
                </Button>
              </View>
            )}
          />
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
};

export default function ListItemList() {
  const { householdId } = useHouseholdStore();
  const { data, isLoading, refetch } = useListItems(householdId ?? undefined);
  const { user } = useAuthStore();

  if (isLoading || !user || !householdId) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  return (
    <BScrollView
      keyboardDismissMode="on-drag"
      refreshControl={<RefetchControl refetch={refetch} />}
    >
      {!data || data.length === 0 ? (
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
      ) : (
        [...data]
          .sort((a, b) => {
            if (new Date(a.created_at) < new Date(b.created_at)) return 1;
            if (new Date(a.created_at) > new Date(b.created_at)) return -1;
            return 0;
          })
          .map((item) => <ListItem key={item.id} item={item} />)
      )}
    </BScrollView>
  );
}
