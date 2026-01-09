import { useAddListItem } from "@/api/list-item/mutations";
import BarcodeScanner from "@/components/barcode/barcode-scanner";
import { Tables } from "@/lib/database.types";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { useToast } from "@/stores/toast-store";
import { router } from "expo-router";
import { Alert } from "react-native";

export default function AddListItemBarcode() {
  const { householdId } = useHouseholdStore();
  const { mutateAsync: addListItem } = useAddListItem(householdId ?? "");
  const { user } = useAuthStore();
  const addToast = useToast();

  const handleScan = async (data: Tables<"grocery_items">) => {
    if (!householdId || !user) return;

    try {
      await addListItem({
        householdId,
        groceryItemId: data.id,
        quantity: 1,
      });

      router.back();
      addToast("success", "Item added to list");
    } catch (error) {
      Alert.alert("Error", "Failed to add item to list");
      return;
    }
  };

  return <BarcodeScanner onScan={handleScan} />;
}
