
import { useState, useEffect } from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";

interface ElectionSettings {
  candidacyApprovalRequired: boolean;
  minimumCandidacyPeriodDays: number;
  allowSelfRegistration: boolean;
  defaultPositions: string[];
}

const ElectionSettingsForm = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const form = useForm<ElectionSettings>({
    defaultValues: {
      candidacyApprovalRequired: true,
      minimumCandidacyPeriodDays: 3,
      allowSelfRegistration: false,
      defaultPositions: []
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
          .eq("category", "election")
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          const settingsValue = typeof data.settings_value === 'string' 
            ? JSON.parse(data.settings_value) 
            : data.settings_value;
            
          form.reset({
            candidacyApprovalRequired: settingsValue.candidacyApprovalRequired ?? true,
            minimumCandidacyPeriodDays: settingsValue.minimumCandidacyPeriodDays ?? 3,
            allowSelfRegistration: settingsValue.allowSelfRegistration ?? false,
            defaultPositions: settingsValue.defaultPositions ?? []
          });
        }
      } catch (error) {
        console.error("Failed to load election settings:", error);
        toast.error("Failed to load election settings");
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [form]);
  
  // Save settings to database
  const onSubmit = async (values: ElectionSettings) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("settings")
        .upsert({
          category: "election",
          settings_value: values
        }, {
          onConflict: "category"
        });
        
      if (error) throw error;
      
      toast.success("Election settings saved successfully");
    } catch (error) {
      console.error("Failed to save election settings:", error);
      toast.error("Failed to save election settings");
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
                name="candidacyApprovalRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Require Approval for Candidacy
                      </FormLabel>
                      <FormDescription>
                        When enabled, all candidate applications require administrator approval
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
                        Allow Self-Registration
                      </FormLabel>
                      <FormDescription>
                        When enabled, users can register themselves as candidates without invitation
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
                name="minimumCandidacyPeriodDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Candidacy Period (days)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        min={1}
                        max={30}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum number of days required for candidacy period before voting starts
                    </FormDescription>
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

export default ElectionSettingsForm;
