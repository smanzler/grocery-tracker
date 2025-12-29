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
import { Text } from "@/components/ui/text";
import { PlusIcon, RefrigeratorIcon } from "lucide-react-native";
import { useUniwind } from "uniwind";

export default function Pantry() {
  const { theme } = useUniwind();

  return (
    <Empty>
      <EmptyContent>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon as={RefrigeratorIcon} />
          </EmptyMedia>
          <EmptyTitle>No items in pantry</EmptyTitle>
          <EmptyDescription>
            You don't have any items in your pantry yet. Add items to your
            grocery list and mark them as bought, or add items directly to the
            pantry.
          </EmptyDescription>
        </EmptyHeader>
        <Button>
          <Text>Add Item</Text>
          <Icon as={PlusIcon} color={theme === "dark" ? "black" : "white"} />
        </Button>
      </EmptyContent>
    </Empty>
  );
}
