import { useGroceryItem } from "@/api/grocery-item/queries";
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
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { ShoppingBasketIcon } from "lucide-react-native";
import { View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from "react-native-reanimated";

const IMAGE_HEIGHT = 300;

export default function GroceryItem() {
  const { id } = useLocalSearchParams();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);

  const imageContainerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollOffset.value,
          [-IMAGE_HEIGHT, 0, IMAGE_HEIGHT],
          [-IMAGE_HEIGHT / 2, 0, IMAGE_HEIGHT * 0.75]
        ),
      },
      {
        scale: interpolate(
          scrollOffset.value,
          [-IMAGE_HEIGHT, 0, IMAGE_HEIGHT],
          [2, 1, 1]
        ),
      },
    ],
  }));

  const { data: groceryItem, isLoading } = useGroceryItem(
    typeof id === "string" ? id : undefined
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  if (!groceryItem || !groceryItem.name) {
    return (
      <Empty>
        <EmptyContent>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon as={ShoppingBasketIcon} />
            </EmptyMedia>
            <EmptyTitle>Grocery item not found</EmptyTitle>
            <EmptyDescription>
              The grocery item you are looking for does not exist.
            </EmptyDescription>
          </EmptyHeader>
        </EmptyContent>
      </Empty>
    );
  }

  console.log(groceryItem.image_url);

  return (
    <Animated.ScrollView ref={scrollRef}>
      {groceryItem.image_url && (
        <Animated.View
          style={[imageContainerStyle, { height: IMAGE_HEIGHT }]}
          className="w-full overflow-hidden items-center justify-center bg-muted"
        >
          <ImageBackground
            source={groceryItem.image_url}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        </Animated.View>
      )}
      <View className="relative flex-1 bg-background h-2000">
        <View className="absolute bottom-full left-0 right-0 p-4">
          <Text>{groceryItem.name}</Text>
          <LinearGradient
            colors={["#4c669f", "#3b5998", "#192f6a"]}
            className="absolute bottom-full left-0 right-0 p-4"
          ></LinearGradient>
        </View>
      </View>
    </Animated.ScrollView>
  );
}
