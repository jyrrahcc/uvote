
import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Election } from "@/types";
import { 
  electionFormSchema,
  ElectionFormValues,
  DEFAULT_POSITIONS
} from "@/features/elections/types/electionFormTypes";
import ElectionFormTabs from "@/features/elections/components/form/ElectionFormTabs";

interface ElectionFormProps {
  editingElectionId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ElectionForm = ({ editingElectionId, onSuccess, onCancel }: ElectionFormProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const candidateManagerRef = useRef<any>(null);
  
  // Initialize form
  const form = useForm<ElectionFormValues>({
    resolver: zodResolver(electionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      departments: [],
      eligibleYearLevels: [],
      candidacyStartDate: "",
      candidacyEndDate: "",
      startDate: "",
      endDate: "",
      isPrivate: false,
      accessCode: "",
      restrictVoting: false,
      positions: DEFAULT_POSITIONS,
      banner_urls: [],
    },
  });
  
  // Fetch election data if editing
  useEffect(() => {
    async function fetchElectionData() {
      if (!editingElectionId) return;
      
      try {
        const { data, error } = await supabase
          .from('elections')
          .select('*')
          .eq('id', editingElectionId)
          .single();
          
        if (error) throw error;
        
        // Safely handle potentially missing properties with type checking
        if (data) {
          console.log("Fetched election data:", data);
          // Convert DB format to form values with safe property access
          form.reset({
            title: data.title || "",
            description: data.description || "",
            departments: Array.isArray(data.departments) && data.departments.length > 0 
              ? data.departments 
              : data.department ? [data.department] : [],
            eligibleYearLevels: Array.isArray(data.eligible_year_levels) ? data.eligible_year_levels : [],
            candidacyStartDate: data.candidacy_start_date || "",
            candidacyEndDate: data.candidacy_end_date || "",
            startDate: data.start_date || "",
            endDate: data.end_date || "",
            isPrivate: data.is_private || false,
            accessCode: data.access_code || "",
            restrictVoting: data.restrict_voting || false,
            positions: Array.isArray(data.positions) ? data.positions : DEFAULT_POSITIONS,
            banner_urls: Array.isArray(data.banner_urls) ? data.banner_urls : [],
          });
        }
      } catch (error) {
        console.error("Error fetching election:", error);
        toast.error("Failed to load election data");
      }
    }
    
    fetchElectionData();
  }, [editingElectionId, form]);

  /**
   * Handle form submission for creating or updating an election
   */
  const onSubmit = async (values: ElectionFormValues) => {
    if (!user) {
      toast.error("You must be logged in to create or edit an election");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Validate form data
      if (values.isPrivate && (!values.accessCode || values.accessCode.trim() === "")) {
        toast.error("Access code is required for private elections");
        setIsSubmitting(false);
        return;
      }
      
      // Ensure candidacy period ends before voting period starts
      const candidacyEnd = new Date(values.candidacyEndDate);
      const votingStart = new Date(values.startDate);
      
      if (candidacyEnd > votingStart) {
        toast.error("Candidacy period must end before voting period starts");
        setIsSubmitting(false);
        return;
      }
      
      // Determine initial status based on dates
      const now = new Date();
      const startDate = new Date(values.startDate);
      const endDate = new Date(values.endDate);
      
      let status: 'upcoming' | 'active' | 'completed' = 'upcoming';
      if (now >= endDate) {
        status = 'completed';
      } else if (now >= startDate) {
        status = 'active';
      }
      
      // Map the form values to the database schema fields
      let electionData = {
        title: values.title,
        description: values.description || "",
        department: values.departments.includes("University-wide") ? "University-wide" : values.departments[0], // For backward compatibility
        departments: values.departments,
        eligible_year_levels: values.eligibleYearLevels,
        candidacy_start_date: values.candidacyStartDate,
        candidacy_end_date: values.candidacyEndDate,
        start_date: values.startDate,
        end_date: values.endDate,
        created_by: user.id,
        is_private: values.isPrivate,
        access_code: values.isPrivate ? values.accessCode : null,
        restrict_voting: false, // We're integrating voter eligibility directly with departments and year levels
        status: status,
        positions: values.positions,
        banner_urls: values.banner_urls
      };
      
      let electionId: string;
      
      if (editingElectionId) {
        // Update existing election
        console.log("Updating election with ID:", editingElectionId);
        console.log("Update data:", electionData);
        
        const { error } = await supabase
          .from('elections')
          .update(electionData)
          .eq('id', editingElectionId);
        
        if (error) {
          console.error("Update error:", error);
          toast.error(`Failed to update election: ${error.message}`);
          throw error;
        }
        
        electionId = editingElectionId;
        
        // Handle updating candidates for existing election
        if (candidateManagerRef.current) {
          const candidatesData = candidateManagerRef.current.getCandidatesForNewElection?.();
          console.log("Candidates to update for existing election:", candidatesData);
          
          if (candidatesData && candidatesData.length > 0) {
            // First delete existing candidates
            const { error: deleteError } = await supabase
              .from('candidates')
              .delete()
              .eq('election_id', electionId);
              
            if (deleteError) {
              console.error("Error deleting existing candidates:", deleteError);
              toast.error(`Failed to update candidates: ${deleteError.message}`);
            } else {
              // Then insert new candidates
              const candidatesToInsert = candidatesData.map((candidate: any) => ({
                ...candidate,
                election_id: electionId,
              }));
              
              const { error: insertError } = await supabase
                .from('candidates')
                .insert(candidatesToInsert);
              
              if (insertError) {
                console.error("Error adding updated candidates:", insertError);
                toast.error(`Failed to update candidates: ${insertError.message}`);
              }
            }
          }
        }
        
        toast.success("Election updated successfully");
      } else {
        // Create new election
        const { data: newElection, error } = await supabase
          .from('elections')
          .insert([electionData])
          .select();
        
        if (error) {
          console.error("Insert error:", error);
          toast.error(`Failed to create election: ${error.message}`);
          throw error;
        }
        
        if (!newElection || newElection.length === 0) {
          throw new Error("Failed to create election: No data returned");
        }
        
        electionId = newElection[0].id;
        
        // If there are candidates to add, add them now
        if (candidateManagerRef.current && electionId) {
          const candidatesData = candidateManagerRef.current.getCandidatesForNewElection?.();
          console.log("Candidates to add for new election:", candidatesData);
          
          if (candidatesData && candidatesData.length > 0) {
            const candidatesToInsert = candidatesData.map((candidate: any) => ({
              ...candidate,
              election_id: electionId,
            }));
            
            const { error: candidatesError } = await supabase
              .from('candidates')
              .insert(candidatesToInsert);
            
            if (candidatesError) {
              console.error("Error adding candidates:", candidatesError);
              toast.error(`Failed to add candidates: ${candidatesError.message}`);
            } else {
              console.log("Successfully added candidates to new election");
            }
          }
        }
        
        toast.success("Election created successfully");
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error saving election:", error);
      toast.error("Failed to save election: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ElectionFormTabs
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      form={form}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      editingElectionId={editingElectionId}
      candidateManagerRef={candidateManagerRef}
    />
  );
};

export default ElectionForm;
