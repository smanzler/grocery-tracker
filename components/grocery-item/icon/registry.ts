export type GroceryIconDescriptor = {
  src: string;
};

export const GROCERY_ICONS: Record<string, GroceryIconDescriptor> = {
  dairy: { src: require("@/assets/icons/dairy.svg") },
  meat: { src: require("@/assets/icons/meat.svg") },
  "produce-fruit": { src: require("@/assets/icons/produce-fruit.svg") },
  "produce-vegetable": { src: require("@/assets/icons/produce-vegetable.svg") },
  bakery: { src: require("@/assets/icons/bakery.svg") },
  beverage: { src: require("@/assets/icons/beverage.svg") },
  "pantry-grains": { src: require("@/assets/icons/pantry-grains.svg") },
  snacks: { src: require("@/assets/icons/snacks.svg") },
  frozen: { src: require("@/assets/icons/frozen.svg") },
  condiments: { src: require("@/assets/icons/condiments.svg") },
  canned: { src: require("@/assets/icons/canned.svg") },
  spices: { src: require("@/assets/icons/spices.svg") },
  household: { src: require("@/assets/icons/household.svg") },
} as const;

export type GroceryIconKey = keyof typeof GROCERY_ICONS;
