
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
  stats: {
    totalVoters: number;
    totalVotes: number;
    participationRate: number;
    positionsCount: number;
    candidatesCount: number;
  };
  votes: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const ElectionDetailTabs: React.FC<ElectionDetailTabsProps> = ({
  election,
  candidates,
  stats,
  votes
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
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
