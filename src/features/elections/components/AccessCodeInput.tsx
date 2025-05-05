
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { toast } from "sonner";

interface AccessCodeInputProps {
  accessCode?: string;
  onVerify: (verified: boolean) => void;
}

const AccessCodeInput = ({ accessCode, onVerify }: AccessCodeInputProps) => {
  const [inputCode, setInputCode] = useState("");
  
  const handleVerify = () => {
    if (inputCode === accessCode) {
      onVerify(true);
    } else {
      toast.error("Invalid access code");
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lock className="h-5 w-5 mr-2" />
          Private Election
        </CardTitle>
        <CardDescription>
          This is a private election. Please enter the access code to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder="Enter access code"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleVerify} className="w-full">Verify</Button>
      </CardFooter>
    </Card>
  );
};

export default AccessCodeInput;
