import { useGroceryItems } from "@/api/grocery-item/queries";
import { BScrollView } from "@/components/scroll/b-scroll-view";
import { Avatar, AvatarImage, ColoredFallback } from "@/components/ui/avatar";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Tables } from "@/lib/database.types";
import { formatFoodGroup } from "@/lib/utils";
import { router } from "expo-router";
import { Globe, ShoppingBasketIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";
import RefetchControl from "../refetch-control";

const GroceryItem = ({ item }: { item: Tables<"grocery_items"> }) => {
  const handlePress = () => {
    router.push(`/(protected)/(modals)/grocery-item?id=${item.id}`);
  };

  const foodGroup = formatFoodGroup(item.food_groups);

  return (
    <Pressable
      className="flex-row items-center gap-2 rounded-md gap-4 p-1"
      onPress={handlePress}
    >
      <Avatar alt={item.name ?? ""} className="size-12 rounded-md">
        <AvatarImage source={{ uri: item.image_url ?? undefined }} />
        <ColoredFallback
          id={item.id}
          text={item.name?.charAt(0) ?? "I"}
          className="size-12 rounded-md"
        />
      </Avatar>
      <View className="flex-row items-center gap-2 justify-between flex-1">
        <View>
          <View className="flex-row items-center gap-2">
            <Text>{item.name ?? ""}</Text>
            {item.is_global && (
              <Icon as={Globe} className="size-4 text-blue-500" />
            )}
          </View>
          {(item.brand || foodGroup) && (
            <Text className="text-sm text-muted-foreground">
              {[item.brand, foodGroup].filter(Boolean).join(" | ")}
            </Text>
          )}
        </View>
        {item.quantity && (
          <Text>
            {item.quantity}
            {item.quantity_unit ? ` ${item.quantity_unit}` : ""}
          </Text>
        )}
      </View>
    </Pressable>
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
            </EmptyHeader>
          </EmptyContent>
        </Empty>
      ) : (
        data.map((item) => <GroceryItem key={item.id} item={item} />)
      )}
    </BScrollView>
  );
}
