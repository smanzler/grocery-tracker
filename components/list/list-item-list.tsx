import {
  useDeleteListItem,
  useUpdateListItem,
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
import { Text } from "@/components/ui/text";
import { Tables } from "@/lib/database.types";
import { cn, formatFoodGroup } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import * as Haptics from "expo-haptics";
import {
  Globe,
  ShoppingBasket,
  ShoppingCartIcon,
  Trash,
  X,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Image, Pressable, View } from "react-native";
import {
  default as Swipeable,
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import RefetchControl from "../refetch-control";
import { Avatar, ColoredFallback } from "../ui/avatar";
import { AnimatedCheckbox } from "./animated-checkbox";

const ListItem = ({
  item,
}: {
  item: Tables<"list_items"> & { grocery_items: Tables<"grocery_items"> };
}) => {
  const { mutate: updateListItem, isPending } = useUpdateListItem(
    item.household_id ?? ""
  );
  const { mutate: deleteListItem } = useDeleteListItem(item.household_id ?? "");

  const swipeableRef = useRef<SwipeableMethods>(null);

  const isDraggingRef = useRef(false);
  const overshootingLeftRef = useRef(false);
  const overshootingRightRef = useRef(false);
  const hasTriggeredLeftHaptic = useSharedValue(false);
  const hasTriggeredRightHaptic = useSharedValue(false);

  const OVERSHOOT_THRESHOLD = 150;

  const [checkedState, setCheckedState] = useState(item.checked);
  const pendingNewStateRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (pendingNewStateRef.current === null) {
      setCheckedState(item.checked);
    }
  }, [item.checked]);

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
    const newCheckedState = !item.checked;
    pendingNewStateRef.current = newCheckedState;

    updateListItem({
      id: item.id,
      checked: newCheckedState,
    });

    swipeableRef.current?.close();
  };

  const handleDeleteAction = () => {
    swipeableRef.current?.close();
    deleteListItem(item.id);
  };

  const handleSwipeableClose = () => {
    if (pendingNewStateRef.current !== null) {
      setCheckedState(pendingNewStateRef.current);
      pendingNewStateRef.current = null;
    }
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
    deleteListItem(item.id);
  };

  const handleCompleteChange = () => {
    if (isPending || isDraggingRef.current) return;

    const newCheckedState = !item.checked;
    setCheckedState(newCheckedState);

    updateListItem({
      id: item.id,
      checked: newCheckedState,
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
        onSwipeableClose={handleSwipeableClose}
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

            return {
              width: translation.value + 8,
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
                className={cn(
                  "absolute top-0 left-0 h-full items-center justify-center",
                  checkedState ? "bg-neutral-300" : "bg-green-500"
                )}
                style={backgroundStyle}
              >
                <Animated.View style={iconStyle}>
                  <Icon
                    as={checkedState ? X : ShoppingBasket}
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
        <Pressable
          className="flex-row items-center gap-3 px-4 py-2 rounded-md bg-background"
          onPress={handleCompleteChange}
        >
          <AnimatedCheckbox checked={item.checked} />
          <View className="relative">
            {item.grocery_items?.image_url ? (
              <View className="size-10 rounded-md overflow-hidden items-center justify-center">
                <Image
                  source={{ uri: item.grocery_items.image_url }}
                  className="size-full"
                />
              </View>
            ) : (
              <Avatar
                alt={item.grocery_items?.name ?? ""}
                className="size-10 rounded-md"
              >
                <ColoredFallback
                  id={item.grocery_items.id}
                  text={item.grocery_items.name?.charAt(0) ?? "I"}
                  className="size-10 rounded-md"
                />
              </Avatar>
            )}
            {item.quantity && item.quantity > 1 && (
              <View className="absolute -top-1.5 -right-1.5 size-5 bg-background rounded-full border items-center justify-center">
                <Text className="text-xs text-foreground">{item.quantity}</Text>
              </View>
            )}
            {item.grocery_items?.is_global && (
              <View className="absolute -bottom-1.5 -right-1.5 size-5 bg-blue-500 rounded-full border border-white items-center justify-center">
                <Icon as={Globe} className="size-3 text-white" />
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="flex-shrink text-ellipsis line-clamp-2">
              {item.grocery_items?.name ?? ""}
            </Text>
            {(item.grocery_items?.brand || foodGroup) && (
              <Text className="text-sm text-muted-foreground line-clamp-2">
                {[item.grocery_items?.brand, foodGroup]
                  .filter(Boolean)
                  .join(" | ")}
              </Text>
            )}
          </View>
          {item.grocery_items?.quantity && (
            <Text>
              {item.grocery_items.quantity}
              {item.grocery_items.quantity_unit
                ? ` ${item.grocery_items.quantity_unit}`
                : ""}
            </Text>
          )}
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
