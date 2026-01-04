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
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { ShoppingCartIcon, Trash } from "lucide-react-native";
import { useRef } from "react";
import { Pressable, View } from "react-native";
import { default as Swipeable } from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { AnimatedCheckbox } from "./animated-checkbox";

const ListItem = ({
  item,
}: {
  item: Tables<"list_items"> & { grocery_items: { name: string | null } };
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
    deleteListItem(item.id);
  };

  const handleCompleteChange = () => {
    if (isPending) return;
    updateListItem({
      id: item.id,
      checked: !item.checked,
    });
  };

  return (
    <View className="flex-1 bg-red-500 rounded-md">
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
          className="flex-row items-center justify-between p-2 rounded-md bg-card"
          onPress={handleCompleteChange}
        >
          <View className="flex-row items-center gap-2">
            <AnimatedCheckbox checked={item.checked} />
            <Text>{item.grocery_items?.name ?? ""}</Text>
          </View>
        </Pressable>
      </Swipeable>
    </View>
  );
};

export default function ListItemList() {
  const { householdId } = useHouseholdStore();
  const { data, isLoading } = useListItems(householdId ?? undefined);
  const { user } = useAuthStore();

  if (isLoading || !user || !householdId) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

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
    <BScrollView keyboardDismissMode="on-drag">
      {sortedData.map((item) => (
        <ListItem key={item.id} item={item} />
      ))}
    </BScrollView>
  );
}
