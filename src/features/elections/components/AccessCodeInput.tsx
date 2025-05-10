
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AccessCodeInputProps {
  accessCode: string | null | undefined;
  onVerify: (verified: boolean) => void;
}

const AccessCodeInput = ({ accessCode, onVerify }: AccessCodeInputProps) => {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    setLoading(true);
    setError(false);

    // Add a small delay to simulate verification
    setTimeout(() => {
      if (inputCode === accessCode) {
        onVerify(true);
      } else {
        setError(true);
        onVerify(false);
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="access-code">Enter Access Code</Label>
        <Input
          id="access-code"
          type="text"
          placeholder="Enter the access code"
          value={inputCode}
          onChange={(e) => {
            setInputCode(e.target.value);
            setError(false);
          }}
          className={error ? "border-destructive" : ""}
        />
        {error && (
          <p className="text-sm text-destructive">Invalid access code. Please try again.</p>
        )}
      </div>
      <Button 
        onClick={handleVerify}
        disabled={!inputCode || loading}
        className="w-full"
      >
        {loading ? "Verifying..." : "Verify Code"}
      </Button>
    </div>
  );
};

export default AccessCodeInput;
