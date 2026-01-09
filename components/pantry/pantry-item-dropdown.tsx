import { usePantryBatches } from "@/api/pantry/batches/queries";
import { cn } from "@/lib/utils";
import { useHouseholdStore } from "@/stores/household-store";
import { formatDistanceToNow, isPast } from "date-fns";
import { Package } from "lucide-react-native";
import { View } from "react-native";
import Animated, {
  FadeInUp,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";

export function PantryItemDropdown({ itemId }: { itemId: string }) {
  const { householdId } = useHouseholdStore();
  const { data: pantryBatches } = usePantryBatches({
    householdId,
    itemId,
    active: true,
  });

  if (!pantryBatches || pantryBatches.length === 0) return null;

  const sortedBatches = pantryBatches.sort((a, b) => {
    if (a.expires_at && b.expires_at) {
      return (
        new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime()
      );
    }
    if (a.expires_at) {
      return -1;
    }
    if (b.expires_at) {
      return 1;
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <Animated.View
      entering={FadeInUp.duration(200)}
      exiting={FadeOutUp.duration(200)}
      layout={LinearTransition.duration(200)}
      className="overflow-hidden"
    >
      {sortedBatches.map((batch, index) => {
        const percentage =
          (batch.remaining_quantity / batch.initial_quantity) * 100;
        const isExpired = batch.expires_at
          ? isPast(new Date(batch.expires_at))
          : false;

        return (
          <Animated.View
            key={batch.id}
            className="py-3 px-4 border-t border-border"
          >
            <View className="mb-2">
              <View className="flex-row items-center gap-2">
                <Icon as={Package} className="size-4 text-muted-foreground" />
                <Text className="text-sm font-medium">
                  {batch.remaining_quantity} of {batch.initial_quantity} left
                </Text>
              </View>
            </View>

            <View className="h-1.5 bg-muted rounded-full overflow-hidden">
              <View
                className={`h-full ${
                  isExpired ? "bg-destructive" : "bg-green-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </View>

            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-xs text-muted-foreground">
                Bought{" "}
                {formatDistanceToNow(new Date(batch.created_at), {
                  addSuffix: true,
                })}
              </Text>

              {batch.expires_at && !isExpired && (
                <Text
                  className={cn(
                    "text-xs",
                    isExpired ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  {isExpired
                    ? "Expired"
                    : `Expires ${formatDistanceToNow(
                        new Date(batch.expires_at),
                        {
                          addSuffix: true,
                        }
                      )}`}
                </Text>
              )}
            </View>
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}
