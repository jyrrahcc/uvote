
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminElections = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Elections</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Election Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Election management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminElections;
