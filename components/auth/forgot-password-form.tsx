import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, View } from "react-native";
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

type ForgotPasswordFormData = {
  email: string;
};

export function ForgotPasswordForm() {
  const { theme } = useUniwind();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async ({ email }: ForgotPasswordFormData) => {
    const link = Linking.createURL("link-handler");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: link,
    });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    router.replace("/(auth)/email-sent-success");
  };

  const handleBackToSignIn = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-6">
        <FieldGroup className="gap-6">
          <Field className="gap-1.5">
            <FieldLabel>Email</FieldLabel>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            <FieldError errors={[errors.email]} />
          </Field>
          <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? (
              <Spinner color={theme === "dark" ? "black" : "white"} />
            ) : (
              <Text>Reset Password</Text>
            )}
          </Button>
        </FieldGroup>
        <View className="flex-row items-center justify-center gap-2">
          <Text className="text-center text-sm">Back to sign in?</Text>
          <Pressable onPress={handleBackToSignIn}>
            <Text className="text-sm underline underline-offset-4">
              Sign in
            </Text>
          </Pressable>
        </View>
      </CardContent>
    </Card>
  );
}
