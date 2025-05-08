
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const securityFormSchema = z.object({
  requireVerification: z.boolean(),
  maxLoginAttempts: z.string().min(1),
  allowSelfRegistration: z.boolean(),
  allowPasswordReset: z.boolean(),
  sessionTimeout: z.string().min(1)
});

type SecurityFormValues = z.infer<typeof securityFormSchema>;

const SecuritySettingsForm = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    requireVerification: true,
    maxLoginAttempts: "5",
    allowSelfRegistration: true,
    allowPasswordReset: true,
    sessionTimeout: "30"
  });
  
  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: settings,
  });

  // Load settings from database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("settings")
          .select("*")
          .eq("category", "security")
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          const parsedSettings = JSON.parse(data.settings_value as string);
          setSettings({
            requireVerification: parsedSettings.requireVerification ?? settings.requireVerification,
            maxLoginAttempts: parsedSettings.maxLoginAttempts || settings.maxLoginAttempts,
            allowSelfRegistration: parsedSettings.allowSelfRegistration ?? settings.allowSelfRegistration,
            allowPasswordReset: parsedSettings.allowPasswordReset ?? settings.allowPasswordReset,
            sessionTimeout: parsedSettings.sessionTimeout || settings.sessionTimeout,
          });
          
          form.reset({
            requireVerification: parsedSettings.requireVerification ?? settings.requireVerification,
            maxLoginAttempts: parsedSettings.maxLoginAttempts || settings.maxLoginAttempts,
            allowSelfRegistration: parsedSettings.allowSelfRegistration ?? settings.allowSelfRegistration,
            allowPasswordReset: parsedSettings.allowPasswordReset ?? settings.allowPasswordReset,
            sessionTimeout: parsedSettings.sessionTimeout || settings.sessionTimeout,
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  async function onSubmit(data: SecurityFormValues) {
    try {
      setLoading(true);
      
      // Save settings to database
      const { error } = await supabase
        .from("settings")
        .upsert({
          category: "security",
          settings_value: JSON.stringify(data),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'category'
        });
        
      if (error) throw error;
      
      toast.success("Security settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="requireVerification"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Email Verification
                  </FormLabel>
                  <FormDescription>
                    Require users to verify their email before they can log in.
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
            name="allowSelfRegistration"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Self Registration
                  </FormLabel>
                  <FormDescription>
                    Allow users to register accounts themselves.
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
            name="allowPasswordReset"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Password Reset
                  </FormLabel>
                  <FormDescription>
                    Allow users to reset their passwords.
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
          
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="maxLoginAttempts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Login Attempts</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="10" {...field} />
                  </FormControl>
                  <FormDescription>
                    Maximum failed login attempts before lockout.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sessionTimeout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Timeout (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" min="5" {...field} />
                  </FormControl>
                  <FormDescription>
                    How long until users are automatically logged out.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
          <Lock className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save Security Settings"}
        </Button>
      </form>
    </Form>
  );
};

export default SecuritySettingsForm;
