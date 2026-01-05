import { cn, uuidToHex } from "@/lib/utils";
import * as AvatarPrimitive from "@rn-primitives/avatar";
import { Text } from "./text";

function Avatar({
  className,
  ...props
}: AvatarPrimitive.RootProps & React.RefAttributes<AvatarPrimitive.RootRef>) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: AvatarPrimitive.ImageProps & React.RefAttributes<AvatarPrimitive.ImageRef>) {
  return (
    <AvatarPrimitive.Image
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: AvatarPrimitive.FallbackProps &
  React.RefAttributes<AvatarPrimitive.FallbackRef>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "bg-muted flex size-full flex-row items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  );
}

function ColoredFallback({
  className,
  id,
  text,
  textClassName,
  ...props
}: AvatarPrimitive.FallbackProps &
  React.RefAttributes<AvatarPrimitive.FallbackRef> & {
    id: string;
    text: string;
    textClassName?: string;
  }) {
  const color = uuidToHex(id);
  return (
    <AvatarFallback
      className={className}
      style={{ backgroundColor: color + "20" }}
      {...props}
    >
      <Text style={{ color: color }} className={textClassName}>
        {text}
      </Text>
    </AvatarFallback>
  );
}

export { Avatar, AvatarFallback, AvatarImage, ColoredFallback };
