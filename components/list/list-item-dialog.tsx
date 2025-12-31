import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Text } from "@/components/ui/text";
import { Tables } from "@/lib/database.types";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Dimensions } from "react-native";
import { Input } from "../ui/input";

const WIDTH = Dimensions.get("window").width - 32;

export type ListItemFormData = {
  groceryItemId: string;
  quantity: string;
};

export const ListItemDialog = ({
  children,
  item,
  onSubmit,
}: {
  children: React.ReactNode;
  item?: Tables<"list_items">;
  onSubmit: (data: ListItemFormData) => Promise<void>;
}) => {
  const [open, setOpen] = React.useState(false);
  const isEditMode = !!item;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ListItemFormData>({
    defaultValues: {
      groceryItemId: "",
      quantity: "1",
    },
  });

  React.useEffect(() => {
    if (item) {
      reset({
        groceryItemId: item.grocery_item_id ?? "",
        quantity: item.quantity?.toString() ?? "",
      });
    } else {
      reset({
        groceryItemId: "",
        quantity: "1",
      });
    }
  }, [item, reset]);

  const handleFormSubmit = async (data: ListItemFormData) => {
    await onSubmit(data);

    if (!isEditMode) {
      reset({
        groceryItemId: "",
        quantity: "1",
      });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent style={{ width: WIDTH < 800 ? WIDTH : undefined }}>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Item" : "Add Item"}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <Text>
            {isEditMode
              ? "Update the item in your grocery list"
              : "Add an item to your grocery list"}
          </Text>
        </DialogDescription>

        <FieldGroup>
          <Field>
            <FieldContent>
              <FieldLabel>Item Name</FieldLabel>
              <Controller
                control={control}
                name="groceryItemId"
                rules={{ required: "Item name is required" }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleSubmit(handleFormSubmit)}
                    placeholder="Item name"
                    autoFocus
                  />
                )}
              />
              <FieldError
                errors={
                  errors.groceryItemId ? [errors.groceryItemId] : undefined
                }
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldContent>
              <FieldLabel>Quantity</FieldLabel>
              <Controller
                control={control}
                name="quantity"
                rules={{ required: "Quantity is required" }}
                defaultValue="1"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleSubmit(handleFormSubmit)}
                    placeholder="Quantity"
                    keyboardType="numeric"
                  />
                )}
              />
            </FieldContent>
          </Field>
        </FieldGroup>
        <Button onPress={handleSubmit(handleFormSubmit)}>
          <Text>{isEditMode ? "Update Item" : "Add Item"}</Text>
        </Button>
      </DialogContent>
    </Dialog>
  );
};
