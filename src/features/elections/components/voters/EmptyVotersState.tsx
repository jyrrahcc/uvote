
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

const EmptyVotersState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <UserPlus className="h-12 w-12 mb-2 text-[#008f50] opacity-50" />
      <h3 className="text-lg font-medium mb-1">No voters configured</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        All registered users will be able to vote in this election. 
        You can manage voter access per election in the admin dashboard.
      </p>
    </div>
  );
};

export default EmptyVotersState;
