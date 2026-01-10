import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/stores/auth-store";
import { router } from "expo-router";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, TextInput, View } from "react-native";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";

type SignUpFormData = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function SignUpForm() {
  const { signUp } = useAuthStore();
  const passwordInputRef = React.useRef<TextInput>(null);
  const confirmPasswordInputRef = React.useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  function onPasswordSubmitEditing() {
    confirmPasswordInputRef.current?.focus();
  }

  async function onSubmit(data: SignUpFormData) {
    const { error } = await signUp(data.displayName, data.email, data.password);
    if (error) {
      Alert.alert("Error", error.message);
    }

    router.replace("/(auth)/email-sent-success");
  }

  return (
    <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5 w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center text-xl sm:text-left">
          Create your account
        </CardTitle>
        <CardDescription className="text-center sm:text-left">
          Welcome! Please fill in the details to get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="displayName">Display Name</FieldLabel>
            <Controller
              control={control}
              name="displayName"
              rules={{
                required: "Display name is required",
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="displayName"
                  placeholder="John Doe"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            <FieldError errors={[errors.displayName]} />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="email"
                  placeholder="m@example.com"
                  keyboardType="email-address"
                  autoComplete="email"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={onEmailSubmitEditing}
                  returnKeyType="next"
                  submitBehavior="submit"
                />
              )}
            />
            <FieldError errors={[errors.email]} />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Controller
              control={control}
              name="password"
              rules={{
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  ref={passwordInputRef}
                  id="password"
                  placeholder="Password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  returnKeyType="next"
                  onSubmitEditing={onPasswordSubmitEditing}
                  autoComplete="password"
                  textContentType="password"
                />
              )}
            />
            {errors.password && <FieldError errors={[errors.password]} />}
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  ref={confirmPasswordInputRef}
                  id="confirmPassword"
                  placeholder="Confirm Password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  returnKeyType="send"
                  onSubmitEditing={handleSubmit(onSubmit)}
                  autoComplete="password"
                  textContentType="password"
                />
              )}
            />
            {errors.confirmPassword && (
              <Text className="text-destructive text-sm">
                {errors.confirmPassword.message}
              </Text>
            )}
          </Field>
          <Button
            className="w-full"
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text>{isSubmitting ? "Creating account..." : "Continue"}</Text>
          </Button>
        </FieldGroup>

        <View className="flex-row items-center justify-center gap-2">
          <Text className="text-center text-sm">Already have an account?</Text>
          <Pressable
            onPress={() => {
              router.replace("/(auth)");
            }}
          >
            <Text className="text-sm underline underline-offset-4">
              Sign in
            </Text>
          </Pressable>
        </View>

        {/* <View className="flex-row items-center">
          <Separator className="flex-1" />
          <Text className="text-muted-foreground px-4 text-sm">or</Text>
          <Separator className="flex-1" />
        </View>
        <SocialConnections /> */}
      </CardContent>
    </Card>
  );
}
