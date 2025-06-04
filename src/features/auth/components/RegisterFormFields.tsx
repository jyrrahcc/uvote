
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PasswordField } from "./PasswordField";

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  general?: string;
}

interface PasswordRequirements {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
}

interface RegisterFormFieldsProps {
  formData: FormData;
  errors: FormErrors;
  isLoading: boolean;
  passwordRequirements: PasswordRequirements;
  showPassword: boolean;
  onTogglePassword: () => void;
  onInputChange: (field: keyof FormData, value: string) => void;
}

export const RegisterFormFields = ({
  formData,
  errors,
  isLoading,
  passwordRequirements,
  showPassword,
  onTogglePassword,
  onInputChange,
}: RegisterFormFieldsProps) => {
  return (
    <>
      {/* General Error Message */}
      {errors.general && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-destructive text-sm">{errors.general}</p>
        </div>
      )}
      
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => onInputChange("firstName", e.target.value)}
            placeholder="John"
            required
            disabled={isLoading}
            className={cn(errors.firstName && "border-destructive")}
          />
          {errors.firstName && (
            <p className="text-destructive text-sm">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => onInputChange("lastName", e.target.value)}
            placeholder="Doe"
            required
            disabled={isLoading}
            className={cn(errors.lastName && "border-destructive")}
          />
          {errors.lastName && (
            <p className="text-destructive text-sm">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">University Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange("email", e.target.value)}
          placeholder="your.email@dlsud.edu.ph"
          required
          disabled={isLoading}
          autoComplete="email"
          className={cn(errors.email && "border-destructive")}
        />
        {errors.email && (
          <p className="text-destructive text-sm">{errors.email}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Use your university email address for verification
        </p>
      </div>

      {/* Password Field */}
      <PasswordField
        password={formData.password}
        onChange={(value) => onInputChange("password", value)}
        error={errors.password}
        isLoading={isLoading}
        passwordRequirements={passwordRequirements}
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
      />
    </>
  );
};
