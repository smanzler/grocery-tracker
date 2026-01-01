import { KBAScrollView } from "@/components/scroll/kba-scroll-view";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, View } from "react-native";

type EmailFormData = {
  email: string;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function AccountSettings() {
  const { user, deleteAccount } = useAuthStore();
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const emailForm = useForm<EmailFormData>({
    defaultValues: {
      email: user?.email ?? "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleChangeEmail = async (data: EmailFormData) => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to change your email");
      return;
    }

    if (data.email === user.email) {
      Alert.alert("Info", "This is already your current email address");
      return;
    }

    setIsChangingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: data.email,
      });

      if (error) throw error;

      Alert.alert(
        "Email Change Requested",
        "Please check your new email address for a confirmation link to complete the change."
      );
      emailForm.reset({ email: user.email ?? "" });
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to change email"
      );
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleChangePassword = async (data: PasswordFormData) => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to change your password");
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    if (data.newPassword.length < 6) {
      passwordForm.setError("newPassword", {
        type: "manual",
        message: "Password must be at least 6 characters",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email ?? "",
        password: data.currentPassword,
      });

      if (signInError) {
        passwordForm.setError("currentPassword", {
          type: "manual",
          message: "Current password is incorrect",
        });
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      Alert.alert("Success", "Password changed successfully");
      passwordForm.reset();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to change password"
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
  };

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text variant="large">
          You must be logged in to view account settings
        </Text>
        <Button onPress={() => router.back()} className="mt-4">
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  const accountCreatedAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "Unknown";

  return (
    <KBAScrollView contentContainerClassName="gap-12">
      <View className="gap-4">
        <View className="gap-4">
          <Text variant="h3" className="border-b border-border">
            Account Information
          </Text>
          <View className="gap-4">
            <View>
              <Text variant="small" className="text-muted-foreground">
                Email
              </Text>
              <Text className="mt-1">{user.email}</Text>
            </View>
            <View>
              <Text variant="small" className="text-muted-foreground">
                Account Created
              </Text>
              <Text className="mt-1">{accountCreatedAt}</Text>
            </View>
          </View>
        </View>

        <Separator />

        <FieldGroup>
          <Text variant="large">Change Email</Text>
          <Field>
            <FieldLabel>New Email Address</FieldLabel>
            <Controller
              control={emailForm.control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email address",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="new@example.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />
            <FieldDescription>
              Enter your new email address. You'll receive a confirmation email.
            </FieldDescription>
            <FieldError
              errors={
                emailForm.formState.errors.email
                  ? [emailForm.formState.errors.email]
                  : undefined
              }
            />
          </Field>
          <Button
            onPress={emailForm.handleSubmit(handleChangeEmail)}
            disabled={isChangingEmail}
          >
            <Text>{isChangingEmail ? "Changing..." : "Change Email"}</Text>
          </Button>
        </FieldGroup>

        <Separator />

        <FieldGroup>
          <Text variant="large">Change Password</Text>
          <Field>
            <FieldLabel>Current Password</FieldLabel>
            <Controller
              control={passwordForm.control}
              name="currentPassword"
              rules={{
                required: "Current password is required",
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter current password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />
            <FieldError
              errors={
                passwordForm.formState.errors.currentPassword
                  ? [passwordForm.formState.errors.currentPassword]
                  : undefined
              }
            />
          </Field>
          <Field>
            <FieldLabel>New Password</FieldLabel>
            <Controller
              control={passwordForm.control}
              name="newPassword"
              rules={{
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter new password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />
            <FieldDescription>
              Password must be at least 6 characters long
            </FieldDescription>
            <FieldError
              errors={
                passwordForm.formState.errors.newPassword
                  ? [passwordForm.formState.errors.newPassword]
                  : undefined
              }
            />
          </Field>
          <Field>
            <FieldLabel>Confirm New Password</FieldLabel>
            <Controller
              control={passwordForm.control}
              name="confirmPassword"
              rules={{
                required: "Please confirm your new password",
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Confirm new password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />
            <FieldError
              errors={
                passwordForm.formState.errors.confirmPassword
                  ? [passwordForm.formState.errors.confirmPassword]
                  : undefined
              }
            />
          </Field>
          <Button
            onPress={passwordForm.handleSubmit(handleChangePassword)}
            disabled={isChangingPassword}
          >
            <Text>
              {isChangingPassword ? "Changing..." : "Change Password"}
            </Text>
          </Button>
        </FieldGroup>
      </View>

      <View className="gap-4">
        <Text variant="h3" className="border-b border-border">
          Preferences
        </Text>
        <Text variant="muted">App preferences and settings</Text>
        <Text variant="muted">
          Preferences and notification settings will be available in a future
          update.
        </Text>
      </View>

      <View className="gap-4">
        <Text variant="h3" className="border-b border-border">
          Danger Zone
        </Text>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Text>Delete Account</Text>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete your account? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Text>Cancel</Text>
              </AlertDialogCancel>
              <Button onPress={handleDeleteAccount} variant="destructive">
                <Text>Delete</Text>
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </View>
    </KBAScrollView>
  );
}
