import { useDeleteGroceryItem } from "@/api/grocery-item/mutations";
import { useAddListItem } from "@/api/list-item/mutations";
import { useAddPantryItem } from "@/api/pantry/mutations";
import { Tables } from "@/lib/database.types";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { useToast } from "@/stores/toast-store";
import { router } from "expo-router";
import { MoreVertical } from "lucide-react-native";
import { Alert } from "react-native";
import { Button } from "../ui/button";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemTitle,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Icon } from "../ui/icon";

export const GroceryItemDropdown = ({
  item,
}: {
  item: Tables<"grocery_items">;
}) => {
  const { user } = useAuthStore();
  const { householdId } = useHouseholdStore();
  const addToast = useToast();
  const { mutateAsync: addToList, isPending: isAddingToList } = useAddListItem(
    householdId ?? ""
  );
  const { mutateAsync: addToPantry, isPending: isAddingToPantry } =
    useAddPantryItem(householdId ?? "");
  const { mutateAsync: deleteGroceryItem, isPending: isDeletingGroceryItem } =
    useDeleteGroceryItem();

  const handleAddToShoppingList = async () => {
    if (!householdId || !user) return;

    await addToList({
      householdId,
      groceryItemId: item.id,
      quantity: 1,
    });

    addToast("success", "Item added to shopping list");
  };

  const handleAddToPantry = async () => {
    if (!householdId || !user) return;

    await addToPantry({
      householdId,
      items: [{ grocery_item_id: item.id, quantity: 1 }],
    });

    addToast("success", "Item added to pantry");
  };

  const handleEdit = () => {
    router.push({
      pathname: "/(protected)/(modals)/edit-grocery-item",
      params: { id: item.id },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this grocery item?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: handleDeletePress },
      ]
    );
  };

  const handleDeletePress = async () => {
    if (!householdId || !user) return;

    await deleteGroceryItem(item.id);

    addToast("success", "Grocery item deleted successfully");
  };

  const handleMerge = () => {
    setTimeout(() => {
      router.push({
        pathname: "/(protected)/(modals)/select-grocery-item",
        params: { sourceId: item.id },
      });
    }, 0);
  };

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>
        <Button variant="outline" className="rounded-full" size="icon">
          <Icon as={MoreVertical} className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem
            key="add-to-shopping-list"
            onSelect={handleAddToShoppingList}
          >
            <DropdownMenuItemTitle>Add to Grocery List</DropdownMenuItemTitle>
            <DropdownMenuItemIcon ios={{ name: "scroll" }} />
          </DropdownMenuItem>
          <DropdownMenuItem key="add-to-pantry" onSelect={handleAddToPantry}>
            <DropdownMenuItemTitle>Add to Pantry</DropdownMenuItemTitle>
            <DropdownMenuItemIcon ios={{ name: "refrigerator" }} />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {!item.is_global && user?.id === item.user_id && (
          <DropdownMenuGroup>
            <DropdownMenuItem key="edit" onSelect={handleEdit}>
              <DropdownMenuItemTitle>Edit</DropdownMenuItemTitle>
              <DropdownMenuItemIcon ios={{ name: "pencil" }} />
            </DropdownMenuItem>
            <DropdownMenuItem key="merge" onSelect={handleMerge}>
              <DropdownMenuItemTitle>Merge</DropdownMenuItemTitle>
              <DropdownMenuItemIcon
                ios={{ name: "arrow.trianglehead.merge" }}
              />
            </DropdownMenuItem>
            <DropdownMenuItem key="delete" destructive onSelect={handleDelete}>
              <DropdownMenuItemTitle>Delete</DropdownMenuItemTitle>
              <DropdownMenuItemIcon ios={{ name: "trash" }} />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};
