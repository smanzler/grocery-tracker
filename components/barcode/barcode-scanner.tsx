import { Tables } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { router } from "expo-router";
import { Camera, X } from "lucide-react-native";
import { useRef, useState } from "react";
import { Linking, View } from "react-native";
import { useUniwind } from "uniwind";
import { Button } from "../ui/button";
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "../ui/empty";
import { Icon } from "../ui/icon";
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";

export default function BarcodeScanner({
  onScan,
}: {
  onScan: (data: Tables<"grocery_items">) => Promise<void>;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const scanningRef = useRef<boolean>(false);

  const [permission, requestPermission] = useCameraPermissions();
  const { theme } = useUniwind();

  const handleBarcodeScanned = async ({
    data: barcode,
  }: BarcodeScanningResult) => {
    if (scanningRef.current) {
      return;
    }
    scanningRef.current = true;
    setMessage("Scanning...");
    if (
      !barcode ||
      typeof barcode !== "string" ||
      barcode.trim().length === 0
    ) {
      return;
    }

    const EAN13 = /^\d{13}$/;
    const UPCA = /^\d{12}$/;
    const EAN8 = /^\d{8}$/;

    if (!(EAN13.test(barcode) || UPCA.test(barcode) || EAN8.test(barcode))) {
      return;
    }

    const { data: groceryItem, error: groceryItemError } =
      await supabase.functions.invoke("get-barcode-data", {
        body: { barcode },
      });

    if (groceryItemError) {
      throw groceryItemError;
    }

    setMessage("Processing...");
    await onScan(groceryItem as Tables<"grocery_items">);
    setMessage("Scan complete");
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleRequestPermission = async () => {
    if (!permission || !permission.canAskAgain) {
      Linking.openSettings();
      return;
    }

    const { status } = await requestPermission();

    if (status === "granted") {
      return;
    }

    Linking.openSettings();
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
          We need your permission to show the camera
        </EmptyDescription>
        <Button variant="outline" onPress={handleRequestPermission}>
          <Text>Grant permission</Text>
        </Button>
      </Empty>
    );
  }

  if (message) {
    return (
      <View className="flex-1 justify-center items-center gap-2">
        {message !== "Scan complete" && <Spinner />}
        <Text>{message}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center">
      <CameraView
        onCameraReady={() => console.log("camera ready")}
        facing="back"
        onBarcodeScanned={handleBarcodeScanned}
        style={{ flex: 1 }}
      />

      <Button
        onPress={handleBackPress}
        size="icon"
        className="absolute top-4 left-4 rounded-full z-10"
      >
        <Icon as={X} color={theme === "dark" ? "black" : "white"} />
      </Button>
    </View>
  );
}
