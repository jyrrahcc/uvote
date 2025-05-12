
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings } from "lucide-react";
import { useState } from "react";
import SettingsTabs from "@/features/settings/components/SettingsTabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const SystemSettings = () => {
  const [resetting, setResetting] = useState(false);

  const resetToDefaults = async () => {
    try {
      setResetting(true);
      
      // Delete all settings
      const { error } = await supabase
        .from("settings")
        .delete()
        .neq("id", "0"); // Dummy condition to delete all
        
      if (error) throw error;
      
      toast.success("Election system settings reset to defaults successfully");
      
      // Reload the page to show default settings
      window.location.reload();
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast.error("Failed to reset settings");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-7 w-7 text-primary" />
          Election System Settings
        </h1>
        <p className="text-muted-foreground">
          Manage system-wide settings and configurations for the DLSU-D voting platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Election System Configuration</CardTitle>
          <CardDescription>
            Configure key parameters for the DLSU-D election and voting system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsTabs />
        </CardContent>
        <CardFooter className="border-t pt-5 flex flex-col sm:flex-row gap-4 sm:justify-between">
          <p className="text-sm text-muted-foreground">
            System settings are applied immediately after saving.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetToDefaults}
            disabled={resetting}
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${resetting ? 'animate-spin' : ''}`} />
            {resetting ? "Resetting..." : "Reset to Defaults"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About DLSU-D uVote</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <h4 className="text-sm font-medium">Institution</h4>
                  <p className="text-sm text-muted-foreground">De La Salle University - Dasmariñas</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Application Version</h4>
                  <p className="text-sm text-muted-foreground">1.0.0</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
