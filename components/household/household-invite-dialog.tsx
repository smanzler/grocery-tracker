import { Button, buttonVariants } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import * as Clipboard from "expo-clipboard";
import { Copy, Share } from "lucide-react-native";
import React from "react";
import {
  Alert,
  Dimensions,
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

export const HouseholdInviteDialog = ({
  children,
  inviteLink,
  setInviteLink,
}: {
  children: React.ReactNode;
  inviteLink: string | null;
  setInviteLink: (inviteLink: string | null) => void;
}) => {
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
      <AlertDialogTrigger>{children}</AlertDialogTrigger>
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
