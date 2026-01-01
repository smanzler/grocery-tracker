import { useRedeemHouseholdInvite } from "@/api/household/invites/mutations";
import { useHouseholdInfoFromInviteToken } from "@/api/household/invites/queries";
import { KBAScrollView } from "@/components/scroll/kba-scroll-view";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Text } from "@/components/ui/text";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuthStore } from "@/stores/auth-store";
import { useHouseholdStore } from "@/stores/household-store";
import { useIntentStore } from "@/stores/intent-store";
import { router } from "expo-router";
import { HousePlusIcon } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { useUniwind } from "uniwind";

type JoinHouseholdFormData = {
  inviteToken: string;
};

export default function JoinHousehold() {
  const { mutateAsync: redeemHouseholdInvite } = useRedeemHouseholdInvite();
  const { selectHousehold } = useHouseholdStore();
  const { user } = useAuthStore();
  const { theme } = useUniwind();
  const { pendingIntent, clearIntent } = useIntentStore();

  const [tokenFromIntent, setTokenFromIntent] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<JoinHouseholdFormData>({
    defaultValues: {
      inviteToken: "",
    },
    mode: "onChange",
  });

  const inviteToken = watch("inviteToken");
  const debouncedToken = useDebounce(inviteToken, 500);
  const queryToken = useMemo(() => {
    if (tokenFromIntent && inviteToken === tokenFromIntent) {
      return inviteToken;
    }
    return debouncedToken;
  }, [tokenFromIntent, inviteToken, debouncedToken]);

  // Query to get household info from invite token
  const {
    data: householdInfo,
    isLoading: isLoadingHouseholdInfo,
    error: householdInfoError,
  } = useHouseholdInfoFromInviteToken(queryToken || undefined);

  const isDebouncing = useMemo(() => {
    return debouncedToken !== inviteToken;
  }, [debouncedToken, inviteToken]);

  // Set field error when household info query fails
  useEffect(() => {
    if (householdInfoError && queryToken) {
      setError("inviteToken", {
        type: "manual",
        message:
          householdInfoError instanceof Error
            ? householdInfoError.message
            : "Invalid invite code",
      });
    }
  }, [householdInfoError, queryToken, setError]);

  useEffect(() => {
    if (pendingIntent?.type === "join-household" && pendingIntent.token) {
      setValue("inviteToken", pendingIntent.token, { shouldValidate: true });
      setTokenFromIntent(pendingIntent.token);
      clearIntent();
    }
  }, [pendingIntent, setValue, clearIntent]);

  useEffect(() => {
    if (tokenFromIntent && inviteToken !== tokenFromIntent) {
      setTokenFromIntent(null);
    }
  }, [inviteToken, tokenFromIntent]);

  async function handleJoinHousehold(data: JoinHouseholdFormData) {
    if (!user) {
      setError("inviteToken", {
        type: "manual",
        message: "You must be logged in to join a household",
      });
      return;
    }

    try {
      const householdId = await redeemHouseholdInvite({
        inviteToken: data.inviteToken.trim(),
        userId: user.id,
      });

      reset();
      router.back();
      setTimeout(() => {
        selectHousehold(householdId);
      }, 0);
    } catch (error) {
      setError("inviteToken", {
        type: "manual",
        message:
          error instanceof Error
            ? error.message
            : "Failed to join household. Please check your invite code.",
      });
    }
  }

  return (
    <KBAScrollView>
      <FieldGroup>
        <Field>
          <FieldLabel>Invite Code</FieldLabel>
          <View className="w-full">
            <Controller
              control={control}
              name="inviteToken"
              rules={{
                required: "Invite code is required",
                minLength: {
                  value: 1,
                  message: "Invite code must be at least 1 character",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter invite code"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!tokenFromIntent}
                  className="pr-10"
                />
              )}
            />
            {(isDebouncing || isLoadingHouseholdInfo) && (
              <View className="absolute right-0 top-0 bottom-0 justify-center p-2">
                <Spinner className="size-4" />
              </View>
            )}
          </View>
          <FieldDescription>
            Enter the invite code to join the household
          </FieldDescription>
          <FieldError
            errors={errors.inviteToken ? [errors.inviteToken] : undefined}
          />
        </Field>
      </FieldGroup>

      {queryToken && householdInfo && !isLoadingHouseholdInfo && (
        <Card>
          <CardHeader>
            <CardTitle>{householdInfo.household_name || "Household"}</CardTitle>
            <CardDescription>
              {householdInfo.is_already_member
                ? "You're already a member of this household"
                : `Invited by ${householdInfo.creator_display_name}`}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Button
        onPress={handleSubmit(handleJoinHousehold)}
        disabled={
          isSubmitting ||
          !inviteToken.trim() ||
          !!errors.inviteToken ||
          isLoadingHouseholdInfo ||
          isDebouncing ||
          householdInfo?.is_already_member
        }
      >
        <Text>{isSubmitting ? "Joining..." : "Join Household"}</Text>
        <Icon
          as={HousePlusIcon}
          className="size-4"
          color={theme === "dark" ? "black" : "white"}
        />
      </Button>
    </KBAScrollView>
  );
}
