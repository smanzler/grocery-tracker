import { useHousehold } from "@/api/household/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { router } from "expo-router";
import {
  ArrowRightIcon,
  HomeIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react-native";

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
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar alt={user.email ?? ""} className="size-8">
          <AvatarImage source={{ uri: user.user_metadata.avatar_url }} />
          <AvatarFallback>
            <Text>{user.email?.charAt(0)}</Text>
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={2}>
        <DropdownMenuItem>
          <Text>Profile</Text>
          <Icon className="size-4" as={UserIcon} />
        </DropdownMenuItem>
        {householdId && (
          <>
            <DropdownMenuItem onPress={handleHouseholdsPress}>
              <Text>Households</Text>
              <Icon className="size-4" as={HomeIcon} />
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!household}
              onPress={handleHouseholdPress}
            >
              {isHouseholdLoading || !household ? (
                <Spinner />
              ) : (
                <Text>{household.name}</Text>
              )}
              <Icon className="size-4" as={ArrowRightIcon} />
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Text>Account Settings</Text>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Text>Help & Support</Text>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onPress={signOut}>
          <Text>Logout</Text>
          <Icon className="size-4 text-destructive" as={LogOutIcon} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
