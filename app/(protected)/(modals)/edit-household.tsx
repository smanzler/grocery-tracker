import { useCreateHouseholdInvite } from "@/api/household/invites/mutations";
import { useUpdateHousehold } from "@/api/household/mutations";
import { useHousehold } from "@/api/household/queries";
import { HouseholdInvitesList } from "@/components/household/household-invites-list";
import { HouseholdUsersList } from "@/components/household/household-users-list";
import { KBAScrollView } from "@/components/scroll/kba-scroll-view";
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
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { useHouseholdStore } from "@/stores/household-store";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { PlusIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, View } from "react-native";

type EditHouseholdFormData = {
  name: string;
  image_url: string;
};

export default function EditHousehold() {
  const [selectedTab, setSelectedTab] = useState("members");
  const { householdId } = useHouseholdStore();
  const { data: household, isLoading: isHouseholdLoading } = useHousehold(
    householdId ?? undefined
  );
  const { mutateAsync: updateHousehold } = useUpdateHousehold();
  const { mutateAsync: createHouseholdInvite } = useCreateHouseholdInvite();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditHouseholdFormData>({
    defaultValues: {
      name: household?.name ?? "",
      image_url: household?.image_url ?? "",
    },
  });

  // Reset form when household data loads
  useEffect(() => {
    if (household && !isHouseholdLoading) {
      reset({
        name: household.name ?? "",
        image_url: household.image_url ?? "",
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
        image_url: data.image_url || null,
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

  const handleCreateInvite = async () => {
    if (!householdId) {
      Alert.alert("Error", "No household selected");
      return;
    }

    try {
      setSelectedTab("invites");
      const { inviteLink } = await createHouseholdInvite(householdId);
      Alert.alert("Success", "Invite created successfully", [
        {
          text: "Copy",
          onPress: () => {
            Clipboard.setStringAsync(inviteLink);
            Alert.alert("Success", "Invite copied to clipboard");
          },
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create invite"
      );
    }
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
        <Text>{isSubmitting ? "Saving..." : "Save Changes"}</Text>
      </Button>

      <Separator />

      <View className="flex-col gap-2">
        <Text className="text-lg font-bold">Users</Text>
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
            <Pressable onPress={handleCreateInvite}>
              <Icon as={PlusIcon} className="size-4" />
            </Pressable>
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
