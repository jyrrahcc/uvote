
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Shield, Vote } from "lucide-react";
import ElectionSettingsForm from "./ElectionSettingsForm";
import SecuritySettingsForm from "./SecuritySettingsForm";
import VotingSettingsForm from "./VotingSettingsForm";

const SettingsTabs = () => {
  const [activeTab, setActiveTab] = useState("election");
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="election" className="flex items-center gap-1">
          <Vote className="h-4 w-4" />
          <span className="hidden sm:inline">Election</span>
        </TabsTrigger>
        <TabsTrigger value="voting" className="flex items-center gap-1">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Voting</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-1">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Security</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="election" className="mt-6">
        <ElectionSettingsForm />
      </TabsContent>
      
      <TabsContent value="voting" className="mt-6">
        <VotingSettingsForm />
      </TabsContent>
      
      <TabsContent value="security" className="mt-6">
        <SecuritySettingsForm />
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTabs;
