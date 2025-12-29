import {
  useAddHouseholdUser,
  useRemoveHouseholdUser,
  useUpdateHousehold,
} from "@/api/household/mutations";
import { useHousehold, useHouseholdUsers } from "@/api/household/queries";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { router } from "expo-router";
import { PlusIcon, Trash2Icon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useUniwind } from "uniwind";

type EditHouseholdFormData = {
  name: string;
  image_url: string;
};

export default function EditHousehold() {
  const { householdId } = useHouseholdStore();
  const { user } = useAuthStore();
  const { theme } = useUniwind();
  const { data: household, isLoading: isHouseholdLoading } = useHousehold(
    householdId ?? undefined
  );
  const { data: householdUsers, isLoading: isUsersLoading } = useHouseholdUsers(
    householdId ?? undefined
  );
  const { mutateAsync: updateHousehold } = useUpdateHousehold();
  const { mutateAsync: addHouseholdUser } = useAddHouseholdUser();
  const { mutateAsync: removeHouseholdUser } = useRemoveHouseholdUser();

  const [newUserEmail, setNewUserEmail] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);

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

  async function handleAddUser() {
    if (!householdId || !newUserEmail.trim()) {
      Alert.alert("Error", "Please enter a user ID");
      return;
    }

    setIsAddingUser(true);
    try {
      await addHouseholdUser({
        householdId: householdId,
        email: newUserEmail.trim(),
      });
      setNewUserEmail("");
      Alert.alert("Success", "User added to household");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to add user"
      );
    } finally {
      setIsAddingUser(false);
    }
  }

  async function handleRemoveUser(householdRoleId: string, userId: string) {
    if (!user) {
      Alert.alert("Error", "You must be logged in");
      return;
    }

    if (userId === user.id) {
      Alert.alert("Error", "You cannot remove yourself from the household");
      return;
    }

    Alert.alert(
      "Remove User",
      "Are you sure you want to remove this user from the household?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeHouseholdUser(householdRoleId);
              Alert.alert("Success", "User removed from household");
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error ? error.message : "Failed to remove user"
              );
            }
          },
        },
      ]
    );
  }

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
    <ScrollView className="flex-1">
      <View className="flex-col gap-6 mt-8 px-6 pb-8">
        <Text className="text-2xl font-bold">Edit Household</Text>

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

        <View className="flex-col gap-4">
          <Text className="text-xl font-semibold">Manage Users</Text>

          <Card>
            <CardHeader>
              <CardTitle>Add User</CardTitle>
            </CardHeader>
            <CardContent className="flex-col gap-3">
              <Input
                placeholder="Enter user email"
                value={newUserEmail}
                onChangeText={setNewUserEmail}
                autoCapitalize="none"
              />
              <Button
                onPress={handleAddUser}
                disabled={isAddingUser || !newUserEmail.trim()}
              >
                <Text>{isAddingUser ? "Adding..." : "Add User"}</Text>
                <Icon
                  as={PlusIcon}
                  className="size-4"
                  color={theme === "dark" ? "black" : "white"}
                />
              </Button>
            </CardContent>
          </Card>

          <View className="flex-col gap-2">
            <Text className="text-lg font-medium">Household Members</Text>
            {isUsersLoading ? (
              <View className="py-4">
                <Spinner />
              </View>
            ) : !householdUsers || householdUsers.length === 0 ? (
              <Text className="text-muted-foreground">
                No users in this household
              </Text>
            ) : (
              householdUsers.map((householdUser) => {
                const isCurrentUser = householdUser.user_id === user?.id;
                return (
                  <View
                    className="flex-row items-center gap-3 flex-1"
                    key={householdUser.id}
                  >
                    <Avatar alt={householdUser.user_id}>
                      <AvatarFallback>
                        <Text>
                          {householdUser.user_id.slice(0, 2).toUpperCase()}
                        </Text>
                      </AvatarFallback>
                    </Avatar>
                    <View className="flex-1">
                      <Text className="font-medium">
                        {isCurrentUser ? "You" : "User"}
                      </Text>
                      <Text className="text-sm text-muted-foreground truncate line-clamp-1">
                        Joined on{" "}
                        {new Date(
                          householdUser.created_at
                        ).toLocaleDateString()}
                      </Text>
                    </View>
                    {!isCurrentUser && (
                      <Pressable
                        onPress={() =>
                          handleRemoveUser(
                            householdUser.id,
                            householdUser.user_id
                          )
                        }
                      >
                        <Icon as={Trash2Icon} className="size-4" />
                      </Pressable>
                    )}
                  </View>
                );
              })
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
