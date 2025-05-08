
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MyApplications = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Candidate Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You don't have any candidate applications yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyApplications;
