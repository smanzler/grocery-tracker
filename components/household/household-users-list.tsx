import { useRemoveHouseholdUser } from "@/api/household/users/mutations";
import { useHouseholdUsers } from "@/api/household/users/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { generateColorFromUserId } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { format } from "date-fns";
import { Trash } from "lucide-react-native";
import { Alert, Pressable, View } from "react-native";

export const HouseholdUsersList = () => {
  const { householdId } = useHouseholdStore();
  const { data: householdUsers, isLoading: isUsersLoading } = useHouseholdUsers(
    householdId ?? undefined
  );
  const { user } = useAuthStore();

  const { mutateAsync: removeHouseholdUser } = useRemoveHouseholdUser();

  async function handleRemoveUser(householdUserId: string, userId: string) {
    if (!user) {
      Alert.alert("Error", "You must be logged in");
      return;
    }

    if (userId === user.id) {
      Alert.alert("Error", "You cannot remove yourself from the household");
      return;
    }

    Alert.alert(
      "Remove User",
      "Are you sure you want to remove this user from the household?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeHouseholdUser(householdUserId);
              Alert.alert("Success", "User removed from household");
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error ? error.message : "Failed to remove user"
              );
            }
          },
        },
      ]
    );
  }

  return isUsersLoading ? (
    <View className="py-4 items-center justify-center">
      <Spinner />
    </View>
  ) : !householdUsers || householdUsers.length === 0 ? (
    <Text className="text-muted-foreground text-center">
      No users in this household
    </Text>
  ) : (
    householdUsers.map((householdUser) => {
      const isCurrentUser = householdUser.user_id === user?.id;
      return (
        <View
          className="flex-row items-center gap-3 flex-1 pb-4"
          key={householdUser.id}
        >
          <Avatar alt={householdUser.user_id}>
            <AvatarImage
              source={{ uri: householdUser.profiles.image_url ?? undefined }}
            />
            <AvatarFallback
              style={{
                backgroundColor: generateColorFromUserId(householdUser.user_id),
              }}
            />
          </Avatar>
          <View className="flex-1">
            <Text className="font-medium">
              {householdUser.profiles?.display_name ?? "Unknown"}{" "}
              {isCurrentUser ? "(You)" : ""}
            </Text>
            <Text className="text-sm text-muted-foreground truncate line-clamp-1">
              Joined on {format(householdUser.created_at, "MMM d, yyyy")}
            </Text>
          </View>
          {!isCurrentUser && (
            <Pressable
              onPress={() =>
                handleRemoveUser(householdUser.id, householdUser.user_id)
              }
            >
              <Icon as={Trash} className="size-4 text-destructive" />
            </Pressable>
          )}
        </View>
      );
    })
  );
};
