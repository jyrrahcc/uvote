
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Election } from "@/types";
import { BarChart, PieChart } from "lucide-react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

interface OverviewTabProps {
  election: Election;
  candidates: any[];
  stats: {
    totalVoters: number;
    totalVotes: number;
    participationRate: number;
    positionsCount: number;
    candidatesCount: number;
  };
  votes: any[];
  COLORS: string[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  election,
  candidates,
  stats,
  votes,
  COLORS
}) => {
  /**
   * Generate position-based vote data for charts
   */
  const generatePositionChartData = () => {
    if (!candidates || candidates.length === 0) return [];
    
    const positions = [...new Set(candidates.map(c => c.position))];
    return positions.map(position => {
      const positionCandidates = candidates.filter(c => c.position === position);
      return {
        position,
        candidateCount: positionCandidates.length
      };
    });
  };

  /**
   * Generate participation data for pie chart
   */
  const generateParticipationData = () => {
    return [
      { name: "Voted", value: stats.totalVotes },
      { name: "Not Voted", value: stats.totalVoters - stats.totalVotes }
    ].filter(item => item.value > 0);
  };

  const positionChartData = generatePositionChartData();
  const participationData = generateParticipationData();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Bar Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Candidates per Position
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={positionChartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="position" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="candidateCount" fill="#008f50" name="Number of Candidates" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Pie Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Voter Participation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={participationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {participationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Election Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Election Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium">Election Period</div>
              <div className="text-muted-foreground">
                {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
              </div>
            </div>
            
            {election.candidacyStartDate && election.candidacyEndDate && (
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium">Candidacy Period</div>
                <div className="text-muted-foreground">
                  {new Date(election.candidacyStartDate).toLocaleDateString()} - {new Date(election.candidacyEndDate).toLocaleDateString()}
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium">Election Created</div>
              <div className="text-muted-foreground">
                {new Date(election.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
