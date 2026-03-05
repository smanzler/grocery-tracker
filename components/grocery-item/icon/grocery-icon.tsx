import { Image } from "expo-image";
import { GROCERY_ICONS, GroceryIconKey } from "./registry";

export function GroceryIcon({ icon }: { icon: GroceryIconKey }) {
  const IconComponent = GROCERY_ICONS[icon];
  return <Image source={{ uri: IconComponent.src }} className="size-5" />;
}
