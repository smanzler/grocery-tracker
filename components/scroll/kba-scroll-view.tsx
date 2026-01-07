import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from "react-native-keyboard-controller";

export function KBAScrollView({
  children,
  ...props
}: KeyboardAwareScrollViewProps) {
  return (
    <KeyboardAwareScrollView
      contentContainerClassName="gap-6 items-center"
      className="p-4"
      contentInsetAdjustmentBehavior="automatic"
      bottomOffset={64}
      {...props}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
