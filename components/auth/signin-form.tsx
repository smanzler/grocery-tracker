import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/stores/auth-store";
import { router } from "expo-router";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, type TextInput, View } from "react-native";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Separator } from "../ui/separator";
import AppleSignInButton from "./apple-sign-in-button";

type SignInFormData = {
  email: string;
  password: string;
};

export function SignInForm() {
  const { signIn } = useAuthStore();
  const passwordInputRef = React.useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function onSubmit(data: SignInFormData) {
    const { error } = await signIn(data.email, data.password);
    if (error) {
      Alert.alert("Error", error.message);
    }
  }

  return (
    <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5 w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center text-xl sm:text-left">
          Sign in to <Text className="text-xl font-bold">Pantry</Text>
        </CardTitle>
        <CardDescription className="text-center sm:text-left">
          Welcome back! Please sign in to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-6">
        <FieldGroup className="gap-6">
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
            <View className="flex-row items-center">
              <Label htmlFor="password">Password</Label>
              <Pressable
                onPress={() => router.push("/(auth)/forgot-password")}
                className="ml-auto"
              >
                <Text className="text-sm underline underline-offset-4">
                  Forgot your password?
                </Text>
              </Pressable>
            </View>
            <Controller
              control={control}
              name="password"
              rules={{
                required: "Password is required",
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  ref={passwordInputRef}
                  placeholder="Password"
                  id="password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  returnKeyType="send"
                  textContentType="password"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />
            <FieldError errors={[errors.password]} />
          </Field>
          <Button
            className="w-full"
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text>{isSubmitting ? "Signing in..." : "Continue"}</Text>
          </Button>
        </FieldGroup>
        <View className="flex-row items-center justify-center gap-2">
          <Text className="text-center text-sm">
            Don&apos;t have an account?
          </Text>
          <Pressable
            onPress={() => {
              router.replace("/(auth)/sign-up");
            }}
          >
            <Text className="text-sm underline underline-offset-4">
              Sign up
            </Text>
          </Pressable>
        </View>
        <View className="flex-row items-center">
          <Separator className="flex-1" />
          <Text className="text-muted-foreground px-4 text-sm">or</Text>
          <Separator className="flex-1" />
        </View>
        <AppleSignInButton />
      </CardContent>
    </Card>
  );
}
