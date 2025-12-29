import { useRemoveHouseholdInvite } from "@/api/household/invites/mutations";
import { useHouseholdInvites } from "@/api/household/invites/queries";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useHouseholdStore } from "@/stores/household-store";
import * as Clipboard from "expo-clipboard";
import { CopyIcon, TrashIcon } from "lucide-react-native";
import { Alert, Pressable, View } from "react-native";

export const HouseholdInvitesList = () => {
  const { householdId } = useHouseholdStore();
  const { mutateAsync: removeHouseholdInvite, isPending: isRemovingInvite } =
    useRemoveHouseholdInvite(householdId ?? "");
  const { data: householdInvites, isLoading: isInvitesLoading } =
    useHouseholdInvites(householdId ?? undefined);

  async function handleCopyInvite(token: string) {
    await Clipboard.setStringAsync(token);
    Alert.alert("Success", "Invite link copied to clipboard");
  }

  return isInvitesLoading ? (
    <View className="py-4 items-center justify-center">
      <Spinner />
    </View>
  ) : !householdInvites || householdInvites.length === 0 ? (
    <Text className="text-muted-foreground text-center">
      No invites for this household
    </Text>
  ) : (
    householdInvites.map((invite) => (
      <View key={invite.id} className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm text-foreground">
            Used invites:{" "}
            <Text className=" text-sm font-bold">{invite.used_count ?? 0}</Text>
            /{invite.max_uses ?? "∞"}
          </Text>

          <Text className="text-xs text-muted-foreground mt-1">
            Created: {new Date(invite.created_at ?? "").toLocaleDateString()} |
            Expires: {new Date(invite.expires_at ?? "").toLocaleDateString()}
          </Text>
        </View>
        <View className="flex flex-row items-center gap-2">
          <Pressable onPress={() => handleCopyInvite(invite.token)}>
            <Icon as={CopyIcon} className="size-4" />
          </Pressable>
          <Pressable
            onPress={() => removeHouseholdInvite(invite.id)}
            disabled={isRemovingInvite}
          >
            {isRemovingInvite ? (
              <Spinner />
            ) : (
              <Icon as={TrashIcon} className="size-4 text-destructive" />
            )}
          </Pressable>
        </View>
      </View>
    ))
  );
};
