import { useCreateHousehold } from "@/api/household/mutations";
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
import { Alert, ScrollView } from "react-native";

type CreateHouseholdFormData = {
  name: string;
  image_url: string;
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
      image_url: "",
    },
  });

  async function onSubmit(data: CreateHouseholdFormData) {
    if (!user) {
      Alert.alert("Error", "You must be logged in to create a household");
      return;
    }

    try {
      await createHousehold({ name: data.name, image_url: data.image_url });
      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create household"
      );
    }
  }

  return (
    <ScrollView
      contentContainerClassName="gap-6"
      className="p-4"
      contentInsetAdjustmentBehavior="automatic"
    >
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
        <Field>
          <FieldLabel>Household Image URL</FieldLabel>
          <Controller
            control={control}
            name="image_url"
            rules={{
              pattern: {
                value: /^https?:\/\/.+/,
                message: "Please enter a valid URL",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="https://example.com/image.jpg"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="url"
                autoCapitalize="none"
              />
            )}
          />
          <FieldDescription>
            Enter an image URL for the household (optional)
          </FieldDescription>
          <FieldError
            errors={errors.image_url ? [errors.image_url] : undefined}
          />
        </Field>
      </FieldGroup>
      <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        <Text>{isSubmitting ? "Creating..." : "Create Household"}</Text>
      </Button>
    </ScrollView>
  );
}
