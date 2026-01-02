import { KBAScrollView } from "@/components/scroll/kba-scroll-view";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { CircleCheck } from "lucide-react-native";

export default function EmailSentSuccess() {
  return (
    <KBAScrollView>
      <Card className="flex flex-col items-center justify-center gap-4">
        <Icon as={CircleCheck} className="text-green-500" />
        <CardHeader>
          <CardTitle className="text-center">Email Sent!</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification email to your address.
          </CardDescription>
        </CardHeader>
      </Card>
    </KBAScrollView>
  );
}
