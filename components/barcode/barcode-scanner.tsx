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
import { Alert, Linking, View } from "react-native";
import { useUniwind } from "uniwind";
import { Button } from "../ui/button";
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "../ui/empty";
import { Icon } from "../ui/icon";
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";

export default function BarcodeScanner({
  onScan,
}: {
  onScan: (data: Tables<"grocery_items">) => Promise<boolean>;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const scanningRef = useRef<boolean>(false);

  const invalidCodes = useRef<string[]>([]);

  const [permission, requestPermission] = useCameraPermissions();
  const { theme } = useUniwind();

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleError = (error: string, barcode?: string) => {
    if (barcode) {
      invalidCodes.current.push(barcode);
    }
    Alert.alert("Error", error);
    setMessage(null);
    scanningRef.current = false;
  };

  const handleBarcodeScanned = async ({
    data: barcode,
  }: BarcodeScanningResult) => {
    if (scanningRef.current || invalidCodes.current.includes(barcode)) {
      return;
    }
    console.log(barcode);
    scanningRef.current = true;
    setMessage("Scanning...");
    if (
      !barcode ||
      typeof barcode !== "string" ||
      barcode.trim().length === 0
    ) {
      handleError("Invalid barcode", barcode);
      return;
    }

    const EAN13 = /^\d{13}$/;
    const UPCA = /^\d{12}$/;
    const EAN8 = /^\d{8}$/;

    if (!(EAN13.test(barcode) || UPCA.test(barcode) || EAN8.test(barcode))) {
      handleError("Invalid barcode", barcode);
      return;
    }

    try {
      const { data: groceryItem, error: groceryItemError } =
        await supabase.functions.invoke("get-barcode-data", {
          body: { barcode },
        });

      if (groceryItemError) {
        throw groceryItemError.message;
      }

      setMessage("Processing...");
      const success = await onScan(groceryItem as Tables<"grocery_items">);
      if (!success) {
        handleError("Failed to add item to list", barcode);
        return;
      }
      setMessage("Scan complete");
    } catch (error) {
      handleError("Failed to get barcode data", barcode);
      return;
    }
  };

  const handleBackPress = () => {
    router.back();
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

  if (message) {
    return (
      <View className="flex-1 justify-center items-center gap-2">
        {message !== "Scan complete" && <Spinner />}
        <Text>{message}</Text>
      </View>
    );
  }

  return (
    <View className="relative flex-1 justify-center">
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

      <View className="absolute inset-0 items-center justify-center pointer-events-none">
        <View className="w-64 h-40 relative">
          <View className="absolute left-0 top-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
          <View className="absolute right-0 top-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
          <View className="absolute left-0 bottom-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
          <View className="absolute right-0 bottom-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
        </View>
        <Text className="text-white font-semibold mt-3 text-base">
          Align barcode within frame
        </Text>
      </View>
    </View>
  );
}
