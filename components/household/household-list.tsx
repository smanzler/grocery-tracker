import { useHouseholds } from "@/api/household/queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const HouseholdList = () => {
  const { data } = useHouseholds();
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select a household" />
      </SelectTrigger>
      <SelectContent>
        {data?.map((household) => (
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
  );
};
