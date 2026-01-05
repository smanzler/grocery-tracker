import { useUpdateProfile } from "@/api/profile/mutations";
import { useProfile } from "@/api/profile/queries";
import { KBAScrollView } from "@/components/scroll/kba-scroll-view";
import { Avatar, AvatarImage, ColoredFallback } from "@/components/ui/avatar";
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
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { pickImage, uploadImage } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { router } from "expo-router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, View } from "react-native";

type ProfileFormData = {
  display_name: string;
  username: string;
};

export default function Profile() {
  const { user } = useAuthStore();
  const { data: profile, isLoading: isProfileLoading } = useProfile(
    user?.id ?? undefined
  );
  const { mutateAsync: updateProfile } = useUpdateProfile();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      display_name: profile?.display_name ?? "",
      username: profile?.username ?? "",
    },
  });

  useEffect(() => {
    if (profile && !isProfileLoading) {
      reset({
        display_name: profile.display_name ?? "",
        username: profile.username ?? "",
      });
    }
  }, [profile, isProfileLoading, reset]);

  async function onSubmit(data: ProfileFormData) {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to update your profile");
      return;
    }

    try {
      await updateProfile({
        id: user.id,
        display_name: data.display_name || null,
        username: data.username || null,
      });
      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update profile"
      );
    }
  }

  const handleImagePress = async () => {
    if (!user) return;

    const image = await pickImage();

    if (!image) {
      Alert.alert("Error", "An error occured fetching the image");
      return;
    }

    const { url, error } = await uploadImage("avatars", user.id, image);

    if (error || !url) {
      Alert.alert("Error", "An error occured uploading the image");
      return;
    }

    const updateResult = await updateProfile({
      id: user.id,
      image_url: url,
    });

    if (!updateResult) {
      Alert.alert("Error", "An error occured uploading the image");
      return;
    }

    Alert.alert("Success", "Profile picture uploaded successfully");
  };

  if (isProfileLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text variant="large">You must be logged in to view your profile</Text>
        <Button onPress={() => router.back()} className="mt-4">
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <KBAScrollView>
      <View className="items-center py-6">
        <Pressable onPress={handleImagePress}>
          <Avatar alt={user.email ?? ""} className="size-24">
            <AvatarImage
              source={{
                uri: profile?.image_url ?? user.user_metadata.avatar_url,
              }}
            />
            <ColoredFallback
              id={user.id}
              text={user.email?.charAt(0).toUpperCase() ?? "U"}
              textClassName="text-xl"
            />
          </Avatar>
        </Pressable>
        <Text variant="h4" className="mt-4">
          {profile?.display_name ||
            user.user_metadata.display_name ||
            user.email}
        </Text>
        <Text variant="muted" className="mt-1">
          {user.email}
        </Text>
      </View>

      <Separator />

      <FieldGroup>
        <Field>
          <FieldLabel>Display Name</FieldLabel>
          <Controller
            control={control}
            name="display_name"
            rules={{
              maxLength: {
                value: 50,
                message: "Display name must be less than 50 characters",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Your display name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
              />
            )}
          />
          <FieldDescription>
            This is how your name will appear to other users
          </FieldDescription>
          <FieldError
            errors={errors.display_name ? [errors.display_name] : undefined}
          />
        </Field>

        <Field>
          <FieldLabel>Username</FieldLabel>
          <Controller
            control={control}
            name="username"
            rules={{
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message:
                  "Username can only contain letters, numbers, and underscores",
              },
              maxLength: {
                value: 30,
                message: "Username must be less than 30 characters",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="username"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />
          <FieldDescription>
            A unique username for your account (optional)
          </FieldDescription>
          <FieldError
            errors={errors.username ? [errors.username] : undefined}
          />
        </Field>
      </FieldGroup>

      <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        <Text>{isSubmitting ? "Saving..." : "Save Changes"}</Text>
      </Button>
    </KBAScrollView>
  );
}
