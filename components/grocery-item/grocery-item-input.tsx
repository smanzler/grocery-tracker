import { useCreateGroceryItem } from "@/api/grocery-item/mutations";
import { useGroceryItems } from "@/api/grocery-item/queries";
import { useAddListItem } from "@/api/list-item/mutations";
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
import { router } from "expo-router";
import {
  ChevronDown,
  Keyboard,
  Plus,
  ScanBarcode,
  X,
} from "lucide-react-native";
import { useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
} from "react-native-reanimated";
import CheckoutButton from "../list/checkout-button";

const animationProps = {
  layout: LinearTransition.duration(200),
  entering: FadeIn.duration(200).delay(100),
  exiting: FadeOut.duration(150),
};

const AnimatedInput = Animated.createAnimatedComponent(Input);

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
  const { mutate: addListItem, isPending: isAddingListItem } = useAddListItem(
    householdId ?? ""
  );

  const isDebouncing = search !== debouncedSearch;
  const isSearching = search.length > 0;
  const showLoading = (isDebouncing || isLoading) && isSearching;
  const showGroceryItems = groceryItems && groceryItems.length > 0;

  const isSubmitting = isCreatingGroceryItem || isAddingListItem;

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
    const trimmedText = text.trim();
    if (!householdId || !user || trimmedText === "") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

    const groceryItem = await createGroceryItem({
      name: trimmedText,
      user_id: user.id,
    });

    if (!groceryItem) return;

    addListItem({
      householdId,
      groceryItemId: groceryItem.id,
      quantity: 1,
    });

    setSearch("");
    inputRef.current?.focus();
  };

  const handleSelectSuggestion = (item: Tables<"grocery_items">) => {
    if (!householdId || !user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

    addListItem({
      householdId,
      groceryItemId: item.id,
      quantity: 1,
    });

    setSearch("");
    inputRef.current?.focus();
  };

  const handleScanBarcode = () => {
    router.push("/(protected)/(modals)/add-list-item-barcode");
  };

  return (
    <>
      <View className="relative">
        <View className="justify-center items-center">
          <CheckoutButton />
        </View>

        {showOverlay && (
          <View className="bg-card border-border mx-4 rounded-lg border shadow-lg mt-4">
            {showLoading ? (
              <View className="flex-row items-center justify-center px-4 py-3">
                <Spinner />
                <Text></Text>
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
          </View>
        )}

        <View className="bg-background p-4 flex-row items-center gap-2">
          <View className="flex-1 relative">
            <AnimatedInput
              ref={inputRef}
              className={cn("rounded-full", isSearching && "pr-10")}
              placeholder="Add to your grocery list..."
              value={search}
              onChangeText={setSearch}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onSubmitEditing={(e) => {
                e.preventDefault();
                handleSubmit(search);
              }}
              {...animationProps}
            />
            {isSearching && (
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
          {isFocused && (
            <Animated.View
              className="flex-row items-center gap-2"
              {...animationProps}
            >
              <Button
                onPress={() => {
                  handleSubmit(search);
                }}
                size="icon"
                className="rounded-full"
                disabled={isSubmitting || !isSearching}
              >
                {isSubmitting ? (
                  <Spinner className="text-secondary" />
                ) : (
                  <Icon as={Plus} className="text-secondary" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full relative"
                onPress={() => inputRef.current?.blur()}
              >
                <View className="absolute right-0 left-0 top-2.25 items-center justify-center">
                  <Icon as={Keyboard} className="size-4" />
                </View>
                <View className="absolute right-0 left-0 bottom-0.5 items-center">
                  <Icon as={ChevronDown} className="size-4" />
                </View>
              </Button>
            </Animated.View>
          )}
          {!isFocused && (
            <Animated.View
              {...animationProps}
              className="flex-row items-center gap-2"
            >
              <Button
                variant="outline"
                onPress={handleScanBarcode}
                size="icon"
                className="rounded-full"
              >
                <Icon as={ScanBarcode} />
              </Button>
            </Animated.View>
          )}
        </View>
      </View>

      <Animated.View style={animatedSpacerStyle} className="bg-background" />
    </>
  );
}
