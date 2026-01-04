import { useCreateHouseholdInvite } from "@/api/household/invites/mutations";
import { useUpdateHousehold } from "@/api/household/mutations";
import { useHousehold } from "@/api/household/queries";
import { useSignedImageUrl } from "@/api/images/queries";
import { useEmptyPantry } from "@/api/pantry/mutations";
import { HouseholdInviteDialog } from "@/components/household/household-invite-dialog";
import { HouseholdInvitesList } from "@/components/household/household-invites-list";
import { HouseholdUsersList } from "@/components/household/household-users-list";
import { KBAScrollView } from "@/components/scroll/kba-scroll-view";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { pickImage, uploadImage } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { formatDistanceToNow } from "date-fns";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, View } from "react-native";

type EditHouseholdFormData = {
  name: string;
};

export default function EditHousehold() {
  const [selectedTab, setSelectedTab] = useState("members");
  const { user } = useAuthStore();
  const { householdId } = useHouseholdStore();
  const { data: household, isLoading: isHouseholdLoading } = useHousehold(
    householdId ?? undefined
  );
  const { mutateAsync: updateHousehold } = useUpdateHousehold();

  const { mutateAsync: createHouseholdInvite } = useCreateHouseholdInvite();

  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const { data: signedImageUrl } = useSignedImageUrl(
    "households",
    household?.image_path ?? undefined
  );

  const { mutateAsync: emptyPantry, isPending: isEmptyingPantry } =
    useEmptyPantry(householdId!);

  const handleEmptyPantry = async () => {
    if (!householdId) {
      Alert.alert("Error", "No household selected");
      return;
    }

    try {
      await emptyPantry();
      Alert.alert("Success", "Pantry emptied successfully");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to empty pantry"
      );
    }
  };

  const handleCreateInvite = async () => {
    if (!householdId) {
      Alert.alert("Error", "No household selected");
      return;
    }

    try {
      const { token } = await createHouseholdInvite(householdId);

      const link = Linking.createURL("link-handler", {
        queryParams: { type: "join-household", token },
      });

      console.log(link);

      setInviteLink(link);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create invite"
      );
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditHouseholdFormData>({
    defaultValues: {
      name: household?.name ?? "",
    },
  });

  // Reset form when household data loads
  useEffect(() => {
    if (household && !isHouseholdLoading) {
      reset({
        name: household.name ?? "",
      });
    }
  }, [household, isHouseholdLoading, reset]);

  async function onSubmit(data: EditHouseholdFormData) {
    if (!householdId) {
      Alert.alert("Error", "No household selected");
      return;
    }

    try {
      await updateHousehold({
        id: householdId,
        name: data.name,
      });
      Alert.alert("Success", "Household updated successfully");
      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update household"
      );
    }
  }

  const handleImagePress = async () => {
    if (!user || !householdId) return;

    const image = await pickImage();

    if (!image) {
      Alert.alert("Error", "An error occured fetching the image");
      return;
    }

    const { path, error } = await uploadImage("households", householdId, image);

    if (error || !path) {
      Alert.alert("Error", "An error occured uploading the image");
      return;
    }

    const updateResult = await updateHousehold({
      id: householdId,
      image_path: path,
    });

    if (!updateResult) {
      Alert.alert("Error", "An error occured uploading the image");
      return;
    }

    Alert.alert("Success", "Profile picture uploaded successfully");
  };

  if (isHouseholdLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  if (!household) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-lg">Household not found</Text>
        <Button onPress={() => router.back()} className="mt-4">
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <KBAScrollView contentContainerClassName="gap-12">
      <View className="gap-4">
        <Text variant="h3" className="border-b border-border">
          Information
        </Text>

        <View className="items-center py-6">
          <Pressable onPress={handleImagePress}>
            <Avatar alt={household.name || ""} className="size-24">
              <AvatarImage
                source={{
                  uri: signedImageUrl ?? undefined,
                }}
              />
              <AvatarFallback>
                <Text className="text-2xl">
                  {household.name?.charAt(0).toUpperCase()}
                </Text>
              </AvatarFallback>
            </Avatar>
          </Pressable>
          <Text variant="h4" className="mt-4">
            {household.name}
          </Text>
          <Text variant="muted" className="mt-1">
            Created {formatDistanceToNow(household.created_at)} ago
          </Text>
        </View>
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
          <Text>{isSubmitting ? "Saving..." : "Save Changes"}</Text>
        </Button>
      </View>

      <View className="gap-4">
        <Text variant="h3" className="border-b border-border">
          Pantry
        </Text>
        <Field>
          <FieldLabel>Empty Pantry</FieldLabel>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isEmptyingPantry}>
                <Text>{isEmptyingPantry ? "Emptying..." : "Empty Pantry"}</Text>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Empty Pantry</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to empty your pantry? This will remove
                  all items from your household's pantry and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Text>Cancel</Text>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    variant="destructive"
                    onPress={handleEmptyPantry}
                    disabled={isEmptyingPantry}
                  >
                    <Text>
                      {isEmptyingPantry ? "Emptying..." : "Empty Pantry"}
                    </Text>
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <FieldDescription>
            This will remove all items from your household's pantry.
          </FieldDescription>
        </Field>
      </View>

      <View className="gap-4">
        <Text variant="h3" className="border-b border-border">
          Members & Invites
        </Text>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <View className="flex-row items-center gap-2 justify-between">
            <TabsList>
              <TabsTrigger value="members">
                <Text>Members</Text>
              </TabsTrigger>
              <TabsTrigger value="invites">
                <Text>Invites</Text>
              </TabsTrigger>
            </TabsList>
            <HouseholdInviteDialog
              inviteLink={inviteLink}
              setInviteLink={setInviteLink}
            >
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onPress={handleCreateInvite}
              >
                <Icon as={Plus} />
              </Button>
            </HouseholdInviteDialog>
          </View>
          <TabsContent className="mt-4" value="members">
            <HouseholdUsersList />
          </TabsContent>

          <TabsContent className="mt-4" value="invites">
            <HouseholdInvitesList />
          </TabsContent>
        </Tabs>
      </View>
    </KBAScrollView>
  );
}
