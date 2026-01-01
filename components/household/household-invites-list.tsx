import { useRemoveHouseholdInvite } from "@/api/household/invites/mutations";
import { useHouseholdInvites } from "@/api/household/invites/queries";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Tables } from "@/lib/database.types";
import { useHouseholdStore } from "@/stores/household-store";
import * as Linking from "expo-linking";
import { CopyIcon, TrashIcon } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { HouseholdInviteDialog } from "./household-invite-dialog";

const HouseholdInviteItem = ({
  invite,
}: {
  invite: Omit<Tables<"household_invites">, "household_id">;
}) => {
  const { householdId } = useHouseholdStore();
  const { mutateAsync: removeHouseholdInvite, isPending: isRemovingInvite } =
    useRemoveHouseholdInvite(householdId ?? "");

  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleSetInviteLink = (token: string | null) => {
    if (!token) return;
    const link = Linking.createURL("join-household", {
      queryParams: { token },
    });
    console.log(link);
    setInviteLink(link);
  };

  return (
    <View
      key={invite.id}
      className="flex-row items-center justify-between pb-4"
    >
      <View>
        <Text className="text-sm text-foreground">
          Uses:{" "}
          <Text className=" text-sm font-bold">{invite.used_count ?? 0}</Text>/
          {invite.max_uses ?? "∞"}
        </Text>

        <Text className="text-xs text-muted-foreground mt-1">
          Created: {new Date(invite.created_at ?? "").toLocaleDateString()} |
          Expires: {new Date(invite.expires_at ?? "").toLocaleDateString()}
        </Text>
      </View>
      <View className="flex flex-row items-center gap-2">
        <HouseholdInviteDialog
          inviteLink={inviteLink}
          setInviteLink={setInviteLink}
        >
          <Pressable onPress={() => handleSetInviteLink(invite.token)}>
            <Icon as={CopyIcon} className="size-4" />
          </Pressable>
        </HouseholdInviteDialog>
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
  );
};

export const HouseholdInvitesList = () => {
  const { householdId } = useHouseholdStore();
  const { data: householdInvites, isLoading: isInvitesLoading } =
    useHouseholdInvites(householdId ?? undefined);

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
      <HouseholdInviteItem key={invite.id} invite={invite} />
    ))
  );
};
