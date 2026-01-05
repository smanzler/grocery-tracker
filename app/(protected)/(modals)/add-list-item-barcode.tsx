import { useCreateListItem } from "@/api/list-item/mutations";
import BarcodeScanner from "@/components/barcode/barcode-scanner";
import { Tables } from "@/lib/database.types";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { router } from "expo-router";
import { Alert } from "react-native";

export default function AddListItemBarcode() {
  const { householdId } = useHouseholdStore();
  const { mutateAsync: createListItem } = useCreateListItem(householdId ?? "");
  const { user } = useAuthStore();

  const handleScan = async (data: Tables<"grocery_items">) => {
    if (!user) {
      return;
    }

    console.log({
      grocery_item_id: data.id,
      household_id: householdId ?? "",
      quantity: 1,
      user_id: user.id,
    });

    try {
      await createListItem({
        grocery_item_id: data.id,
        household_id: householdId ?? "",
        quantity: 1,
        user_id: user.id,
      });

      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to add item to list");
      return;
    }
  };

  return <BarcodeScanner onScan={handleScan} />;
}
