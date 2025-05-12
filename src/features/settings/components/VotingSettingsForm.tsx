
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

interface VotingSettings {
  allowAbstain: boolean;
  showRealTimeResults: boolean;
  minimumVotingPeriodHours: number;
  voterEmailVerificationRequired: boolean;
}

const VotingSettingsForm = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const form = useForm<VotingSettings>({
    defaultValues: {
      allowAbstain: true,
      showRealTimeResults: false,
      minimumVotingPeriodHours: 6,
      voterEmailVerificationRequired: true
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
          .eq("category", "voting")
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          const settingsValue = typeof data.settings_value === 'string' 
            ? JSON.parse(data.settings_value) 
            : data.settings_value;
            
          form.reset({
            allowAbstain: settingsValue.allowAbstain ?? true,
            showRealTimeResults: settingsValue.showRealTimeResults ?? false,
            minimumVotingPeriodHours: settingsValue.minimumVotingPeriodHours ?? 6,
            voterEmailVerificationRequired: settingsValue.voterEmailVerificationRequired ?? true
          });
        }
      } catch (error) {
        console.error("Failed to load voting settings:", error);
        toast.error("Failed to load voting settings");
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [form]);
  
  // Save settings to database
  const onSubmit = async (values: VotingSettings) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("settings")
        .upsert({
          category: "voting",
          settings_value: JSON.stringify(values) // Convert to string for JSON compatibility
        }, {
          onConflict: "category"
        });
        
      if (error) throw error;
      
      toast.success("Voting settings saved successfully");
    } catch (error) {
      console.error("Failed to save voting settings:", error);
      toast.error("Failed to save voting settings");
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
                name="allowAbstain"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Allow Abstain Option
                      </FormLabel>
                      <FormDescription>
                        When enabled, voters can choose to abstain from voting for specific positions
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
                name="showRealTimeResults"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Show Real-Time Results
                      </FormLabel>
                      <FormDescription>
                        When enabled, election results are shown in real-time as votes are cast
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
                name="minimumVotingPeriodHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Voting Period (hours)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        min={1}
                        max={168}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum number of hours required for voting period
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="voterEmailVerificationRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Require Email Verification
                      </FormLabel>
                      <FormDescription>
                        When enabled, voters must verify their email address before voting
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

export default VotingSettingsForm;
