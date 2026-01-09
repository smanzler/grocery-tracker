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
import { Text } from "@/components/ui/text";
import { Tables } from "@/lib/database.types";
import { useHouseholdStore } from "@/stores/household-store";
import { formatDistanceToNow } from "date-fns";
import { Globe, RefrigeratorIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import RefetchControl from "../refetch-control";
import { Avatar, AvatarImage, ColoredFallback } from "../ui/avatar";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemIcon,
  ContextMenuItemTitle,
  ContextMenuRoot,
  ContextMenuTrigger,
} from "../ui/context-menu";

const PantryItem = ({
  item,
}: {
  item: Tables<"pantry_items"> & {
    grocery_items: Tables<"grocery_items">;
    profiles: { display_name: string | null };
  };
}) => {
  const { householdId } = useHouseholdStore();
  const { mutateAsync: consumePantryItem, isPending } = useConsumePantryItem(
    householdId ?? ""
  );

  const handleConsume = async (itemId: string) => {
    await consumePantryItem({ itemId, quantity: 1 });
  };

  const handlePress = () => {
    console.log("pressed");
  };

  return (
    <ContextMenuRoot key={item.id}>
      <ContextMenuTrigger>
        <Animated.View
          layout={LinearTransition.duration(200)}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
        >
          <Pressable
            className="flex-row items-center gap-2 rounded-md gap-4 p-1"
            onPress={handlePress}
          >
            <View className="relative">
              <Avatar
                alt={item.grocery_items?.name ?? ""}
                className="size-12 rounded-md"
              >
                <AvatarImage
                  source={{ uri: item.grocery_items?.image_url ?? undefined }}
                />
                <ColoredFallback
                  id={item.id}
                  text={item.grocery_items?.name?.charAt(0) ?? "I"}
                  className="size-12 rounded-md"
                />
              </Avatar>
              {item.grocery_items?.is_global && (
                <View className="absolute -bottom-1.5 -right-1.5 size-5 bg-blue-500 rounded-full border border-white items-center justify-center">
                  <Icon as={Globe} className="size-3 text-white" />
                </View>
              )}
            </View>
            <View className="space-y-1 flex-1">
              <Text className="text-base font-medium flex-shrink text-ellipsis line-clamp-2">
                {item.grocery_items?.name ?? ""}
              </Text>

              <Text className="text-sm text-muted-foreground line-clamp-1">
                {item.profiles?.display_name ?? "Unknown"} added{" "}
                {formatDistanceToNow(item.created_at)} ago
              </Text>
            </View>
            {isPending ? (
              <Spinner />
            ) : (
              <Text className="text-sm text-muted-foreground">
                {item.quantity}x
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          key="consume"
          destructive
          onSelect={() => handleConsume(item.id)}
        >
          <ContextMenuItemTitle>Consume</ContextMenuItemTitle>
          <ContextMenuItemIcon ios={{ name: "minus" }} />
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenuRoot>
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
        data.map((item) => <PantryItem key={item.id} item={item} />)
      )}
    </BScrollView>
  );
}
