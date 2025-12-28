import { SignUpForm } from "@/components/auth/signup-form";
import { ScrollView } from "react-native";

export default function SignUp() {
  return (
    <ScrollView className="flex-1 p-4" contentContainerClassName="items-center">
      <SignUpForm />
    </ScrollView>
  );
}
