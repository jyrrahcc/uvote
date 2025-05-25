
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormProvider } from "react-hook-form";
import { ElectionDetailsTab } from "./tabs/ElectionDetailsTab";
import ElectionBannersTab from "./tabs/ElectionBannersTab";
import ElectionCandidatesTab from "./tabs/ElectionCandidatesTab";
import { ElectionFormValues } from "../../types/electionFormTypes";
import FormActions from "./FormActions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";

interface ElectionFormTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  form: any;
  onSubmit: (values: ElectionFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  editingElectionId: string | null;
  candidateManagerRef: React.RefObject<any>;
  votersManagerRef: React.RefObject<any>;
}

const ElectionFormTabs = ({
  activeTab,
  setActiveTab,
  form,
  onSubmit,
  onCancel,
  isSubmitting,
  editingElectionId,
  candidateManagerRef,
  votersManagerRef
}: ElectionFormTabsProps) => {
  
  // Auto-save form state to localStorage
  useEffect(() => {
    const saveFormState = () => {
      const formData = form.getValues();
      const storageKey = editingElectionId ? `election-form-edit-${editingElectionId}` : 'election-form-new';
      localStorage.setItem(storageKey, JSON.stringify(formData));
    };

    // Save on form value changes with debounce
    const subscription = form.watch(() => {
      const timeoutId = setTimeout(saveFormState, 1000);
      return () => clearTimeout(timeoutId);
    });

    // Save when navigating away or losing focus
    const handleBeforeUnload = () => saveFormState();
    const handleVisibilityChange = () => {
      if (document.hidden) saveFormState();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [form, editingElectionId]);

  // Load saved form state on mount
  useEffect(() => {
    const storageKey = editingElectionId ? `election-form-edit-${editingElectionId}` : 'election-form-new';
    const savedData = localStorage.getItem(storageKey);
    
    if (savedData && !editingElectionId) { // Only auto-restore for new elections
      try {
        const parsedData = JSON.parse(savedData);
        form.reset(parsedData);
      } catch (error) {
        console.error('Error loading saved form state:', error);
      }
    }
  }, [form, editingElectionId]);

  return (
    <div className="overflow-hidden max-h-[90vh]">
      <ScrollArea className="h-[calc(90vh-180px)] px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
          </TabsList>
          
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <TabsContent value="details">
                <ElectionDetailsTab />
              </TabsContent>
              
              <TabsContent value="banners">
                <ElectionBannersTab />
              </TabsContent>
              
              <TabsContent value="candidates">
                <ElectionCandidatesTab
                  ref={candidateManagerRef}
                  electionId={editingElectionId}
                  candidacyStartDate={form.watch("candidacyStartDate")}
                  candidacyEndDate={form.watch("candidacyEndDate")}
                  positions={form.watch("positions")}
                />
              </TabsContent>
              
              <FormActions 
                isSubmitting={isSubmitting}
                editingElectionId={editingElectionId}
                onCancel={onCancel}
              />
            </form>
          </FormProvider>
        </Tabs>
      </ScrollArea>
    </div>
  );
};

export default ElectionFormTabs;
