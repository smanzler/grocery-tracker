import { View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { Input } from "../ui/input";
import { Text } from "../ui/text";

const OFFSET = {
  closed: 0,
  opened: 20,
};

export default function GroceryItemInput() {
  return (
    <KeyboardStickyView offset={OFFSET}>
      <View>
        <Text>Add Item</Text>
        <Input />
      </View>
    </KeyboardStickyView>
  );
}
