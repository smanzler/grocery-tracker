import { useUpdateListItem } from "@/api/list-item/mutations";
import { Checkbox } from "@/components/ui/checkbox";
import { Text } from "@/components/ui/text";
import { Tables } from "@/lib/database.types";
import { Pressable, View } from "react-native";

export const ListItem = ({ item }: { item: Tables<"list_items"> }) => {
  const { mutateAsync: updateListItem } = useUpdateListItem(item.household_id);

  const handleCompleteChange = async () => {
    console.log("handleCompleteChange", item.completed, item.id);
    await updateListItem({
      id: item.id,
      completed: !item.completed,
    });
  };

  return (
    <Pressable
      className="flex-row items-center justify-between"
      onPress={handleCompleteChange}
    >
      <View className="flex-row items-center gap-2">
        <Checkbox
          checked={item.completed}
          onCheckedChange={handleCompleteChange}
        />
        <Text>{item.quantity}</Text>
        <Text>{item.name}</Text>
      </View>
    </Pressable>
  );
};
