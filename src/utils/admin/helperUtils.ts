
import { ReactNode } from "react";
import { toast } from "sonner";

/**
 * Generate a random access code for private elections
 */
export const generateAccessCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create custom toast notifications
export const notifySuccess = (message: ReactNode) => {
  toast(message);
};

export const notifyError = (message: ReactNode) => {
  toast(message);
};

export const notifyInfo = (message: ReactNode) => {
  toast(message);
};

export const notifyWarning = (message: ReactNode) => {
  toast(message);
};
