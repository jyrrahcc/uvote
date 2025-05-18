
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Election } from "@/types";
import { BarChart, PieChart } from "lucide-react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import OverviewTab from "./tabs/OverviewTab";
import CandidatesTab from "./tabs/CandidatesTab";
import VotersTab from "./tabs/VotersTab";

interface ElectionDetailTabsProps {
  election: Election;
  candidates: any[];
  positionVotes?: Record<string, any>;
  activeTab?: string;
  setActiveTab?: React.Dispatch<React.SetStateAction<string>>;
  stats?: {
    totalVoters: number;
    totalVotes: number;
    participationRate: number;
    positionsCount: number;
    candidatesCount: number;
  };
  votes?: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const ElectionDetailTabs: React.FC<ElectionDetailTabsProps> = ({
  election,
  candidates,
  stats = {
    totalVoters: 0,
    totalVotes: 0,
    participationRate: 0,
    positionsCount: 0,
    candidatesCount: 0
  },
  votes = [],
  positionVotes = {},
  activeTab = "overview",
  setActiveTab
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab);
  const handleTabChange = (value: string) => {
    if (setActiveTab) {
      setActiveTab(value);
    } else {
      setInternalActiveTab(value);
    }
  };
  
  const currentTab = setActiveTab ? activeTab : internalActiveTab;
  
  // Prepare data for charts
  const preparePositionVotesData = () => {
    return Object.entries(positionVotes).map(([position, data]) => ({
      name: position,
      votes: data.totalVotes || 0
    })).sort((a, b) => b.votes - a.votes);
  };
  
  const prepareCandidatesPerPositionData = () => {
    const positionCounts: Record<string, number> = {};
    
    candidates.forEach(candidate => {
      if (candidate.position) {
        positionCounts[candidate.position] = (positionCounts[candidate.position] || 0) + 1;
      }
    });
    
    return Object.entries(positionCounts).map(([position, count]) => ({
      name: position,
      candidates: count
    })).sort((a, b) => b.candidates - a.candidates);
  };
  
  // Data for the charts
  const positionVotesData = preparePositionVotesData();
  const candidatesPerPositionData = prepareCandidatesPerPositionData();

  return (
    <Tabs 
      defaultValue="overview" 
      className="w-full" 
      value={currentTab} 
      onValueChange={handleTabChange}
    >
      <TabsList className="w-full md:w-auto">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="candidates">Candidates</TabsTrigger>
        <TabsTrigger value="voters">Voters</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      
      {/* Overview Tab */}
      <TabsContent value="overview">
        <OverviewTab 
          election={election} 
          candidates={candidates} 
          stats={stats} 
          votes={votes} 
          COLORS={COLORS}
        />
      </TabsContent>
      
      {/* Candidates Tab */}
      <TabsContent value="candidates">
        <CandidatesTab candidates={candidates} />
      </TabsContent>
      
      {/* Voters Tab */}
      <TabsContent value="voters">
        <VotersTab election={election} stats={stats} />
      </TabsContent>
      
      {/* Analytics Tab - New comprehensive analytics */}
      <TabsContent value="analytics">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Votes per Position Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Votes per Position</CardTitle>
              <CardDescription>Distribution of votes across all positions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={positionVotesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="votes" fill="#0088FE" name="Votes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Candidates per Position Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Candidates per Position</CardTitle>
              <CardDescription>Number of candidates running for each position</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={candidatesPerPositionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="candidates" fill="#00C49F" name="Candidates" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Voter Participation Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Voter Participation</CardTitle>
              <CardDescription>Percentage of eligible voters who have voted</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Voted', value: stats.totalVotes },
                      { name: 'Not Voted', value: stats.totalVoters - stats.totalVotes }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: 'Voted', value: stats.totalVotes },
                      { name: 'Not Voted', value: stats.totalVoters - stats.totalVotes }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Position Competition Level */}
          <Card>
            <CardHeader>
              <CardTitle>Position Competition Level</CardTitle>
              <CardDescription>Candidates to positions ratio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {candidatesPerPositionData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant={item.candidates > 1 ? "default" : "outline"}>
                        {item.candidates} {item.candidates === 1 ? "candidate" : "candidates"}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, item.candidates * 20)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ElectionDetailTabs;
