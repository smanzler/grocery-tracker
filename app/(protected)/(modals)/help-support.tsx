import { KBAScrollView } from "@/components/scroll/kba-scroll-view";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { Pressable, View } from "react-native";

type FAQItem = {
  question: string;
  answer: string;
};

const faqItems: FAQItem[] = [
  {
    question: "How do I create a household?",
    answer:
      "To create a household, tap the profile button and select 'Select Household', then tap 'Create Household'. You can add a name and optional image for your household.",
  },
  {
    question: "How do I invite others to my household?",
    answer:
      "Go to your household settings by tapping 'Edit Household' in the profile menu. In the Invites tab, tap the '+' button to create an invite link. Share this link with others to join your household.",
  },
  {
    question: "How do I add items to my grocery list?",
    answer:
      "On the home screen, use the input field at the bottom to type and add items to your grocery list. Items will appear in the list above.",
  },
  {
    question: "What is the pantry feature?",
    answer:
      "The pantry allows you to track items you have at home. You can add items to your pantry, mark them as consumed, or remove them when they run out.",
  },
  {
    question: "Can I use this app offline?",
    answer:
      "The app requires an internet connection to sync data with the server. However, some features may work with cached data when offline.",
  },
  {
    question: "How do I change my profile information?",
    answer:
      "Tap the profile button and select 'Profile' to edit your display name, username, and profile picture.",
  },
];

export default function HelpSupport() {
  const handleContactSupport = () => {
    Linking.openURL(
      "mailto:support@example.com?subject=Grocery Tracker Support"
    );
  };

  return (
    <KBAScrollView>
      <View className="gap-4">
        <Text variant="h3">Frequently Asked Questions</Text>
        <Text variant="muted">
          Find answers to common questions about using the app
        </Text>
      </View>

      <Accordion type="single" collapsible className="mt-4">
        {faqItems.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>
              <Text className="text-left">{item.question}</Text>
            </AccordionTrigger>
            <AccordionContent>
              <Text>{item.answer}</Text>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Separator />

      <View className="gap-4">
        <Text variant="h3">Contact Support</Text>
        <Text variant="muted">
          Need help? Get in touch with our support team
        </Text>
        <View className="gap-2">
          <Text>Email: support@example.com</Text>
          <Text variant="muted">We typically respond within 24-48 hours.</Text>
          <Pressable onPress={handleContactSupport} className="mt-2">
            <Text className="text-primary underline">Send us an email</Text>
          </Pressable>
        </View>
      </View>

      <Separator />

      <View className="gap-4">
        <Text variant="h3">About</Text>
        <Text variant="muted">App information and version</Text>
        <View className="gap-4">
          <View>
            <Text variant="small" className="text-muted-foreground">
              App Name
            </Text>
            <Text className="mt-1">Grocery Tracker</Text>
          </View>
          <View>
            <Text variant="small" className="text-muted-foreground">
              Version
            </Text>
            <Text className="mt-1">
              {Constants.expoConfig?.version ||
                Constants.manifest?.version ||
                "1.0.0"}
            </Text>
          </View>
          <View>
            <Text variant="small" className="text-muted-foreground">
              Description
            </Text>
            <Text className="mt-1">
              A collaborative grocery tracking app for managing shopping lists
              and pantry items with your household.
            </Text>
          </View>
        </View>
      </View>
    </KBAScrollView>
  );
}
