import { NativeModule, requireNativeModule } from "expo";

declare class CustomHapticsModule extends NativeModule {
  impactAsync(duration: number): Promise<void>;
}

export default requireNativeModule<CustomHapticsModule>("CustomHaptics");
