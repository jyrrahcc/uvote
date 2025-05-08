
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export interface StatsCardProps {
  title: string;
  value: number;
  iconComponent: React.ReactNode;
  loading: boolean;
  description: string;
  color: string;
}

const StatsCard = ({ title, value, iconComponent, loading, description, color }: StatsCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-3xl font-bold">{value}</p>
            )}
          </div>
          <div className={`p-2 rounded-full ${color}`}>
            {iconComponent}
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
