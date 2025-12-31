import { useHousehold } from "@/api/household/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemTitle,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { router } from "expo-router";

export const ProfileButton = () => {
  const { user, signOut } = useAuthStore();
  const { householdId, selectHousehold } = useHouseholdStore();

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

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>
        <Avatar alt={user.email ?? ""} className="size-8">
          <AvatarImage source={{ uri: user.user_metadata.avatar_url }} />
          <AvatarFallback>
            <Text>{user.email?.charAt(0)}</Text>
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={2}>
        <DropdownMenuItem key="profile">
          <DropdownMenuItemTitle>Profile</DropdownMenuItemTitle>
          <DropdownMenuItemIcon ios={{ name: "person" }} />
        </DropdownMenuItem>
        {householdId && (
          <>
            <DropdownMenuItem key="households" onSelect={handleHouseholdsPress}>
              <DropdownMenuItemTitle>Households</DropdownMenuItemTitle>
              <DropdownMenuItemIcon ios={{ name: "house" }} />
            </DropdownMenuItem>
            <DropdownMenuItem
              key="household"
              disabled={isHouseholdLoading || !household}
              onSelect={handleHouseholdPress}
            >
              <DropdownMenuItemTitle>
                {isHouseholdLoading
                  ? "Loading..."
                  : !household || !household.name
                  ? "No household selected"
                  : household.name}
              </DropdownMenuItemTitle>
              <DropdownMenuItemIcon ios={{ name: "arrow-right" }} />
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem key="account-settings">
          <DropdownMenuItemTitle>Account Settings</DropdownMenuItemTitle>
          <DropdownMenuItemIcon ios={{ name: "gearshape" }} />
        </DropdownMenuItem>
        <DropdownMenuItem key="help-support">
          <DropdownMenuItemTitle>Help & Support</DropdownMenuItemTitle>
          <DropdownMenuItemIcon ios={{ name: "questionmark.circle" }} />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem key="logout" destructive onSelect={signOut}>
          <DropdownMenuItemTitle>Logout</DropdownMenuItemTitle>
          <DropdownMenuItemIcon
            ios={{ name: "rectangle.portrait.and.arrow.right" }}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};
