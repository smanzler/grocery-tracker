import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { Camera, X } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScanReceipt() {
  const [permission, requestPermission] = useCameraPermissions();

  const { bottom, top } = useSafeAreaInsets();

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleTakePhoto = () => {
    console.log("take photo");
  };

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <Icon as={Camera} />
        </EmptyMedia>
        <EmptyTitle>Camera permission required</EmptyTitle>
        <EmptyDescription>
          We need your permission to show the camera to scan barcodes for
          grocery items.
        </EmptyDescription>
        {!permission || !permission.canAskAgain ? (
          <Button variant="outline" onPress={handleOpenSettings}>
            <Text>Open settings</Text>
          </Button>
        ) : (
          <Button variant="outline" onPress={requestPermission}>
            <Text>Request permission</Text>
          </Button>
        )}
      </Empty>
    );
  }
  return (
    <View className="relative flex-1 justify-center">
      <CameraView style={{ flex: 1 }} facing="back" />

      <Button
        onPress={() => router.back()}
        size="icon"
        className="absolute top-4 left-4 rounded-full z-10"
        style={{ marginTop: top }}
      >
        <Icon as={X} className="text-secondary" />
      </Button>

      <View
        className="absolute bottom-4 items-center w-full"
        style={{ marginBottom: bottom }}
      >
        <Pressable
          className="size-20 items-center justify-center bg-primary rounded-full"
          onPress={handleTakePhoto}
        >
          <Icon as={Camera} className="text-secondary" />
        </Pressable>
      </View>
    </View>
  );
}
