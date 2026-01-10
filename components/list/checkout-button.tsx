import { useCheckoutListItems } from "@/api/list-item/mutations";
import { useListItems } from "@/api/list-item/queries";
import CustomHaptics from "@/modules/custom-haptics";
import { useHouseholdStore } from "@/stores/household-store";
import { useToast } from "@/stores/toast-store";
import { router } from "expo-router";
import { ShoppingCartIcon } from "lucide-react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useUniwind } from "uniwind";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";

const AnimatedButton = Animated.createAnimatedComponent(Button);

export default function CheckoutButton() {
  const { theme } = useUniwind();
  const { householdId } = useHouseholdStore();
  const addToast = useToast();

  const { data: listItems, isLoading: isLoadingListItems } = useListItems(
    householdId ?? undefined
  );

  const { mutateAsync: checkoutListItems, isPending: isCheckingOut } =
    useCheckoutListItems(householdId ?? "");

  const hasCheckedItems = listItems && listItems.some((item) => item.checked);

  const isLoading = isLoadingListItems || isCheckingOut;

  const checkout = async () => {
    CustomHaptics.impactAsync(400);
    await checkoutListItems();

    addToast("success", "Items checked out successfully");
    router.replace("/(protected)/(tabs)/pantry");
  };

  if (!hasCheckedItems) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <AnimatedButton
          className="rounded-full"
          style={{ height: 60, width: 60 }}
          disabled={isLoading}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
        >
          {isLoading ? (
            <Spinner color={theme === "dark" ? "black" : "white"} />
          ) : (
            <Icon
              as={ShoppingCartIcon}
              color={theme === "dark" ? "black" : "white"}
              className="size-6"
            />
          )}
        </AnimatedButton>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-xs">
        <AlertDialogTitle className="text-center">Checkout</AlertDialogTitle>
        <AlertDialogDescription className="text-center">
          Are you sure you want to checkout? This will move all checked items to
          the pantry.
        </AlertDialogDescription>
        <AlertDialogFooter className="flex-row gap-2">
          <AlertDialogCancel className="flex-1">
            <Text className="text-center">Cancel</Text>
          </AlertDialogCancel>
          <AlertDialogAction className="flex-1" onPress={checkout}>
            <Icon as={ShoppingCartIcon} className="text-secondary" />
            <Text className="text-center">Checkout</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
