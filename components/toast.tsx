import {
  type Toast as Toast1,
  type ToastType,
  useToastStore,
} from "@/stores/toast-store";
import { BlurView } from "expo-blur";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
} from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";
import { Icon } from "./ui/icon";
import { Text } from "./ui/text";

const getIconComponent = (type: ToastType) => {
  switch (type) {
    case "success":
      return CircleCheckIcon;
    case "error":
      return CircleXIcon;
    case "info":
      return InfoIcon;
    case "warning":
      return CircleAlertIcon;
    default:
      return InfoIcon;
  }
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const STACK_OFFSET = 8;
const SCALE_FACTOR = 0.05;

function ToastItem({ toast, index }: { toast: Toast1; index: number }) {
  const { removeToast } = useToastStore();
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1 - index * SCALE_FACTOR);
  const translateY = useSharedValue(index * STACK_OFFSET);

  useEffect(() => {
    scale.value = withSpring(1 - index * SCALE_FACTOR, {
      damping: 20,
      stiffness: 300,
    });
    translateY.value = withSpring(index * STACK_OFFSET, {
      damping: 20,
      stiffness: 300,
    });
  }, [index, scale, translateY]);

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, toast.options?.duration ?? 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.options?.duration, removeToast]);

  const dismissToast = () => {
    removeToast(toast.id);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow horizontal swipe on the top card
      if (index === 0) {
        translateX.value = event.translationX;
        // Fade out as user swipes
        opacity.value = Math.max(0, 1 - Math.abs(event.translationX) / 200);
      }
    })
    .onEnd((event) => {
      if (index === 0) {
        // If swiped more than 100px or velocity is high, dismiss
        if (
          Math.abs(event.translationX) > 100 ||
          Math.abs(event.velocityX) > 500
        ) {
          // Animate out
          translateX.value = withTiming(
            event.translationX > 0 ? 400 : -400,
            { duration: 200 },
            () => {
              scheduleOnRN(dismissToast);
            }
          );
          opacity.value = withTiming(0, { duration: 200 });
        } else {
          // Spring back to center
          translateX.value = withSpring(0);
          opacity.value = withSpring(1);
        }
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: index === 0 ? opacity.value : 1,
  }));

  return (
    <Animated.View
      entering={FadeInUp.duration(300).delay(index * 50)}
      exiting={FadeOutUp.duration(200)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100 - index,
        alignItems: "center",
      }}
    >
      <GestureDetector gesture={panGesture}>
        <AnimatedPressable
          style={animatedStyle}
          onPress={dismissToast}
          className="max-w-sm rounded-full overflow-hidden w-full shadow-xl shadow-black/5"
        >
          <BlurView
            tint="systemUltraThinMaterialLight"
            className="py-4 px-8 w-full flex-row items-center gap-4"
          >
            <Icon
              as={getIconComponent(toast.type)}
              className="size-6 text-foreground"
            />
            <View className="flex-1">
              <Text className="text-base text-foreground bold">
                {toast.message}
              </Text>
              {toast.options?.description && (
                <Text className="text-sm text-muted-foreground line-clamp-2">
                  {toast.options?.description}
                </Text>
              )}
            </View>
          </BlurView>
        </AnimatedPressable>
      </GestureDetector>
    </Animated.View>
  );
}

export function Toast() {
  const { top } = useSafeAreaInsets();
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <View
      className="absolute left-0 right-0 top-0 items-center p-4 pointer-events-box-none"
      style={{ marginTop: top }}
    >
      {toasts.slice(0, 3).map((toast, index) => (
        <ToastItem key={toast.id} toast={toast} index={index} />
      ))}
    </View>
  );
}
