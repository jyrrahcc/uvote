
import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Loader = ({ size = "md", className }: LoaderProps) => {
  const sizeClass =
    size === "sm"
      ? "h-4 w-4"
      : size === "lg"
      ? "h-8 w-8"
      : "h-6 w-6";

  return (
    <Loader2 className={cn(`animate-spin ${sizeClass}`, className)} />
  );
};
