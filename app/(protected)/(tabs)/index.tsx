import { useList } from "@/api/list/queries";
import { ListSelect } from "@/components/list/list-select";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function Home() {
  const params = useLocalSearchParams();
  const { data, error, isLoading } = useList(params.id as string);

  const renderContent = () => {
    if (!params.id) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text>No list id</Text>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text>Loading...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text>Error: {error.message}</Text>
        </View>
      );
    }

    if (data) {
      return (
        <View className="flex-1 items-center justify-center">
          <Button>
            <Text>Add Item</Text>
          </Button>
        </View>
      );
    }

    return (
      <View className="flex-1 items-start justify-start p-4">
        <Text>No items in list</Text>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Grocery List",
          headerLeft: () => <ListSelect />,
        }}
      />
      {renderContent()}
    </>
  );
}
