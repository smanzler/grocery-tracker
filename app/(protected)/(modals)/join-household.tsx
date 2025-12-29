import { useRedeemHouseholdInvite } from "@/api/household/invites/mutations";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { router } from "expo-router";
import { HousePlusIcon } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView } from "react-native";
import { useUniwind } from "uniwind";

type JoinHouseholdFormData = {
  inviteToken: string;
};

export default function JoinHousehold() {
  const { mutateAsync: redeemHouseholdInvite } = useRedeemHouseholdInvite();
  const { selectHousehold } = useHouseholdStore();
  const { user } = useAuthStore();
  const { theme } = useUniwind();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<JoinHouseholdFormData>({
    defaultValues: {
      inviteToken: "",
    },
  });

  async function handleJoinHousehold(data: JoinHouseholdFormData) {
    if (!user) {
      Alert.alert("Error", "You must be logged in to join a household");
      return;
    }

    try {
      const householdId = await redeemHouseholdInvite({
        inviteToken: data.inviteToken,
        userId: user.id,
      });

      router.back();
      setTimeout(() => {
        selectHousehold(householdId);
      }, 0);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to join household"
      );
    }
  }

  return (
    <ScrollView
      className="px-4"
      contentContainerClassName="gap-6 py-4"
      contentInsetAdjustmentBehavior="automatic"
    >
      <FieldGroup>
        <Field>
          <FieldLabel>Invite Code</FieldLabel>
          <Controller
            control={control}
            name="inviteToken"
            rules={{
              required: "Invite code is required",
              minLength: {
                value: 1,
                message: "Invite code must be at least 1 character",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Enter invite code"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          <FieldDescription>
            Enter the invite code to join the household
          </FieldDescription>
          <FieldError
            errors={errors.inviteToken ? [errors.inviteToken] : undefined}
          />
        </Field>
      </FieldGroup>

      <Button
        onPress={handleSubmit(handleJoinHousehold)}
        disabled={isSubmitting}
      >
        <Text>{isSubmitting ? "Joining..." : "Join Household"}</Text>
        <Icon
          as={HousePlusIcon}
          className="size-4"
          color={theme === "dark" ? "black" : "white"}
        />
      </Button>
    </ScrollView>
  );
}
