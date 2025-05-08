
import { ElectionResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface ResultsChartProps {
  result: ElectionResult;
}

const COLORS = ['#008f50', '#34b379', '#5ed4a0', '#86f0c8', '#b0ffe6'];

const ResultsChart = ({ result }: ResultsChartProps) => {
  // Check if there's valid data to display
  if (!result.candidates || result.candidates.length === 0 || result.totalVotes === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Election Results</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No votes have been cast yet.</p>
        </CardContent>
      </Card>
    );
  }

  // Format data for the chart
  const data = result.candidates.map((candidate) => ({
    name: candidate.name,
    value: candidate.votes,
    percentage: candidate.percentage
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Election Results</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => [`${value} votes (${props.payload.percentage}%)`, name]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ResultsChart;
