import {
  useCheckoutListItems,
  useCreateListItem,
} from "@/api/list-item/mutations";
import { useListItems } from "@/api/list-item/queries";
import { ListItem } from "@/components/list/list-item";
import {
  ListItemDialog,
  ListItemFormData,
} from "@/components/list/list-item-dialog";
import { BScrollView } from "@/components/scroll/b-scroll-view";
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
import { Alert, Pressable, View } from "react-native";
import { useUniwind } from "uniwind";

export default function Home() {
  const { theme } = useUniwind();
  const { householdId } = useHouseholdStore();
  const { data, isLoading } = useListItems(householdId ?? undefined);
  const { user } = useAuthStore();
  const { mutate: createListItem } = useCreateListItem(householdId ?? "");
  const { mutateAsync: checkoutListItems, isPending: isCheckingOut } =
    useCheckoutListItems(householdId ?? "");

  if (isLoading || !user || !householdId) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  const handleCheckout = () => {
    Alert.alert(
      "Checkout",
      "Are you sure you want to checkout? This will move checked items to the pantry.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Checkout",
          onPress: async () => await checkoutListItems(),
          isPreferred: true,
        },
      ]
    );
  };

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
      <BScrollView>
        {sortedData.map((item) => (
          <ListItem key={item.id} item={item} />
        ))}
      </BScrollView>
      <Button
        className="mx-6 mb-6"
        onPress={handleCheckout}
        disabled={isCheckingOut}
      >
        <Text>Checkout</Text>
        {isCheckingOut ? (
          <Spinner />
        ) : (
          <Icon
            as={ShoppingCartIcon}
            color={theme === "dark" ? "black" : "white"}
            className="size-4"
          />
        )}
      </Button>
    </>
  );
}
