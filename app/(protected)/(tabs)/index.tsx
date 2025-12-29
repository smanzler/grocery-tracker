import { useCreateListItem } from "@/api/list-item/mutations";
import { useListItems } from "@/api/list-item/queries";
import { ListItem } from "@/components/list/list-item";
import {
  ListItemDialog,
  ListItemFormData,
} from "@/components/list/list-item-dialog";
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
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { Stack } from "expo-router";
import { PlusIcon, ShoppingCartIcon } from "lucide-react-native";
import { Pressable, ScrollView } from "react-native";
import { useUniwind } from "uniwind";

export default function Home() {
  const { theme } = useUniwind();
  const { householdId } = useHouseholdStore();
  const { data, isLoading } = useListItems(householdId ?? undefined);
  const { user } = useAuthStore();
  const { mutate: createListItem } = useCreateListItem(householdId ?? "");

  if (isLoading || !user || !householdId) {
    return <Spinner />;
  }

  const handleCreateListItem = async (data: ListItemFormData) => {
    createListItem({
      household_id: householdId,
      name: data.name,
      quantity: Number(data.quantity),
      user_id: user.id,
    });
  };

  if (!data || data.length === 0) {
    return (
      <Empty>
        <EmptyContent className="max-w-[300px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon as={ShoppingCartIcon} />
            </EmptyMedia>
            <EmptyTitle>No items in list</EmptyTitle>
            <EmptyDescription>
              You don't have any items in your grocery list yet. Add items to
              your list to get started.
            </EmptyDescription>
          </EmptyHeader>
          <ListItemDialog onSubmit={handleCreateListItem}>
            <Button>
              <Text>Add Item</Text>
              <Icon
                as={PlusIcon}
                color={theme === "dark" ? "black" : "white"}
              />
            </Button>
          </ListItemDialog>
        </EmptyContent>
      </Empty>
    );
  }

  const sortedData = [...data].sort((a, b) => {
    if (new Date(a.created_at) < new Date(b.created_at)) return 1;
    if (new Date(a.created_at) > new Date(b.created_at)) return -1;
    return 0;
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <ListItemDialog onSubmit={handleCreateListItem}>
              <Pressable>
                <Icon as={PlusIcon} />
              </Pressable>
            </ListItemDialog>
          ),
        }}
      />
      <ScrollView className="px-6 py-4" contentContainerClassName="gap-2">
        {sortedData.map((item) => (
          <ListItem key={item.id} item={item} />
        ))}
      </ScrollView>
    </>
  );
}
