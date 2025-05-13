
import { useToast as useToastOriginal } from "@/components/ui/use-toast";
import { toast as toastOriginal } from "@/components/ui/use-toast";

export const useToast = useToastOriginal;
export const toast = toastOriginal;

export type { ToastProps, ToastActionElement } from "@radix-ui/react-toast";
