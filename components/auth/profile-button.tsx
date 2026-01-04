import { useHousehold } from "@/api/household/queries";
import { useProfile } from "@/api/profile/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemTitle,
  DropdownMenuLabel,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { router } from "expo-router";
import { View } from "react-native";
import { Spinner } from "../ui/spinner";

export const ProfileButton = () => {
  const { user, signOut } = useAuthStore();
  const { householdId, selectHousehold } = useHouseholdStore();

  const { data: profile, isLoading: isProfileLoading } = useProfile(user?.id);

  const { data: household, isLoading: isHouseholdLoading } = useHousehold(
    householdId ?? undefined
  );

  if (!user) {
    return null;
  }

  const handleHouseholdsPress = () => {
    selectHousehold(null);
  };

  const handleHouseholdPress = () => {
    router.push("/(protected)/(modals)/edit-household");
  };

  const handleProfilePress = () => {
    router.push("/(protected)/(modals)/profile");
  };

  const handleSettingsPress = () => {
    router.push("/(protected)/(modals)/settings");
  };

  const handleHelpSupportPress = () => {
    router.push("/(protected)/(modals)/help-support");
  };

  if (isHouseholdLoading || isProfileLoading) {
    return (
      <View className="size-8 bg-muted flex items-center justify-center rounded-full">
        <Spinner />
      </View>
    );
  }

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>
        <Avatar alt={user.email ?? ""} className="size-8">
          <AvatarImage
            source={{
              uri: profile?.image_url || user.user_metadata.avatar_url,
            }}
          />
          <AvatarFallback>
            <Text>{user.email?.charAt(0)}</Text>
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={2}>
        {householdId && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Households</DropdownMenuLabel>
            <DropdownMenuItem
              key="household"
              disabled={isHouseholdLoading || !household}
              onSelect={handleHouseholdPress}
            >
              <DropdownMenuItemTitle>Edit Household</DropdownMenuItemTitle>
              <DropdownMenuItemIcon ios={{ name: "pencil.and.outline" }} />
            </DropdownMenuItem>
            <DropdownMenuItem key="households" onSelect={handleHouseholdsPress}>
              <DropdownMenuItemTitle>Select Household</DropdownMenuItemTitle>
              <DropdownMenuItemIcon ios={{ name: "house" }} />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
        <DropdownMenuGroup>
          <DropdownMenuItem key="profile" onSelect={handleProfilePress}>
            <DropdownMenuItemTitle>Profile</DropdownMenuItemTitle>
            <DropdownMenuItemIcon ios={{ name: "person" }} />
          </DropdownMenuItem>
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuItem key="settings" onSelect={handleSettingsPress}>
            <DropdownMenuItemTitle>Settings</DropdownMenuItemTitle>
            <DropdownMenuItemIcon ios={{ name: "gearshape" }} />
          </DropdownMenuItem>
          <DropdownMenuItem
            key="help-support"
            onSelect={handleHelpSupportPress}
          >
            <DropdownMenuItemTitle>Help & Support</DropdownMenuItemTitle>
            <DropdownMenuItemIcon ios={{ name: "questionmark.circle" }} />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuItem key="logout" destructive onSelect={signOut}>
            <DropdownMenuItemTitle>Logout</DropdownMenuItemTitle>
            <DropdownMenuItemIcon
              ios={{ name: "rectangle.portrait.and.arrow.right" }}
            />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};
