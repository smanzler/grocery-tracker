import { usePantryItems } from "@/api/pantry/queries";
import { BScrollView } from "@/components/scroll/b-scroll-view";
import { Button } from "@/components/ui/button";
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
import { generateColorFromUserId } from "@/lib/utils";
import { useHouseholdStore } from "@/stores/household-store";
import { formatDistanceToNow } from "date-fns";
import { PlusIcon, RefrigeratorIcon } from "lucide-react-native";
import { View } from "react-native";
import { useUniwind } from "uniwind";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemIcon,
  ContextMenuItemTitle,
  ContextMenuRoot,
  ContextMenuTrigger,
} from "../ui/context-menu";

export default function PantryList() {
  const { theme } = useUniwind();
  const { householdId } = useHouseholdStore();
  const { data, isLoading } = usePantryItems(householdId ?? undefined);

  const handleConsume = (itemId: string) => {
    console.log("consume", itemId);
  };

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
              You don't have any items in your pantry yet. Add items to your
              grocery list and mark them as bought, or add items directly to the
              pantry.
            </EmptyDescription>
          </EmptyHeader>
          <Button>
            <Text>Add Item</Text>
            <Icon as={PlusIcon} color={theme === "dark" ? "black" : "white"} />
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <BScrollView>
      {data.map((item) => (
        <ContextMenuRoot key={item.id}>
          <ContextMenuTrigger>
            <View className="flex-row items-center justify-between px-4 py-2 rounded-md bg-card gap-4">
              <View className="flex-row items-center gap-2">
                <Avatar alt={item.grocery_items.name ?? ""}>
                  <AvatarFallback
                    style={{
                      backgroundColor: generateColorFromUserId(item.id),
                    }}
                  >
                    <Text>{item.grocery_items.name?.charAt(0) ?? ""}</Text>
                  </AvatarFallback>
                </Avatar>
                <View className="space-y-1">
                  <Text className="text-base font-medium">
                    {item.grocery_items.name ?? ""}
                  </Text>

                  <Text className="text-sm text-muted-foreground">
                    {item.profiles?.display_name ?? "Unknown"} added{" "}
                    {formatDistanceToNow(item.created_at)} ago
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-muted-foreground">
                {item.quantity}x
              </Text>
            </View>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              key="consume"
              onSelect={() => handleConsume(item.id)}
            >
              <ContextMenuItemTitle>Consume</ContextMenuItemTitle>
              <ContextMenuItemIcon ios={{ name: "hammer" }} />
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuRoot>
      ))}
    </BScrollView>
  );
}
