import { SocialConnections } from "@/components/social-connections";
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
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/stores/auth-store";
import { router } from "expo-router";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, type TextInput, View } from "react-native";

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
          Sign in to your app
        </CardTitle>
        <CardDescription className="text-center sm:text-left">
          Welcome back! Please sign in to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-6">
        <View className="gap-6">
          <View className="gap-1.5">
            <Label htmlFor="email">Email</Label>
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
            {errors.email && (
              <Text className="text-destructive text-sm">
                {errors.email.message}
              </Text>
            )}
          </View>
          <View className="gap-1.5">
            <View className="flex-row items-center">
              <Label htmlFor="password">Password</Label>
              <Button
                variant="link"
                size="sm"
                className="web:h-fit ml-auto h-4 px-1 py-0 sm:h-4"
                onPress={() => {
                  // TODO: Navigate to forgot password screen
                }}
              >
                <Text className="font-normal leading-4">
                  Forgot your password?
                </Text>
              </Button>
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
                  id="password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  returnKeyType="send"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />
            {errors.password && (
              <Text className="text-destructive text-sm">
                {errors.password.message}
              </Text>
            )}
          </View>
          <Button
            className="w-full"
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text>{isSubmitting ? "Signing in..." : "Continue"}</Text>
          </Button>
        </View>
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
        <SocialConnections />
      </CardContent>
    </Card>
  );
}
