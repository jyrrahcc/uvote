
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordRequirements {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
}

interface PasswordFieldProps {
  password: string;
  onChange: (value: string) => void;
  error?: string;
  isLoading: boolean;
  passwordRequirements: PasswordRequirements;
  showPassword: boolean;
  onTogglePassword: () => void;
}

const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
  <div className={cn("flex items-center gap-2 text-sm", met ? "text-green-600" : "text-gray-500")}>
    {met ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
    <span>{text}</span>
  </div>
);

export const PasswordField = ({
  password,
  onChange,
  error,
  isLoading,
  passwordRequirements,
  showPassword,
  onTogglePassword,
}: PasswordFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => onChange(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="new-password"
          className={cn(error && "border-destructive", "pr-10")}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={onTogglePassword}
          disabled={isLoading}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
      
      {/* Password Requirements */}
      {password && (
        <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium text-muted-foreground">Password Requirements:</p>
          <RequirementItem met={passwordRequirements.length} text="At least 8 characters" />
          <RequirementItem met={passwordRequirements.uppercase} text="One uppercase letter" />
          <RequirementItem met={passwordRequirements.lowercase} text="One lowercase letter" />
          <RequirementItem met={passwordRequirements.number} text="One number" />
        </div>
      )}
    </div>
  );
};
