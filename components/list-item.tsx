import { cn } from "@/lib/utils";
import { Globe } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { GroceryIcon } from "./grocery-item/icon/grocery-icon";
import { GroceryIconKey } from "./grocery-item/icon/registry";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Icon } from "./ui/icon";
import { Text } from "./ui/text";

interface Item {
  id?: string | null;
  name?: string | null;
  image_url?: string | null;
  subtitle?: string | null;
  is_global?: boolean | null;
  icon_key: GroceryIconKey;
}

interface ListItemProps {
  item: Item;
  handlePress?: () => void;
  renderRight?: () => React.ReactNode;
  className?: string;
}

export const ListItem = ({
  item,
  handlePress,
  renderRight,
  className,
}: ListItemProps) => {
  return (
    <Pressable
      className={cn(
        "flex-row items-center rounded-md gap-3 p-1 flex-1",
        className
      )}
      onPress={handlePress}
    >
      <View className="relative">
        <Avatar alt={item.name ?? ""} className="size-12 rounded-md">
          <AvatarImage source={{ uri: item.image_url ?? undefined }} />
          <GroceryIcon icon={item.icon_key} />
        </Avatar>
        {item.is_global && (
          <View className="absolute -bottom-1 -right-1 size-5 bg-blue-500 rounded-full border border-white items-center justify-center">
            <Icon as={Globe} className="size-3 text-white" />
          </View>
        )}
      </View>
      <View className="flex-1">
        <Text className="flex-shrink text-ellipsis line-clamp-2">
          {item.name ?? ""}
        </Text>
        {item.subtitle && (
          <Text className="text-sm text-muted-foreground line-clamp-2">
            {item.subtitle}
          </Text>
        )}
      </View>
      {renderRight && renderRight()}
    </Pressable>
  );
};
