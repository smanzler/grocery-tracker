import { ScrollView, ScrollViewProps } from "react-native";

export function BScrollView({ children, ...props }: ScrollViewProps) {
  return (
    <ScrollView
      className="px-6"
      contentContainerClassName="gap-2 py-4"
      contentInsetAdjustmentBehavior="automatic"
      {...props}
    >
      {children}
    </ScrollView>
  );
}
