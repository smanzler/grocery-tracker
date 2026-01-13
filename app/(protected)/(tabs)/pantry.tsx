import PantryList from "@/components/pantry/pantry-list";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemTitle,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { router, Stack } from "expo-router";
import { Plus } from "lucide-react-native";
import { Pressable } from "react-native";

export default function Pantry() {
  const handleScanReceipt = () => {
    router.push({
      pathname: "/(protected)/(modals)/scan-receipt",
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <DropdownMenuRoot>
              <DropdownMenuTrigger>
                <Pressable>
                  <Icon as={Plus} />
                </Pressable>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  key="scan-receipt"
                  onSelect={handleScanReceipt}
                >
                  <DropdownMenuItemTitle>Scan Receipt</DropdownMenuItemTitle>
                  <DropdownMenuItemIcon ios={{ name: "scanner" }} />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuRoot>
          ),
        }}
      />
      <PantryList />
    </>
  );
}
