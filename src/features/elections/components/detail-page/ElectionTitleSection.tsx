
import React from "react";

interface ElectionTitleSectionProps {
  title: string;
  description?: string;
  status?: "upcoming" | "active" | "completed";
}

const ElectionTitleSection: React.FC<ElectionTitleSectionProps> = ({ title, description, status }) => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      {description && (
        <p className="text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
};

export default ElectionTitleSection;
