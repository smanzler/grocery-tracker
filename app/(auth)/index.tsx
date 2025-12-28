import { SignInForm } from "@/components/auth/signin-form";
import { ScrollView } from "react-native";

export default function SignIn() {
  return (
    <ScrollView className="flex-1 p-4" contentContainerClassName="items-center">
      <SignInForm />
    </ScrollView>
  );
}
