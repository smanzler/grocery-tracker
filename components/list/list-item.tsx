import { useUpdateListItem } from "@/api/list-item/mutations";
import { AnimatedCheckbox } from "@/components/list/animated-checkbox";
import { Text } from "@/components/ui/text";
import { Tables } from "@/lib/database.types";
import { Pressable, View } from "react-native";

export const ListItem = ({ item }: { item: Tables<"list_items"> }) => {
  const { mutateAsync: updateListItem, isPending } = useUpdateListItem(
    item.household_id
  );

  const handleCompleteChange = async () => {
    if (isPending) return;
    await updateListItem({
      id: item.id,
      checked: !item.checked,
    });
  };

  return (
    <Pressable
      className="flex-row items-center justify-between p-2 rounded-md bg-card"
      onPress={handleCompleteChange}
      disabled={isPending}
    >
      <View className="flex-row items-center gap-2">
        <AnimatedCheckbox checked={item.checked} />
        <Text>{item.quantity}</Text>
        <Text>{item.name}</Text>
      </View>
    </Pressable>
  );
};
