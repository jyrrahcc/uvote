
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
}

export const Spinner = ({ className }: SpinnerProps) => {
  return (
    <Loader className={cn("h-4 w-4 animate-spin", className)} />
  );
};
