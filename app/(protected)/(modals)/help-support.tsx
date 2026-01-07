import { KBAScrollView } from "@/components/scroll/kba-scroll-view";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { Mail } from "lucide-react-native";
import { Pressable, View } from "react-native";

const SUPPORT_EMAIL = "simanzler@gmail.com";

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
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Grocery Tracker Support`);
  };

  return (
    <KBAScrollView contentContainerClassName="gap-12">
      <View className="gap-4">
        <Text variant="h3" className="border-b border-border">
          FAQ
        </Text>

        <Accordion type="single" collapsible>
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>
                <Text>{item.question}</Text>
              </AccordionTrigger>
              <AccordionContent>
                <FieldDescription>{item.answer}</FieldDescription>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </View>

      <View className="gap-4">
        <Text variant="h3" className="border-b border-border">
          Contact Support
        </Text>
        <Field orientation="horizontal">
          <View className="flex-1 gap-1">
            <FieldLabel>Email</FieldLabel>
            <FieldDescription>{SUPPORT_EMAIL}</FieldDescription>
          </View>
          <Pressable onPress={handleContactSupport}>
            <Icon as={Mail} />
          </Pressable>
        </Field>
      </View>

      <View className="gap-4">
        <Text variant="h3" className="border-b border-border">
          About
        </Text>
        <FieldGroup>
          <Field className="gap-1">
            <FieldLabel>App Name</FieldLabel>
            <FieldDescription>Grocery Tracker</FieldDescription>
          </Field>
          <Field className="gap-1">
            <FieldLabel>Version</FieldLabel>
            <FieldDescription>
              {Constants.expoConfig?.version ||
                Constants.manifest?.version ||
                "1.0.0"}
            </FieldDescription>
          </Field>
          <Field className="gap-1">
            <FieldLabel>Description</FieldLabel>
            <FieldDescription>
              A collaborative grocery tracking app for managing shopping lists
              and pantry items with your household.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </View>
    </KBAScrollView>
  );
}
