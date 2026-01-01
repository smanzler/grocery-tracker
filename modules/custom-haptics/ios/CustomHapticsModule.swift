import ExpoModulesCore
import CoreHaptics

public class CustomHapticsModule: Module {
  private var engine: CHHapticEngine?

  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('CustomHaptics')` in JavaScript.
    Name("CustomHaptics")

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("impactAsync") { (duration: Int) in
      // Check if the current hardware supports haptics
      guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else {
        print("Haptics not supported")
        return
      }

      // Lazily initialize the haptic engine if it hasn't been already
      if engine == nil {
        engine = try CHHapticEngine()
        try engine?.start()
      }

      // Convert duration from milliseconds to seconds
      let durationSeconds = Double(duration) / 1000.0

      // Define a continuous haptic event with high intensity and medium sharpness
      let event = CHHapticEvent(
        eventType: .hapticContinuous,
        parameters: [
          CHHapticEventParameter(
            parameterID: .hapticIntensity,
            value: 1.0 // Maximum intensity
          ),
          CHHapticEventParameter(
            parameterID: .hapticSharpness,
            value: 0.4 // Medium sharpness
          )
        ],
        relativeTime: 0, // Start immediately
        duration: durationSeconds // Duration specified by JS caller
      )

      // Create a pattern from the event (single vibration, no global parameters)
      let pattern = try CHHapticPattern(events: [event], parameters: [])
      // Create a haptic player with this pattern
      let player = try engine?.makePlayer(with: pattern)
      // Start the haptic event immediately
      try player?.start(atTime: 0)
    }
  }
}
