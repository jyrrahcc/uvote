
import { Badge } from "@/components/ui/badge";

interface ApplicationStatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected';
}

const ApplicationStatusBadge = ({ status }: ApplicationStatusBadgeProps) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">
          Pending
        </Badge>
      );
    case 'approved':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
          Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status}
        </Badge>
      );
  }
};

export default ApplicationStatusBadge;
