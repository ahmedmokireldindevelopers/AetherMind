'use client'; // Add this directive

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, LineChart, Activity, FileJson, AlertTriangle } from "lucide-react"; // Using Prometheus icon approximation if needed

// Assume recharts is available via shadcn/ui chart component which uses it
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Bar, CartesianGrid, XAxis, YAxis, Line, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer, BarChart as RechartsBarChart, LineChart as RechartsLineChart } from "recharts"
import { Button } from "@/components/ui/button"; // Import Button


// Mock data for charts - Replace with actual data fetching
const cpuData = [
  { time: '10:00', usage: 45 }, { time: '10:05', usage: 55 }, { time: '10:10', usage: 50 },
  { time: '10:15', usage: 62 }, { time: '10:20', usage: 58 }, { time: '10:25', usage: 70 },
];

const memoryData = [
  { time: '10:00', usage: 60 }, { time: '10:05', usage: 65 }, { time: '10:10', usage: 63 },
  { time: '10:15', usage: 70 }, { time: '10:20', usage: 72 }, { time: '10:25', usage: 75 },
];

const requestData = [
 { name: '/api/generate', count: 150 },
 { name: '/api/tags', count: 45 },
 { name: '/api/show', count: 30 },
 { name: '/api/ps', count: 15 },
];

const chartConfigCpu: ChartConfig = {
  usage: { label: "CPU Usage (%)", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const chartConfigMemory: ChartConfig = {
  usage: { label: "Memory Usage (%)", color: "hsl(var(--accent))" },
} satisfies ChartConfig;

const chartConfigRequest: ChartConfig = {
  count: { label: "Request Count", color: "hsl(var(--chart-3))"},
} satisfies ChartConfig;


export default function MonitoringPage() {
  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Monitoring Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle>CPU Utilization</CardTitle>
             <CardDescription>Real-time CPU usage across services.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfigCpu} className="h-[250px] w-full">
              <RechartsLineChart data={cpuData} margin={{ left: -20, right: 20 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis unit="%" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                 <Line dataKey="usage" type="monotone" stroke="var(--color-usage)" strokeWidth={2} dot={false} />
              </RechartsLineChart>
            </ChartContainer>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Memory Usage</CardTitle>
             <CardDescription>System memory consumption over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigMemory} className="h-[250px] w-full">
               <RechartsLineChart data={memoryData} margin={{ left: -20, right: 20 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis unit="%" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                 <Line dataKey="usage" type="monotone" stroke="var(--color-usage)" strokeWidth={2} dot={false} />
              </RechartsLineChart>
            </ChartContainer>
          </CardContent>
        </Card>

         <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>API Request Volume</CardTitle>
            <CardDescription>Number of requests per API endpoint.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfigRequest} className="h-[300px] w-full">
               <RechartsBarChart data={requestData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={150} interval={0} fontSize={12} /> {/* Adjusted width and interval */}
                  <RechartsTooltip cursor={false} content={<ChartTooltipContent />} />
                  <RechartsLegend content={<ChartLegendContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={4} barSize={20} /> {/* Adjusted barSize */}
                </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metrics & Logging</CardTitle>
          <CardDescription>Access structured logs and Prometheus metrics.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-md">
             <div className="flex items-center space-x-3">
                {/* Placeholder for Prometheus Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-orange-500">
                    {/* Basic Prometheus-like icon */}
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                 </svg>
                <div>
                    <p className="font-medium">Prometheus Metrics</p>
                    <p className="text-sm text-muted-foreground">System and application metrics available at <code className="text-xs bg-muted px-1 rounded">/metrics</code> endpoint.</p>
                </div>
             </div>
             <Button variant="outline" size="sm" disabled>View Metrics</Button>
          </div>
           <div className="flex items-center justify-between p-4 border rounded-md">
             <div className="flex items-center space-x-3">
                <FileJson className="h-6 w-6 text-primary" />
                 <div>
                    <p className="font-medium">JSON Logs</p>
                    <p className="text-sm text-muted-foreground">Structured logs are outputted for easy parsing and analysis.</p>
                </div>
             </div>
             <Button variant="outline" size="sm" disabled>View Logs</Button>
          </div>
           <div className="flex items-center justify-between p-4 border rounded-md bg-yellow-50 border-yellow-200">
             <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                 <div>
                    <p className="font-medium text-yellow-800">Alerting (Setup Required)</p>
                    <p className="text-sm text-yellow-700">Configure alerting rules based on metrics or logs (e.g., using Alertmanager).</p>
                </div>
             </div>
             <Button variant="outline" size="sm" disabled>Configure Alerts</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
