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
import { PlusIcon, ShoppingCartIcon } from "lucide-react-native";
import { useUniwind } from "uniwind";

export default function Ingredients() {
  const { theme } = useUniwind();

  return (
    <Empty>
      <EmptyContent>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon as={ShoppingCartIcon} />
          </EmptyMedia>
          <EmptyTitle>No ingredients found</EmptyTitle>
          <EmptyDescription>
            You don't have any ingredients yet. Add ingredients to your list to
            quickly add them to your grocery list.
          </EmptyDescription>
        </EmptyHeader>
        <Button>
          <Text>Add Ingredient</Text>
          <Icon as={PlusIcon} color={theme === "dark" ? "black" : "white"} />
        </Button>
      </EmptyContent>
    </Empty>
  );
}
