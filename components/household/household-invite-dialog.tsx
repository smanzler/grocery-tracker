import { useCreateHouseholdInvite } from "@/api/household/invites/mutations";
import { Button, buttonVariants } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useHouseholdStore } from "@/stores/household-store";
import * as Clipboard from "expo-clipboard";
import { Copy, PlusIcon, Share } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  GestureResponderEvent,
  Share as RNShare,
  ScrollView,
  View,
} from "react-native";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Icon } from "../ui/icon";

const WIDTH = Dimensions.get("window").width;
const PADDING = 16;
const WIDTH_WITH_PADDING = WIDTH - PADDING * 2;

export const HouseholdInviteDialog = () => {
  const { householdId } = useHouseholdStore();
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const { mutateAsync: createHouseholdInvite } = useCreateHouseholdInvite();
  const handleCreateInvite = async (e: GestureResponderEvent) => {
    e.preventDefault();

    console.log("create invite");

    if (!householdId) {
      Alert.alert("Error", "No household selected");
      return;
    }

    try {
      const { inviteLink } = await createHouseholdInvite(householdId);

      setInviteLink(inviteLink);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create invite"
      );
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteLink) return;
    await Clipboard.setStringAsync(inviteLink);
    Alert.alert("Success", "Invite link copied to clipboard");
  };

  const handleShareInvite = async () => {
    if (!inviteLink) return;
    RNShare.share({
      url: inviteLink,
      message: "Join my household!",
    });
    setInviteLink(null);
  };

  return (
    <AlertDialog
      open={!!inviteLink}
      onOpenChange={(open) => {
        if (!open) setInviteLink(null);
      }}
    >
      <AlertDialogTrigger>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onPress={handleCreateInvite}
        >
          <Icon as={PlusIcon} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent style={{ width: WIDTH_WITH_PADDING, maxWidth: 600 }}>
        <AlertDialogHeader>
          <AlertDialogTitle>Invite Link</AlertDialogTitle>
          <View className="flex-row items-center gap-2">
            <View
              className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text className="text-muted-foreground">{inviteLink}</Text>
              </ScrollView>
            </View>
            <Button variant="outline" size="icon" onPress={handleCopyInvite}>
              <Icon as={Copy} />
            </Button>
            <Button variant="outline" size="icon" onPress={handleShareInvite}>
              <Icon as={Share} />
            </Button>
          </View>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="default" onPress={() => setInviteLink(null)}>
            <Text>Done</Text>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
