
import { Election } from "@/types";

export interface ElectionFormProps {
  onSuccess?: (election: Election) => void;
  onCancel?: () => void;
  editingElectionId?: string;
}
