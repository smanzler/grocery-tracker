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
import { formatFoodGroup } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import * as Haptics from "expo-haptics";
import { Globe, ShoppingCartIcon, Trash } from "lucide-react-native";
import { useRef } from "react";
import { Image, Pressable, View } from "react-native";
import { default as Swipeable } from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import RefetchControl from "../refetch-control";
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

  const isDraggingRef = useRef(false);

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    deleteListItem(item.id);
  };

  const handleCompleteChange = () => {
    if (isPending || isDraggingRef.current) return;
    updateListItem({
      id: item.id,
      checked: !item.checked,
    });
  };

  const foodGroup = formatFoodGroup(item.grocery_items?.food_groups);

  return (
    <Animated.View
      className="bg-destructive rounded-md"
      layout={LinearTransition.duration(200)}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
    >
      <Swipeable
        overshootFriction={4}
        onSwipeableOpenStartDrag={handleDragStart}
        onSwipeableWillClose={handleDragEnd}
        renderLeftActions={(_, translation) => {
          const opacity = useDerivedValue(() => {
            return withTiming(translation.value > 50 ? 1 : 0, {
              duration: 200,
            });
          });

          const styleAnimation = useAnimatedStyle(() => {
            return {
              width: translation.value,
              opacity: opacity.value,
            };
          });

          return (
            <Pressable
              onPress={handleDelete}
              className="relative h-full w-[100px] rounded-l-md"
            >
              <Animated.View
                className="absolute top-0 left-0 h-full items-center justify-center"
                style={styleAnimation}
              >
                <Icon as={Trash} color="white" className="size-5" />
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
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="flex-shrink text-ellipsis line-clamp-2">
                {item.grocery_items?.name ?? ""}
              </Text>
              {item.grocery_items?.is_global && (
                <Icon as={Globe} className="size-4 text-blue-500" />
              )}
            </View>
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
          {item.grocery_items?.image_url && (
            <View className="size-8 rounded-md overflow-hidden items-center justify-center">
              <Image
                source={{ uri: item.grocery_items.image_url }}
                className="size-full"
              />
            </View>
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
