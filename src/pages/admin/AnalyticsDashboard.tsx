
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AnalyticsDashboard = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Election Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Analytics dashboard will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
