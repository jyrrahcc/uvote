
import { Election } from "@/types";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "../dateUtils";

/**
 * Share an election via various methods
 */
export const shareElection = (election: Election) => {
  const shareUrl = `${window.location.origin}/elections/${election.id}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast("Link copied to clipboard");
    });
  };
  
  const shareByEmail = () => {
    const subject = encodeURIComponent(`Vote in "${election.title}"`);
    const body = encodeURIComponent(
      `You're invited to vote in "${election.title}".\n\n` +
      `Please visit: ${shareUrl}\n\n` +
      `The election is open from ${formatDate(election.startDate)} to ${formatDate(election.endDate)}.` +
      (election.isPrivate ? `\n\nAccess Code: ${election.accessCode}` : '')
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };
  
  const openInNewTab = () => {
    window.open(shareUrl, '_blank');
  };
  
  return {
    copyToClipboard,
    shareByEmail,
    openInNewTab,
    buttons: (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={copyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </Button>
        <Button variant="outline" size="sm" onClick={shareByEmail}>
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
        <Button variant="outline" size="sm" onClick={openInNewTab}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open
        </Button>
      </div>
    )
  };
};
