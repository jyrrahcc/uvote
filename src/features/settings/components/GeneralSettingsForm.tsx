
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const generalFormSchema = z.object({
  siteName: z.string().min(2, {
    message: "Site name must be at least 2 characters.",
  }),
  siteUrl: z.string().url({
    message: "Please enter a valid URL.",
  }),
  adminEmail: z.string().email({
    message: "Please enter a valid email address.",
  })
});

type GeneralFormValues = z.infer<typeof generalFormSchema>;

const GeneralSettingsForm = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "DLSU-D uVote", 
    siteUrl: window.location.origin,
    adminEmail: "admin@dlsud.edu.ph",
  });
  
  const form = useForm<GeneralFormValues>({
    resolver: zodResolver(generalFormSchema),
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
          .eq("category", "general")
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          const parsedSettings = JSON.parse(data.settings_value as string);
          setSettings({
            siteName: parsedSettings.siteName || settings.siteName,
            siteUrl: parsedSettings.siteUrl || settings.siteUrl,
            adminEmail: parsedSettings.adminEmail || settings.adminEmail,
          });
          
          form.reset({
            siteName: parsedSettings.siteName || settings.siteName,
            siteUrl: parsedSettings.siteUrl || settings.siteUrl,
            adminEmail: parsedSettings.adminEmail || settings.adminEmail,
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

  async function onSubmit(data: GeneralFormValues) {
    try {
      setLoading(true);
      
      // Save settings to database
      const { error } = await supabase
        .from("settings")
        .upsert({
          category: "general",
          settings_value: JSON.stringify(data),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'category'
        });
        
      if (error) throw error;
      
      toast.success("General settings saved successfully");
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
        <FormField
          control={form.control}
          name="siteName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter site name" {...field} />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed in the browser tab and emails.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="siteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormDescription>
                The base URL of your voting site.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="adminEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="admin@example.com" {...field} />
              </FormControl>
              <FormDescription>
                System notifications will be sent to this email address.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </Form>
  );
};

export default GeneralSettingsForm;
