import { useCreateGroceryItem } from "@/api/grocery-item/mutations";
import { useGroceryItems } from "@/api/grocery-item/queries";
import { useCreateListItem } from "@/api/list-item/mutations";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useDebounce } from "@/hooks/use-debounce";
import { Tables } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { PlusIcon, X } from "lucide-react-native";
import { useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
} from "react-native-reanimated";
import CheckoutButton from "../list/checkout-button";

export default function GroceryItemInput() {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const tabBarHeight = useBottomTabBarHeight();
  const { height, progress } = useReanimatedKeyboardAnimation();

  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const { data: groceryItems, isLoading } = useGroceryItems({
    search: debouncedSearch,
    limit: 3,
  });

  const { householdId } = useHouseholdStore();
  const { user } = useAuthStore();

  const { mutateAsync: createGroceryItem, isPending: isCreatingGroceryItem } =
    useCreateGroceryItem();
  const { mutate: createListItem, isPending: isCreatingListItem } =
    useCreateListItem(householdId ?? "");

  const isDebouncing = search !== debouncedSearch;
  const isSearching = search.length > 0;
  const showLoading = (isDebouncing || isLoading) && isSearching;
  const showGroceryItems = groceryItems && groceryItems.length > 0;

  const isSubmitting = isCreatingGroceryItem || isCreatingListItem;

  const showOverlay =
    (showLoading || showGroceryItems) &&
    isFocused &&
    !isSubmitting &&
    isSearching;

  const animatedSpacerStyle = useAnimatedStyle(() => {
    return {
      height: -(height.value + tabBarHeight * progress.value),
    };
  });

  const handleSubmit = async (text: string) => {
    if (!householdId || !user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

    const groceryItem = await createGroceryItem({
      name: text,
      user_id: user.id,
    });

    if (!groceryItem) return;

    createListItem({
      grocery_item_id: groceryItem.id,
      household_id: householdId,
      quantity: 1,
      user_id: user.id,
    });

    setSearch("");
    inputRef.current?.focus();
  };

  const handleSelectSuggestion = (item: Tables<"grocery_items">) => {
    if (!householdId || !user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

    createListItem({
      grocery_item_id: item.id,
      household_id: householdId,
      quantity: 1,
      user_id: user.id,
    });

    setSearch("");
    inputRef.current?.focus();
  };

  return (
    <>
      <View className="relative">
        {showOverlay && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            className="absolute bottom-full left-0 right-0 bg-card border-border mx-4 rounded-lg border shadow-lg"
          >
            {showLoading ? (
              <View className="flex-1 items-center justify-center px-4 py-3">
                <Spinner />
              </View>
            ) : (
              showGroceryItems &&
              groceryItems.map((groceryItem, index) => (
                <Pressable
                  key={groceryItem.id}
                  onPress={() => handleSelectSuggestion(groceryItem)}
                  className={cn(
                    "px-4 py-3 border-b border-border",
                    index === groceryItems.length - 1 && "border-b-0",
                    isSubmitting && "opacity-50"
                  )}
                  disabled={isSubmitting}
                >
                  <Text>{groceryItem.name}</Text>
                </Pressable>
              ))
            )}
          </Animated.View>
        )}

        <View className="bg-background p-4 flex-row items-center gap-2">
          <View className="flex-1 relative">
            <Input
              ref={inputRef}
              className="pr-10"
              placeholder="Add to your grocery list..."
              value={search}
              onChangeText={setSearch}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onSubmitEditing={(e) => {
                e.preventDefault();
                handleSubmit(search);
              }}
            />
            {!!search && (
              <Pressable
                className="absolute right-0 top-0 bottom-0 justify-center p-2"
                onPress={() => {
                  setSearch("");
                }}
                hitSlop={8}
              >
                <Icon as={X} className="text-muted-foreground size-4" />
              </Pressable>
            )}
          </View>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            disabled={isSubmitting || !isSearching}
            onPress={(e) => {
              e.preventDefault();
              handleSubmit(search);
            }}
          >
            {isSubmitting ? <Spinner /> : <Icon as={PlusIcon} />}
          </Button>
          <CheckoutButton />
        </View>
      </View>

      <Animated.View style={animatedSpacerStyle} className="bg-background" />
    </>
  );
}
