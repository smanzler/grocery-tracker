import { useHousehold } from "@/api/household/queries";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { router } from "expo-router";
import { ArrowRightIcon, HomeIcon, UserIcon } from "lucide-react-native";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Icon } from "../ui/icon";
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";

export const ProfileButton = () => {
  const { user } = useAuthStore();
  const { householdId, selectHousehold } = useHouseholdStore();

  const { data: household, isLoading: isHouseholdLoading } = useHousehold(
    householdId ?? undefined
  );

  if (!user || !householdId) {
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
        <Avatar alt={user.email ?? ""}>
          <AvatarImage source={{ uri: user.user_metadata.avatar_url }} />
          <AvatarFallback>
            <Text>{user.email?.charAt(0)}</Text>
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={2}>
        <DropdownMenuItem>
          <Text>Profile</Text>
          <Icon className="size-4 ml-auto" as={UserIcon} />
        </DropdownMenuItem>
        <DropdownMenuItem onPress={handleHouseholdsPress}>
          <Text>Households</Text>
          <Icon className="size-4 ml-auto" as={HomeIcon} />
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!household} onPress={handleHouseholdPress}>
          {isHouseholdLoading || !household ? (
            <Spinner />
          ) : (
            <Text>{household.name}</Text>
          )}
          <Icon className="size-4 ml-auto" as={ArrowRightIcon} />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Text>Account Settings</Text>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Text>Help & Support</Text>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Text>Logout</Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
