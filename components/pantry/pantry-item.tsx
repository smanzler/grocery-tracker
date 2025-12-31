import { Tables } from "@/lib/database.types";
import { generateColorFromUserId } from "@/lib/utils";
import { format } from "date-fns";
import { View } from "react-native";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Text } from "../ui/text";

export const PantryItem = ({ item }: { item: Tables<"pantry_items"> }) => {
  return (
    <View className="flex-row items-center justify-between px-4 py-2 rounded-md bg-card gap-4">
      <View className="flex-row items-center gap-2">
        <Avatar alt={item.name}>
          <AvatarFallback
            style={{ backgroundColor: generateColorFromUserId(item.id) }}
          >
            <Text>{item.name.charAt(0)}</Text>
          </AvatarFallback>
        </Avatar>
        <View className="space-y-1">
          <Text className="text-base font-medium">{item.name}</Text>

          <Text className="text-sm text-muted-foreground">
            Added by {item.user_id.slice(0, 6)} at{" "}
            {format(item.created_at, "MM/dd/yyyy")}
          </Text>
        </View>
      </View>
      <Text className="text-sm text-muted-foreground">{item.quantity}x</Text>
    </View>
  );
};
