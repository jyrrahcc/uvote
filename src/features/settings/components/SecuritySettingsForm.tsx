
import { useState, useEffect } from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface SecuritySettings {
  requireAccessCodesForPrivateElections: boolean;
  enableIpAddressVoting: boolean;
  maxLoginAttempts: number;
  voterVerificationRequired: boolean;
}

const SecuritySettingsForm = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const form = useForm<SecuritySettings>({
    defaultValues: {
      requireAccessCodesForPrivateElections: true,
      enableIpAddressVoting: false,
      maxLoginAttempts: 5,
      voterVerificationRequired: true,
    }
  });
  
  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("settings")
          .select("*")
          .eq("category", "security")
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          const settingsValue = typeof data.settings_value === 'string' 
            ? JSON.parse(data.settings_value) 
            : data.settings_value;
            
          form.reset({
            requireAccessCodesForPrivateElections: settingsValue.requireAccessCodesForPrivateElections ?? true,
            enableIpAddressVoting: settingsValue.enableIpAddressVoting ?? false,
            maxLoginAttempts: settingsValue.maxLoginAttempts ?? 5,
            voterVerificationRequired: settingsValue.voterVerificationRequired ?? true
          });
        }
      } catch (error) {
        console.error("Failed to load security settings:", error);
        toast.error("Failed to load security settings");
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [form]);
  
  // Save settings to database
  const onSubmit = async (values: SecuritySettings) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("settings")
        .upsert({
          category: "security",
          settings_value: JSON.stringify(values) // Convert to string for JSON compatibility
        }, {
          onConflict: "category"
        });
        
      if (error) throw error;
      
      toast.success("Security settings saved successfully");
    } catch (error) {
      console.error("Failed to save security settings:", error);
      toast.error("Failed to save security settings");
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="requireAccessCodesForPrivateElections"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Require Access Codes
                      </FormLabel>
                      <FormDescription>
                        When enabled, private elections require access codes for participation
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="enableIpAddressVoting"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable IP Address Voting Restrictions
                      </FormLabel>
                      <FormDescription>
                        When enabled, limits votes per IP address to prevent duplicate voting
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxLoginAttempts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Login Attempts</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        min={1}
                        max={10}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of login attempts before account lockout
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="voterVerificationRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Require Voter Verification
                      </FormLabel>
                      <FormDescription>
                        When enabled, voters must be verified before they can vote in any election
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SecuritySettingsForm;
