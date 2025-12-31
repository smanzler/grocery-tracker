import GroceryItemInput from "@/components/grocery-item/grocery-item-input";
import ListItemList from "@/components/list/list-item-list";
import { View } from "react-native";

export default function Home() {
  return (
    <View className="flex-1">
      <ListItemList />

      <GroceryItemInput />
    </View>
  );
}
