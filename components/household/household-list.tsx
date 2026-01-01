import { useHouseholds } from "@/api/household/queries";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useHouseholdStore } from "@/stores/household-store";
import { formatDistanceToNow } from "date-fns";
import { router } from "expo-router";
import { ChevronRightIcon, HomeIcon, PlusIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useUniwind } from "uniwind";
import { BScrollView } from "../scroll/b-scroll-view";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemIcon,
  ContextMenuItemTitle,
  ContextMenuRoot,
  ContextMenuTrigger,
} from "../ui/context-menu";

export const HouseholdList = () => {
  const { data, isLoading } = useHouseholds();
  const { selectHousehold } = useHouseholdStore();

  const { theme } = useUniwind();

  const handleEditPress = (householdId: string) => {
    selectHousehold(householdId);
    router.push("/(protected)/(modals)/edit-household");
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!data || data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon as={HomeIcon} />
          </EmptyMedia>
          <EmptyTitle>No households found</EmptyTitle>
          <EmptyDescription>
            You don't have any households yet. Create a new household to get
            started.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            onPress={() => {
              console.log("create household");
              router.push("/(protected)/(modals)/create-household");
            }}
          >
            <Text>Create Household</Text>
            <Icon as={PlusIcon} color={theme === "dark" ? "black" : "white"} />
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <BScrollView>
      {data.map((household) => (
        <ContextMenuRoot key={household.id}>
          <ContextMenuTrigger asChild>
            <Pressable
              className="flex-row items-center gap-4 py-0 pr-2 overflow-hidden rounded-md bg-card"
              onPress={() => selectHousehold(household.id)}
            >
              <Avatar
                alt={household.name || ""}
                className="size-20 rounded-none"
              >
                <AvatarImage src={household.image_url || undefined} />
                <AvatarFallback className="rounded-none">
                  <Text>{household.name?.charAt(0) || "H"}</Text>
                </AvatarFallback>
              </Avatar>
              <View className="flex-1">
                <Text className="text-md font-semibold">{household.name}</Text>
                <Text className="text-sm text-muted-foreground">
                  Created {formatDistanceToNow(household.created_at)} ago
                </Text>
              </View>

              <Icon as={ChevronRightIcon} />
            </Pressable>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              key="edit"
              onSelect={() => handleEditPress(household.id)}
            >
              <ContextMenuItemTitle>Edit</ContextMenuItemTitle>
              <ContextMenuItemIcon ios={{ name: "pencil" }} />
            </ContextMenuItem>
            <ContextMenuItem key="delete" destructive>
              <ContextMenuItemTitle>Delete</ContextMenuItemTitle>
              <ContextMenuItemIcon ios={{ name: "trash" }} />
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuRoot>
      ))}
      <Separator className="my-4" />
      <Button
        onPress={() => {
          console.log("create household");
          router.push("/(protected)/(modals)/create-household");
        }}
      >
        <Text>Create Household</Text>
        <Icon as={PlusIcon} color={theme === "dark" ? "black" : "white"} />
      </Button>
    </BScrollView>
  );
};
