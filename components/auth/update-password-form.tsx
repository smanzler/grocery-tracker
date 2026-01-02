import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert } from "react-native";
import { useUniwind } from "uniwind";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";

type UpdatePasswordFormData = {
  password: string;
  confirmPassword: string;
};

export function UpdatePasswordForm() {
  const { theme } = useUniwind();
  const {
    control,
    handleSubmit,
    getValues,
    formState: { isSubmitting, errors },
  } = useForm<UpdatePasswordFormData>();

  const onSubmit = async (data: UpdatePasswordFormData) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      Alert.alert("Success", "Password updated successfully");

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(protected)");
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update password"
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Password</CardTitle>
        <CardDescription>
          Enter your new password to update your password.
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-6">
        <FieldGroup className="gap-6">
          <Field className="gap-1.5">
            <FieldLabel>New Password</FieldLabel>
            <Controller
              control={control}
              name="password"
              rules={{
                required: "New password is required",
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="New Password"
                  textContentType="password"
                  autoComplete="password"
                  autoCapitalize="none"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            <FieldError errors={[errors.password]} />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel>Confirm New Password</FieldLabel>
            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: "Confirm new password is required",
                validate: (value) =>
                  value === getValues("password") || "Passwords do not match",
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Confirm New Password"
                  textContentType="password"
                  autoComplete="password"
                  autoCapitalize="none"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </Field>
          <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? (
              <Spinner color={theme === "dark" ? "black" : "white"} />
            ) : (
              <Text>Update Password</Text>
            )}
          </Button>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
