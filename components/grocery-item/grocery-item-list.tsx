import { useGroceryItems } from "@/api/grocery-item/queries";
import { useAddListItem } from "@/api/list-item/mutations";
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
import { useHouseholdStore } from "@/stores/household-store";
import { useToast } from "@/stores/toast-store";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ScrollText, ShoppingBasketIcon } from "lucide-react-native";
import { useRef } from "react";
import { Pressable, View } from "react-native";
import Swipeable, {
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
import { ListItem } from "../list-item";
import RefetchControl from "../refetch-control";
import { GroceryItemDropdown } from "./grocery-item-dropdown";

const GroceryItem = ({ item }: { item: Tables<"grocery_items"> }) => {
  const { householdId } = useHouseholdStore();
  const { mutate: addListItem, isPending: isAddingListItem } = useAddListItem(
    householdId ?? ""
  );
  const setToast = useToast();

  const swipeableRef = useRef<SwipeableMethods>(null);

  const overshootingLeftRef = useRef(false);
  const hasTriggeredLeftHaptic = useSharedValue(false);

  const OVERSHOOT_THRESHOLD = 150;

  const handleDragStart = () => {
    overshootingLeftRef.current = false;
    hasTriggeredLeftHaptic.value = false;
  };

  const handlePress = () => {
    router.push({
      pathname: "/(protected)/(modals)/grocery-item",
      params: { id: item.id },
    });
  };

  const handleLeftAction = () => {
    if (!householdId || !item.id) return;

    addListItem({
      householdId: householdId,
      groceryItemId: item.id,
      quantity: 1,
    });

    swipeableRef.current?.close();

    setToast("success", "Item added to shopping list");
  };

  const triggerLeftHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const updateOvershootLeft = (value: boolean) => {
    overshootingLeftRef.current = value;
  };

  const handleSwipeableWillOpen = (direction: "left" | "right") => {
    if (direction === "right" && overshootingLeftRef.current) {
      handleLeftAction();
    }
  };

  return (
    <Animated.View
      layout={LinearTransition.duration(200)}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="rounded-md overflow-hidden"
    >
      <Swipeable
        ref={swipeableRef}
        overshootFriction={4}
        onSwipeableOpenStartDrag={handleDragStart}
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
              onPress={handleLeftAction}
              className="relative h-full"
              style={{ width: OVERSHOOT_THRESHOLD }}
            >
              <Animated.View
                className="absolute top-0 left-0 h-full items-center justify-center bg-muted"
                style={backgroundStyle}
              >
                <Animated.View style={iconStyle}>
                  <Icon as={ScrollText} className="size-5 text-foreground" />
                </Animated.View>
              </Animated.View>
            </Pressable>
          );
        }}
      >
        <ListItem
          item={{
            id: item.id,
            name: item.name,
            image_url: item.image_url,
            subtitle: [
              item.brand,
              item.quantity && item.quantity_unit
                ? `${item.quantity} ${item.quantity_unit}`
                : undefined,
            ]
              .filter(Boolean)
              .join(" | "),
            is_global: item.is_global,
          }}
          className="rounded-md bg-background"
          handlePress={handlePress}
          renderRight={() => <GroceryItemDropdown item={item} />}
        />
      </Swipeable>
    </Animated.View>
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
              <EmptyTitle>No grocery items found</EmptyTitle>
              <EmptyDescription>
                You don't have any grocery items yet. Add items to your list to
                get started.
              </EmptyDescription>
            </EmptyHeader>
          </EmptyContent>
        </Empty>
      ) : (
        data.map((item) => <GroceryItem key={item.id} item={item} />)
      )}
    </BScrollView>
  );
}
