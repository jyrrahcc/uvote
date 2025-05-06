
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { toast } from "sonner";

interface AccessCodeInputProps {
  accessCode?: string;
  onVerify: (verified: boolean) => void;
}

const AccessCodeInput = ({ accessCode, onVerify }: AccessCodeInputProps) => {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleVerify = () => {
    setIsVerifying(true);
    
    // Short timeout to simulate verification
    setTimeout(() => {
      // Simple comparison for verification
      if (code === accessCode) {
        onVerify(true);
        
        // Store verified election access in local storage to maintain access across page refreshes
        try {
          const verifiedElections = JSON.parse(localStorage.getItem('verifiedElections') || '{}');
          verifiedElections[accessCode || ''] = true;
          localStorage.setItem('verifiedElections', JSON.stringify(verifiedElections));
        } catch (error) {
          console.error('Error storing verification:', error);
        }
      } else {
        onVerify(false);
        setAttempts(prev => prev + 1);
        
        if (attempts >= 2) {
          toast.error("Too many incorrect attempts. Please check the access code and try again later.");
        } else {
          toast.error("Incorrect access code. Please try again.");
        }
      }
      
      setIsVerifying(false);
    }, 500);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="bg-muted inline-flex p-3 rounded-full mb-3">
          <Lock className="h-6 w-6 text-[#008f50]" />
        </div>
        <h3 className="font-medium">Access Code Required</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Enter the access code provided by the election administrator
        </p>
      </div>
      
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Enter access code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && code.length > 0) {
              handleVerify();
            }
          }}
          className="text-center text-lg tracking-wider"
          autoFocus
          disabled={attempts >= 5 || isVerifying}
        />
        
        {attempts >= 5 ? (
          <p className="text-destructive text-sm text-center">
            Too many incorrect attempts. Please try again later.
          </p>
        ) : (
          <Button 
            className="w-full"
            onClick={handleVerify}
            disabled={code.length === 0 || isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify Access Code"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AccessCodeInput;
