import { useUpdateGroceryItem } from "@/api/grocery-item/mutations";
import { useGroceryItem } from "@/api/grocery-item/queries";
import { KBAScrollView } from "@/components/scroll/kba-scroll-view";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ShoppingBasketIcon } from "lucide-react-native";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, View } from "react-native";

type GroceryItemFormData = {
  name: string;
  brand: string;
  categories: string;
  food_groups: string;
};

export default function EditGroceryItem() {
  const { id } = useLocalSearchParams();
  const { data: groceryItem, isLoading } = useGroceryItem(id as string);
  const { mutateAsync: updateGroceryItem, isPending } = useUpdateGroceryItem();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GroceryItemFormData>({
    defaultValues: {
      name: "",
      brand: "",
      categories: "",
      food_groups: "",
    },
  });

  useEffect(() => {
    if (groceryItem) {
      reset({
        name: groceryItem.name ?? "",
        brand: groceryItem.brand ?? "",
        categories: groceryItem.categories ?? "",
        food_groups: groceryItem.food_groups ?? "",
      });
    }
  }, [groceryItem, reset]);

  const onSubmit = async (data: GroceryItemFormData) => {
    try {
      await updateGroceryItem({
        id: id as string,
        name: data.name,
        brand: data.brand || null,
        categories: data.categories || null,
        food_groups: data.food_groups || null,
      });
      Alert.alert("Success", "Grocery item updated successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update grocery item");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Edit Item",
            headerShown: true,
            headerLargeTitleEnabled: true,
          }}
        />
        <View className="flex-1 items-center justify-center">
          <Spinner />
        </View>
      </>
    );
  }

  if (!groceryItem) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Edit Item",
            headerShown: true,
            headerLargeTitleEnabled: true,
          }}
        />
        <Empty>
          <EmptyContent>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon as={ShoppingBasketIcon} />
              </EmptyMedia>
              <EmptyTitle>Grocery item not found</EmptyTitle>
              <EmptyDescription>
                The grocery item you are looking for does not exist.
              </EmptyDescription>
            </EmptyHeader>
          </EmptyContent>
        </Empty>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: groceryItem.name ?? "",
          headerShown: true,
          headerLargeTitleEnabled: true,
        }}
      />
      <KBAScrollView>
        <FieldGroup>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Controller
              control={control}
              name="name"
              rules={{
                required: "Name is required",
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="name"
                  placeholder="Item name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
              )}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field className="gap-1.5">
            <FieldLabel htmlFor="brand">Brand</FieldLabel>
            <Controller
              control={control}
              name="brand"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="brand"
                  placeholder="Brand (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
              )}
            />
            <FieldError errors={[errors.brand]} />
          </Field>

          <Field className="gap-1.5">
            <FieldLabel htmlFor="categories">Categories</FieldLabel>
            <Controller
              control={control}
              name="categories"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="categories"
                  placeholder="Categories (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
              )}
            />
            <FieldError errors={[errors.categories]} />
          </Field>

          <Field className="gap-1.5">
            <FieldLabel htmlFor="food_groups">Food Groups</FieldLabel>
            <Controller
              control={control}
              name="food_groups"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="food_groups"
                  placeholder="Food groups (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
              )}
            />
            <FieldError errors={[errors.food_groups]} />
          </Field>

          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            className="mt-4"
          >
            {isPending ? (
              <Spinner className="text-secondary" />
            ) : (
              <Text>Save Changes</Text>
            )}
          </Button>
        </FieldGroup>
      </KBAScrollView>
    </>
  );
}
