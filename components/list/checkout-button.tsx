import { useCheckoutListItems } from "@/api/list-item/mutations";
import { useListItems } from "@/api/list-item/queries";
import { useHouseholdStore } from "@/stores/household-store";
import { ShoppingCartIcon } from "lucide-react-native";
import { Alert } from "react-native";
import { useUniwind } from "uniwind";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { Spinner } from "../ui/spinner";

export default function CheckoutButton() {
  const { theme } = useUniwind();
  const { householdId } = useHouseholdStore();

  const { data: listItems, isLoading: isLoadingListItems } = useListItems(
    householdId ?? undefined
  );

  const { mutateAsync: checkoutListItems, isPending: isCheckingOut } =
    useCheckoutListItems(householdId ?? "");

  const hasCheckedItems = listItems && listItems.some((item) => item.checked);

  const isLoading = isLoadingListItems || isCheckingOut;

  const handleCheckout = () => {
    Alert.alert(
      "Checkout",
      "Are you sure you want to checkout? This will move checked items to the pantry.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Checkout",
          onPress: async () => await checkoutListItems(),
          isPreferred: true,
        },
      ]
    );
  };

  return (
    <Button
      size="icon"
      className="rounded-full"
      onPress={handleCheckout}
      disabled={isLoading || !hasCheckedItems}
    >
      {isLoading ? (
        <Spinner color={theme === "dark" ? "black" : "white"} />
      ) : (
        <Icon
          as={ShoppingCartIcon}
          color={theme === "dark" ? "black" : "white"}
          className="size-4"
        />
      )}
    </Button>
  );
}
