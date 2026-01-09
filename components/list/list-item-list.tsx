import {
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
import { formatFoodGroup } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import * as Haptics from "expo-haptics";
import {
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
import { ListItem as ListItemComponent } from "../list-item";
import RefetchControl from "../refetch-control";
import { Text } from "../ui/text";
import { AnimatedCheckbox } from "./animated-checkbox";

const ListItem = ({
  item,
}: {
  item: Tables<"list_items"> & { grocery_items: Tables<"grocery_items"> };
}) => {
  const { mutate: toggleListItemChecked, isPending } = useToggleListItemChecked(
    item.household_id ?? ""
  );
  const { mutate: removeListItem } = useRemoveListItem(item.household_id ?? "");

  const swipeableRef = useRef<SwipeableMethods>(null);

  const isDraggingRef = useRef(false);
  const overshootingLeftRef = useRef(false);
  const overshootingRightRef = useRef(false);
  const hasTriggeredLeftHaptic = useSharedValue(false);
  const hasTriggeredRightHaptic = useSharedValue(false);

  const OVERSHOOT_THRESHOLD = 150;

  const animatedChecked = useSharedValue(item.checked ? 1 : 0);

  useEffect(() => {
    animatedChecked.value = withTiming(item.checked ? 1 : 0, { duration: 300 });
  }, [item.checked, animatedChecked]);

  const handleDragStart = () => {
    isDraggingRef.current = true;
    overshootingLeftRef.current = false;
    overshootingRightRef.current = false;
    hasTriggeredLeftHaptic.value = false;
    hasTriggeredRightHaptic.value = false;
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

  const handleDeleteAction = () => {
    if (!item.household_id || !item.grocery_item_id) return;

    swipeableRef.current?.close();
    removeListItem({
      householdId: item.household_id,
      groceryItemId: item.grocery_item_id,
      quantity: item.total_quantity,
    });
  };

  const handleSwipeableWillOpen = (direction: "left" | "right") => {
    if (direction === "right" && overshootingLeftRef.current) {
      handleCompleteChangeAction();
    } else if (direction === "left" && overshootingRightRef.current) {
      handleDeleteAction();
    }
  };

  const updateOvershootLeft = (value: boolean) => {
    overshootingLeftRef.current = value;
  };

  const updateOvershootRight = (value: boolean) => {
    overshootingRightRef.current = value;
  };

  const triggerLeftHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const triggerRightHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    removeListItem({
      householdId: item.household_id ?? "",
      groceryItemId: item.grocery_item_id ?? "",
      quantity: item.total_quantity ?? 0,
    });
  };

  const handleCompleteChange = () => {
    if (isPending || isDraggingRef.current) return;

    if (!item.household_id || !item.grocery_item_id) return;

    toggleListItemChecked({
      householdId: item.household_id,
      groceryItemId: item.grocery_item_id,
    });
  };

  const foodGroup = formatFoodGroup(item.grocery_items?.food_groups);

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
              ["#22c55e", "#d4d4d8"]
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
                  <Icon
                    as={item.checked ? X : ShoppingBasket}
                    color="white"
                    className="size-5"
                  />
                </Animated.View>
              </Animated.View>
            </Pressable>
          );
        }}
        renderRightActions={(_, translation) => {
          const opacity = useDerivedValue(() => {
            return withTiming(-translation.value > 50 ? 1 : 0, {
              duration: 200,
            });
          });

          const backgroundStyle = useAnimatedStyle(() => {
            const isOvershoot = -translation.value > OVERSHOOT_THRESHOLD;

            if (isOvershoot && !hasTriggeredRightHaptic.value) {
              hasTriggeredRightHaptic.value = true;
              scheduleOnRN(triggerRightHaptic);
            }

            scheduleOnRN(updateOvershootRight, isOvershoot);

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
            <Pressable
              onPress={handleDelete}
              className="relative h-full"
              style={{ width: OVERSHOOT_THRESHOLD }}
            >
              <Animated.View
                className="absolute top-0 right-0 h-full items-center justify-center bg-destructive"
                style={backgroundStyle}
              >
                <Animated.View style={iconStyle}>
                  <Icon as={Trash} color="white" className="size-5" />
                </Animated.View>
              </Animated.View>
            </Pressable>
          );
        }}
      >
        <View className="flex-row items-center gap-3 px-4 rounded-md bg-background">
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
              <Text className="text-sm text-muted-foreground">
                {item.total_quantity}
              </Text>
            )}
          />
        </View>
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
