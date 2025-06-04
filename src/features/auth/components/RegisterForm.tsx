
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { validateForm } from "../utils/formValidation";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { RegisterFormFields } from "./RegisterFormFields";

/**
 * Enhanced registration form with comprehensive validation and error handling
 */
const RegisterForm = () => {
  const {
    formData,
    showPassword,
    setShowPassword,
    isLoading,
    setIsLoading,
    errors,
    setErrors,
    passwordRequirements,
    handleInputChange,
    handleSubmit,
  } = useRegisterForm();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm(formData, setErrors);
    await handleSubmit(() => isValid);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Register to participate in secure and transparent elections
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {/* Social Login Options */}
          <SocialLoginButtons isLoading={isLoading} setIsLoading={setIsLoading} />
          
          <div className="flex items-center gap-2 my-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          <RegisterFormFields
            formData={formData}
            errors={errors}
            isLoading={isLoading}
            passwordRequirements={passwordRequirements}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onInputChange={handleInputChange}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log In
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegisterForm;
