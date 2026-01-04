import { useCreateHousehold } from "@/api/household/mutations";
import { KBAScrollView } from "@/components/scroll/kba-scroll-view";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/stores/auth-store";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert } from "react-native";

type CreateHouseholdFormData = {
  name: string;
};

export default function CreateHousehold() {
  const { mutateAsync: createHousehold } = useCreateHousehold();
  const { user } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateHouseholdFormData>({
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(data: CreateHouseholdFormData) {
    if (!user) {
      Alert.alert("Error", "You must be logged in to create a household");
      return;
    }

    try {
      await createHousehold({ name: data.name });
      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create household"
      );
    }
  }

  return (
    <KBAScrollView>
      <FieldGroup>
        <Field>
          <FieldLabel>Household Name</FieldLabel>
          <Controller
            control={control}
            name="name"
            rules={{
              required: "Household name is required",
              minLength: {
                value: 1,
                message: "Household name must be at least 1 character",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="My Household"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
              />
            )}
          />
          <FieldDescription>Enter the name of the household</FieldDescription>
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>
      </FieldGroup>
      <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        <Text>{isSubmitting ? "Creating..." : "Create Household"}</Text>
      </Button>
    </KBAScrollView>
  );
}
