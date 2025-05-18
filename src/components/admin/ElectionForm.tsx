
import { useAuth } from "@/features/auth/context/AuthContext";
import ElectionFormTabs from "@/features/elections/components/form/ElectionFormTabs";
import {
  DEFAULT_POSITIONS,
  electionFormSchema,
  ElectionFormValues
} from "@/features/elections/types/electionFormTypes";
import { supabase } from "@/integrations/supabase/client";
import { Candidate } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ElectionFormProps {
  editingElectionId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ElectionForm = ({ editingElectionId, onSuccess, onCancel }: ElectionFormProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const candidateManagerRef = useRef(null);
  const votersManagerRef = useRef(null);
  
  // Initialize form
  const form = useForm<ElectionFormValues>({
    resolver: zodResolver(electionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      colleges: [],
      eligibleYearLevels: [],
      candidacyStartDate: "",
      candidacyEndDate: "",
      startDate: "",
      endDate: "",
      isPrivate: false,
      accessCode: "",
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
            colleges: Array.isArray(data.departments) && data.departments.length > 0 
              ? data.departments 
              : data.department ? [data.department] : [],
            eligibleYearLevels: Array.isArray(data.eligible_year_levels) ? data.eligible_year_levels : [],
            candidacyStartDate: data.candidacy_start_date || "",
            candidacyEndDate: data.candidacy_end_date || "",
            startDate: data.start_date || "",
            endDate: data.end_date || "",
            isPrivate: data.is_private || false,
            accessCode: data.access_code || "",
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
      const electionData = {
        title: values.title,
        description: values.description || "",
        department: values.colleges.includes("University-wide") ? "University-wide" : values.colleges[0], // For backward compatibility
        departments: values.colleges,
        eligible_year_levels: values.eligibleYearLevels,
        candidacy_start_date: values.candidacyStartDate,
        candidacy_end_date: values.candidacyEndDate,
        start_date: values.startDate,
        end_date: values.endDate,
        created_by: user.id,
        is_private: values.isPrivate,
        access_code: values.isPrivate ? values.accessCode : null,
        restrict_voting: false, // Always set to false as we're removing this feature
        status: status,
        positions: values.positions,
        banner_urls: values.banner_urls
      };
      
      // Process election save (create or update)
      let electionId: string;
      
      if (editingElectionId) {
        console.log("Updating election with ID:", editingElectionId);
        
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
        
      } else {
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
      }
      
      // Process candidates
      if (candidateManagerRef.current && typeof candidateManagerRef.current.getCandidatesForNewElection === 'function') {
        try {
          // Get candidates from the child component
          const candidatesData = candidateManagerRef.current.getCandidatesForNewElection();
          console.log("Candidates data to process:", candidatesData);
          
          if (candidatesData && Array.isArray(candidatesData) && candidatesData.length > 0) {
            // If editing, first delete existing candidates
            if (editingElectionId) {
              const { error: deleteError } = await supabase
                .from('candidates')
                .delete()
                .eq('election_id', electionId);
                
              if (deleteError) {
                console.error("Error deleting existing candidates:", deleteError);
                toast.error(`Failed to update candidates: ${deleteError.message}`);
              }
            }
            
            // Then insert the candidates
            const candidatesToInsert = candidatesData.map((candidate: Candidate) => ({
              ...candidate,
              election_id: electionId,
            }));
            
            const { error: candidatesError } = await supabase
              .from('candidates')
              .insert(candidatesToInsert);
            
            if (candidatesError) {
              console.error("Error adding candidates:", candidatesError);
              toast.error(`Failed to add candidates: ${candidatesError.message}`);
            }
          }
        } catch (error) {
          console.error("Error processing candidates:", error);
          toast.error("Warning: There was an issue processing candidates");
        }
      }
      
      toast.success(editingElectionId ? "Election updated successfully" : "Election created successfully");
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
      votersManagerRef={votersManagerRef}
    />
  );
};

export default ElectionForm;
