
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Shield, BellRing } from "lucide-react";
import GeneralSettingsForm from "./GeneralSettingsForm";
import SecuritySettingsForm from "./SecuritySettingsForm";
import NotificationSettingsForm from "./NotificationSettingsForm";

const SettingsTabs = () => {
  const [activeTab, setActiveTab] = useState("general");
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general" className="flex items-center gap-1">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">General</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-1">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Security</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-1">
          <BellRing className="h-4 w-4" />
          <span className="hidden sm:inline">Notifications</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="mt-6">
        <GeneralSettingsForm />
      </TabsContent>
      
      <TabsContent value="security" className="mt-6">
        <SecuritySettingsForm />
      </TabsContent>
      
      <TabsContent value="notifications" className="mt-6">
        <NotificationSettingsForm />
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTabs;
