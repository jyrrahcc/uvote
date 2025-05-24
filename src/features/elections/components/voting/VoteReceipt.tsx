
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { toast } from "sonner";

interface VoteReceiptProps {
  voteData: {
    id: string;
    timestamp: string;
    election: {
      title: string;
      id: string;
    };
    candidates: Array<{
      position: string;
      candidateName: string;
      candidateId: string | null;
    }>;
  };
}

const VoteReceipt: React.FC<VoteReceiptProps> = ({ voteData }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Unable to open print window");
      return;
    }
    
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vote Receipt - ${voteData.election.title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              max-width: 600px; 
              margin: 0 auto;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #008f50; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .receipt-info { 
              background-color: #f8f9fa; 
              padding: 15px; 
              border-radius: 8px; 
              margin-bottom: 20px;
            }
            .vote-item { 
              padding: 10px 0; 
              border-bottom: 1px solid #eee; 
            }
            .position { 
              font-weight: bold; 
              color: #008f50; 
            }
            .candidate { 
              margin-left: 20px; 
              font-style: italic;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              font-size: 12px; 
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>De La Salle University - Dasmariñas</h1>
            <h2>uVote System - Vote Receipt</h2>
          </div>
          
          <div class="receipt-info">
            <h3>Election: ${voteData.election.title}</h3>
            <p><strong>Vote ID:</strong> ${voteData.id}</p>
            <p><strong>Date & Time:</strong> ${new Date(voteData.timestamp).toLocaleString()}</p>
          </div>
          
          <h3>Your Selections:</h3>
          ${voteData.candidates.map(candidate => `
            <div class="vote-item">
              <div class="position">${candidate.position}</div>
              <div class="candidate">
                ${candidate.candidateId ? candidate.candidateName : 'Abstained'}
              </div>
            </div>
          `).join('')}
          
          <div class="footer">
            <p>This is an official vote receipt from the uVote Election Management System.</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
    
    toast.success("Receipt sent to printer");
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Vote Receipt
          <Button 
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <p><strong>Election:</strong> {voteData.election.title}</p>
            <p><strong>Vote ID:</strong> {voteData.id}</p>
            <p><strong>Timestamp:</strong> {new Date(voteData.timestamp).toLocaleString()}</p>
          </div>
          
          <div className="border-t pt-3">
            <h4 className="font-medium mb-2">Your Selections:</h4>
            {voteData.candidates.map((candidate, index) => (
              <div key={index} className="flex justify-between py-1">
                <span className="font-medium text-[#008f50]">{candidate.position}:</span>
                <span className={candidate.candidateId ? "text-black" : "text-muted-foreground italic"}>
                  {candidate.candidateId ? candidate.candidateName : 'Abstained'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoteReceipt;
