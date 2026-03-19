import { cn } from "@/lib/utils";

export function Icon({
  name,
  filled,
  className,
  size,
}: {
  name: string;
  filled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClasses = {
    sm: "text-[18px]",
    md: "text-[24px]",
    lg: "text-[28px]",
    xl: "text-[32px]",
  };

  return (
    <span
      className={cn(
        "material-symbols-outlined select-none",
        filled && "filled",
        size && sizeClasses[size],
        className
      )}
    >
      {name}
    </span>
  );
}
