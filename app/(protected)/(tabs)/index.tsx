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

export default function Home() {
  const { theme } = useUniwind();

  return (
    <Empty>
      <EmptyContent className="max-w-[300px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon as={ShoppingCartIcon} />
          </EmptyMedia>
          <EmptyTitle>No items in list</EmptyTitle>
          <EmptyDescription>
            You don't have any items in your grocery list yet. Add items to your
            list to get started.
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
