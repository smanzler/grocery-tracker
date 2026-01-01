import { useRemovePantryItem } from "@/api/pantry/mutations";
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
import { generateColorFromUserId } from "@/lib/utils";
import { useHouseholdStore } from "@/stores/household-store";
import { formatDistanceToNow } from "date-fns";
import { RefrigeratorIcon } from "lucide-react-native";
import { View } from "react-native";
import { Avatar, AvatarFallback } from "../ui/avatar";
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
    grocery_items: { name: string | null };
    profiles: { display_name: string | null };
  };
}) => {
  const { householdId } = useHouseholdStore();
  const { mutateAsync: removePantryItem, isPending } = useRemovePantryItem(
    householdId ?? ""
  );

  const handleRemove = async (itemId: string) => {
    await removePantryItem(itemId);
  };

  return (
    <ContextMenuRoot key={item.id}>
      <ContextMenuTrigger>
        <View className="flex-row items-center gap-2 px-4 py-2 rounded-md bg-card gap-4">
          <Avatar alt={item.grocery_items?.name ?? ""}>
            <AvatarFallback
              style={{
                backgroundColor: generateColorFromUserId(item.id),
              }}
            >
              <Text>{item.grocery_items?.name?.charAt(0) ?? ""}</Text>
            </AvatarFallback>
          </Avatar>
          <View className="space-y-1 flex-1">
            <Text className="text-base font-medium">
              {item.grocery_items?.name ?? ""}
            </Text>

            <Text className="text-sm text-muted-foreground line-clamp-1">
              {item.profiles?.display_name ?? "Unknown"} added{" "}
              {formatDistanceToNow(item.created_at)} agof jdsakl fjsakl fjakdls
              jklasj lfdsaj lkfsa
            </Text>
          </View>
          {isPending ? (
            <Spinner />
          ) : (
            <Text className="text-sm text-muted-foreground">
              {item.quantity}x
            </Text>
          )}
        </View>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          key="remove"
          destructive
          onSelect={() => handleRemove(item.id)}
        >
          <ContextMenuItemTitle>Remove from pantry</ContextMenuItemTitle>
          <ContextMenuItemIcon ios={{ name: "trash" }} />
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenuRoot>
  );
};

export default function PantryList() {
  const { householdId } = useHouseholdStore();
  const { data, isLoading } = usePantryItems(householdId ?? undefined);
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
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
    );
  }

  return (
    <BScrollView>
      {data.map((item) => (
        <PantryItem key={item.id} item={item} />
      ))}
    </BScrollView>
  );
}
