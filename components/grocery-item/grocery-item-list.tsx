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
import { Spinner } from "@/components/ui/spinner";
import { Tables } from "@/lib/database.types";
import { router } from "expo-router";
import { ShoppingBasketIcon } from "lucide-react-native";
import { View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { ListItem } from "../list-item";
import RefetchControl from "../refetch-control";
import { GroceryItemDropdown } from "./grocery-item-dropdown";

const GroceryItem = ({ item }: { item: Tables<"grocery_items"> }) => {
  const handlePress = () => {
    router.push({
      pathname: "/(protected)/(modals)/grocery-item",
      params: { id: item.id },
    });
  };

  return (
    <Animated.View
      layout={LinearTransition.duration(200)}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
    >
      <ListItem
        item={{
          id: item.id,
          name: item.name,
          image_url: item.image_url,
          subtitle: [item.brand, `${item.quantity} ${item.quantity_unit}`]
            .filter(Boolean)
            .join(" | "),
          is_global: item.is_global,
        }}
        handlePress={handlePress}
        renderRight={() => <GroceryItemDropdown item={item} />}
      />
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
