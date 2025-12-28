import { useHouseholds } from "@/api/household/queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { useHouseholdStore } from "@/stores/household-store";
import { View } from "react-native";

export default function HouseholdSelect() {
  const { data: households, isLoading } = useHouseholds();
  const { selectHousehold } = useHouseholdStore();

  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="mb-4 text-xl font-semibold">Select a Household</Text>
      {isLoading ? (
        <Text>Loading households...</Text>
      ) : (
        <Select
          onValueChange={(value) => {
            console.log(value);
            if (value instanceof Option) {
              selectHousehold(value.value);
            } else if (value && typeof value === "string") {
              selectHousehold(value);
            }
          }}
        >
          <SelectTrigger className="w-full max-w-sm">
            <SelectValue placeholder="Select a household" />
          </SelectTrigger>
          <SelectContent>
            {households?.map((household) => (
              <SelectItem
                key={household.id}
                value={household.id}
                label={household.name ?? ""}
              >
                {household.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </View>
  );
}
