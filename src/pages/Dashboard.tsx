import React from "react";
import MetricCard from "@/components/MetricCard";
import { Swords, TriangleAlert, Building, CircleDot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Critical", value: 300, color: "#ef4444" }, // Red
  { name: "High", value: 200, color: "#f97316" }, // Orange
  { name: "Medium", value: 500, color: "#6b7280" }, // Gray
  { name: "Low", value: 400, color: "#4b5563" }, // Darker Gray
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-5xl font-extrabold text-foreground">Global Overview</h1>
        <p className="text-lg text-muted-foreground">
          Real-time monitoring of conflicts and human rights violations worldwide
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={<Swords size={48} />} value={18} label="Active Conflicts" />
        <MetricCard icon={<TriangleAlert size={48} />} value={623} label="Violations Reported" />
        <MetricCard icon={<Building size={48} />} value={49} label="UN Declarations" />
        <MetricCard icon={<CircleDot size={48} className="text-red-500" />} value={1} label="Critical Severity" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-highlight/20">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-foreground">Conflict Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-highlight/20">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "Report 1: Incident detected in Region Syria",
              "Report 2: Incident detected in Region Ukraine",
              "Report 3: Incident detected in Region Yemen",
              "Report 4: Incident detected in Region Sahel",
              "Report 5: Incident detected in Region South Sudan",
            ].map((activity, index) => (
              <div
                key={index}
                className="p-3 bg-secondary rounded-md text-muted-foreground hover:bg-highlight/20 hover:text-highlight transition-colors cursor-pointer"
              >
                {activity}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;