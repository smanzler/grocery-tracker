import { useMergeGroceryItems } from "@/api/grocery-item/mutations";
import { useGroceryItems } from "@/api/grocery-item/queries";
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
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useDebounce } from "@/hooks/use-debounce";
import { Tables } from "@/lib/database.types";
import { router, useLocalSearchParams } from "expo-router";
import { Search, ShoppingBasketIcon } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";

export default function SelectGroceryItem() {
  const { sourceId } = useLocalSearchParams<{ sourceId: string }>();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: groceryItems, isLoading } = useGroceryItems({
    search: debouncedSearch,
    limit: 50,
  });

  const { mutateAsync: mergeGroceryItems } = useMergeGroceryItems();

  const filteredItems = groceryItems?.filter((item) => item.id !== sourceId);

  const handleSelectPress = async (targetId: string) => {
    if (!sourceId || !targetId) return;

    await mergeGroceryItems({ sourceId, targetId });

    Alert.alert("Success", "Grocery item merged successfully");

    router.back();
  };

  const handleSelect = (item: Tables<"grocery_items">) => {
    Alert.alert("Select", "Are you sure you want to select this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Select",
        style: "destructive",
        onPress: () => handleSelectPress(item.id),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <View className="p-4 pt-12">
        <Text variant="h1" className="text-left">
          Search grocery items
        </Text>
        <View className="relative">
          <Input
            placeholder="Search grocery items..."
            value={search}
            onChangeText={setSearch}
            autoFocus
            autoCapitalize="none"
            className="pl-10"
          />
          <View className="absolute left-3 top-0 bottom-0 justify-center">
            <Icon as={Search} className="text-muted-foreground size-5" />
          </View>
        </View>
        <Text className="text-muted-foreground text-sm mt-2">
          Select the item you want to merge into. All references will be updated
          to point to this item.
        </Text>
      </View>
      <BScrollView
        className="flex-1 bg-background"
        contentContainerClassName="relative"
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <Spinner />
          </View>
        ) : !filteredItems || filteredItems.length === 0 ? (
          <Empty>
            <EmptyContent>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Icon as={ShoppingBasketIcon} />
                </EmptyMedia>
                <EmptyTitle>No grocery items found</EmptyTitle>
                <EmptyDescription>
                  No grocery items found. Please try again.
                </EmptyDescription>
              </EmptyHeader>
            </EmptyContent>
          </Empty>
        ) : (
          filteredItems.map((item) => {
            console.log("item", item);
            return (
              <Pressable
                key={item.id}
                onPress={() => handleSelect(item)}
                className="px-4 py-3"
              >
                <Text className="font-medium">{item.name}</Text>
                {item.brand && (
                  <Text className="text-sm text-muted-foreground">
                    {item.brand}
                  </Text>
                )}
              </Pressable>
            );
          })
        )}
      </BScrollView>
    </View>
  );
}
