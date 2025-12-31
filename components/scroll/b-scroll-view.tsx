import { ScrollView, ScrollViewProps } from "react-native";

export function BScrollView({ children, ...props }: ScrollViewProps) {
  return (
    <ScrollView
      className="px-4"
      contentContainerClassName="gap-2 py-2"
      contentInsetAdjustmentBehavior="automatic"
      {...props}
    >
      {children}
    </ScrollView>
  );
}
