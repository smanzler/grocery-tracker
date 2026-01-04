import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateColorFromUserId(userId: string): string {
  let hash = 5381;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) + hash + userId.charCodeAt(i);
  }
  const hue = (hash >>> 0) % 360;
  const saturation = 50 + ((hash >>> 8) % 30);
  const lightness = 40 + ((hash >>> 16) % 30);
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}
