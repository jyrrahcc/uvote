
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  newUserNotification: z.boolean(),
  newElectionNotification: z.boolean(),
  completedElectionNotification: z.boolean(),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

const NotificationSettingsForm = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    newUserNotification: true,
    newElectionNotification: true,
    completedElectionNotification: true,
  });
  
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
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
          .eq("category", "notifications")
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          const parsedSettings = JSON.parse(data.settings_value);
          setSettings({
            emailNotifications: parsedSettings.emailNotifications ?? settings.emailNotifications,
            newUserNotification: parsedSettings.newUserNotification ?? settings.newUserNotification,
            newElectionNotification: parsedSettings.newElectionNotification ?? settings.newElectionNotification,
            completedElectionNotification: parsedSettings.completedElectionNotification ?? settings.completedElectionNotification,
          });
          
          form.reset({
            emailNotifications: parsedSettings.emailNotifications ?? settings.emailNotifications,
            newUserNotification: parsedSettings.newUserNotification ?? settings.newUserNotification,
            newElectionNotification: parsedSettings.newElectionNotification ?? settings.newElectionNotification,
            completedElectionNotification: parsedSettings.completedElectionNotification ?? settings.completedElectionNotification,
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

  async function onSubmit(data: NotificationFormValues) {
    try {
      setLoading(true);
      
      // Save settings to database
      const { error } = await supabase
        .from("settings")
        .upsert({
          category: "notifications",
          settings_value: JSON.stringify(data),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'category'
        });
        
      if (error) throw error;
      
      toast.success("Notification settings saved successfully");
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
            name="emailNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Email Notifications
                  </FormLabel>
                  <FormDescription>
                    Enable system-wide email notifications.
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
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Notification Events</h3>
            
            <FormField
              control={form.control}
              name="newUserNotification"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!form.watch("emailNotifications")}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      New User Registration
                    </FormLabel>
                    <FormDescription>
                      Notify administrators when a new user registers.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="newElectionNotification"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!form.watch("emailNotifications")}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      New Election Created
                    </FormLabel>
                    <FormDescription>
                      Notify users when a new election is created.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="completedElectionNotification"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!form.watch("emailNotifications")}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Election Completed
                    </FormLabel>
                    <FormDescription>
                      Notify users when an election they participated in is completed.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
          <Mail className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save Notification Settings"}
        </Button>
      </form>
    </Form>
  );
};

export default NotificationSettingsForm;
