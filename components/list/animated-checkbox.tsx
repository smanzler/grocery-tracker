import * as Haptics from "expo-haptics";
import { ShoppingBasket, Square } from "lucide-react-native";
import { memo, useEffect, useMemo, useRef } from "react";
import { View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Line } from "react-native-svg";
import { useUniwind } from "uniwind";
import { Icon } from "../ui/icon";

const AnimatedLine = Animated.createAnimatedComponent(Line);

const BurstLine = memo(
  ({
    index,
    totalLines,
    center,
    innerRadius,
    outerRadius,
    burstProgress,
    strokeColor,
  }: {
    index: number;
    totalLines: number;
    center: number;
    innerRadius: number;
    outerRadius: number;
    burstProgress: SharedValue<number>;
    strokeColor: string;
  }) => {
    const angle = useMemo(
      () => (2 * Math.PI * index) / totalLines,
      [index, totalLines]
    );
    const x1 = useMemo(
      () => center + innerRadius * Math.cos(angle),
      [center, innerRadius, angle]
    );
    const y1 = useMemo(
      () => center + innerRadius * Math.sin(angle),
      [center, innerRadius, angle]
    );

    const animatedProps = useAnimatedProps(() => {
      const burstOpacity = interpolate(
        burstProgress.value,
        [0, 0.2, 0.6, 0.9, 1],
        [0, 1, 1, 0.6, 0]
      );
      const distance = interpolate(
        burstProgress.value,
        [0, 1],
        [innerRadius, outerRadius]
      );
      const x2 = center + distance * Math.cos(angle);
      const y2 = center + distance * Math.sin(angle);

      return {
        x2,
        y2,
        strokeOpacity: burstOpacity,
        strokeWidth: 2,
      };
    });

    return (
      <AnimatedLine
        x1={x1}
        y1={y1}
        animatedProps={animatedProps}
        stroke={strokeColor}
        strokeLinecap="round"
      />
    );
  }
);

BurstLine.displayName = "BurstLine";

export const AnimatedCheckbox = memo(({ checked }: { checked: boolean }) => {
  const { theme } = useUniwind();
  const isFirstRender = useRef(true);

  const progress = useSharedValue(checked ? 1 : 0);
  const burstProgress = useSharedValue(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      progress.value = checked ? 1 : 0;
      return;
    }

    if (checked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      progress.value = withSpring(1, {
        damping: 10,
        stiffness: 50,
        mass: 1,
      });
      burstProgress.value = 0;
      burstProgress.value = withTiming(1, {
        duration: 400,
      });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      progress.value = withTiming(0, {
        duration: 200,
      });
      burstProgress.value = 0;
    }
  }, [checked, progress, burstProgress]);

  const squareStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.5, 1], [1, 0.5, 0]);
    const scale = interpolate(progress.value, [0, 0.5, 1], [1, 0.9, 0.85]);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const basketStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 0.3, 0.7, 1],
      [0, 0.8, 1, 1]
    );
    const scale = interpolate(
      progress.value,
      [0, 0.3, 0.7, 1],
      [0.6, 0.9, 1, 1]
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Impact burst configuration - memoized to avoid recalculation
  const burstConfig = useMemo(() => {
    const size = 24;
    const center = size / 2;
    const innerRadius = 12;
    const outerRadius = 30;
    const lines = 8;
    const strokeColor = theme === "dark" ? "#fff" : "#000";
    return { size, center, innerRadius, outerRadius, lines, strokeColor };
  }, [theme]);

  return (
    <View className="relative size-6">
      <Animated.View
        className="absolute size-6 items-center justify-center"
        style={squareStyle}
      >
        <Icon as={Square} className="size-5 text-muted-foreground" />
      </Animated.View>
      <Animated.View
        className="absolute size-6 items-center justify-center"
        style={basketStyle}
      >
        <Icon as={ShoppingBasket} className="size-5" />
      </Animated.View>
      {checked && (
        <Svg
          width={burstConfig.size}
          height={burstConfig.size}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {Array.from({ length: burstConfig.lines }).map((_, i) => (
            <BurstLine
              key={i}
              index={i}
              totalLines={burstConfig.lines}
              center={burstConfig.center}
              innerRadius={burstConfig.innerRadius}
              outerRadius={burstConfig.outerRadius}
              burstProgress={burstProgress}
              strokeColor={burstConfig.strokeColor}
            />
          ))}
        </Svg>
      )}
    </View>
  );
});

AnimatedCheckbox.displayName = "AnimatedCheckbox";
