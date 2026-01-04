import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { Database } from "./database.types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Supabase URL or publishable key is not set");
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const requestCameraPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === "granted";
};

export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === "granted";
};

export const pickImage = async (): Promise<string | null> => {
  const hasPermission = await requestMediaLibraryPermissions();

  if (!hasPermission) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    base64: true,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    return result.assets[0].base64 || null;
  }

  return null;
};

export const takePhoto = async (): Promise<string | null> => {
  const hasPermission = await requestCameraPermissions();

  if (!hasPermission) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    base64: true,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    return result.assets[0].base64 || null;
  }

  return null;
};

export const uploadImage = async (
  bucket: string,
  path: string,
  base64: string
): Promise<ImageUploadResult> => {
  try {
    const fileName = `${path}/${Date.now()}.jpg`;
    const filePath = fileName;

    const arrayBuffer = decode(base64);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, arrayBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image",
    };
  }
};
