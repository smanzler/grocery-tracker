import { ScrollViewProps } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export function BScrollView({ children, ...props }: ScrollViewProps) {
  return (
    <ScrollView
      className="px-4"
      contentContainerClassName="gap-2 py-2 flex-grow"
      contentInsetAdjustmentBehavior="automatic"
      {...props}
    >
      {children}
    </ScrollView>
  );
}
