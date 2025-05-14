
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Election } from "@/types";
import { BarChart, PieChart } from "lucide-react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
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
    </Tabs>
  );
};

export default ElectionDetailTabs;
