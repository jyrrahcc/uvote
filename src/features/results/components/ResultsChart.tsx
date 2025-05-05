
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ElectionResult } from "@/types";

interface ResultsChartProps {
  result: ElectionResult;
}

interface CustomizedTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

/**
 * Custom tooltip component for the chart
 */
const CustomizedTooltip = ({ active, payload, label }: CustomizedTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-border rounded-md shadow-sm">
        <p className="font-medium">{`${label}`}</p>
        <p className="text-primary">{`${payload[0].value} votes`}</p>
        <p className="text-sm text-muted-foreground">{`${payload[0].payload.percentage}% of total`}</p>
      </div>
    );
  }
  return null;
};

/**
 * Chart component to display election results
 */
const ResultsChart = ({ result }: ResultsChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    // Format data for the chart
    const formattedData = result.candidates.map(candidate => ({
      name: candidate.name,
      votes: candidate.votes,
      percentage: candidate.percentage
    }));
    
    setChartData(formattedData);
  }, [result]);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Vote Distribution</h3>
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis />
            <Tooltip content={<CustomizedTooltip />} />
            <Bar dataKey="votes" name="Votes">
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.name === result.winner?.name ? "#059669" : "#10b981"} 
                  opacity={entry.name === result.winner?.name ? 1 : 0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground text-center">
        Total votes: {result.totalVotes}
      </div>
    </Card>
  );
};

export default ResultsChart;
