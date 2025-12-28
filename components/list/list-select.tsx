import { useLists } from "@/api/list/queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const ListSelect = () => {
  const { data } = useLists();
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select a list" />
      </SelectTrigger>
      <SelectContent>
        {data?.map((list) => (
          <SelectItem key={list.id} value={list.id} label={list.name ?? ""}>
            {list.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
