// src/app/model-comparison/page.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Scale, BarChart, LineChart, Cpu, Layers3, Atom, Target, Clock, MemoryStick, TrendingUp, TrendingDown, Play, BrainCircuit, Info } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  Line,
} from "recharts";
import type { ChartConfig } from "@/components/ui/chart"; // Import ChartConfig type
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast'; // Import useToast

// Mock data for models available for comparison (fetch from backend/context in real app)
const availableModels = [
  { id: 'pt1', name: 'Image Classifier v2', framework: 'PyTorch', version: '2.1.0', icon: Layers3 },
  { id: 'tf2', name: 'NLP Sentiment Analyzer', framework: 'TensorFlow', version: '1.5.2', icon: Atom },
  { id: 'jax3', name: 'Reinforcement Learner', framework: 'JAX', version: '0.3.1', icon: Cpu },
  { id: 'pt4', name: 'Object Detection', framework: 'PyTorch', version: '3.0.0-beta', icon: Layers3 },
  { id: 'olama1', name: 'llama3:latest', framework: 'Ollama', version: 'ollama-auto', icon: BrainCircuit }, // Added Ollama model
];

// Mock comparison results - Replace with actual evaluation data fetched after running comparison
// Initially empty, populated after "running" comparison
const initialComparisonResults: any[] = [];

// Simulate fetching results for selected models (replace with actual API call/logic)
const fetchComparisonResults = async (modelIds: string[], dataset: string): Promise<any[]> => {
    console.log(`Simulating fetching comparison results for models: ${modelIds.join(', ')} on dataset: ${dataset}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

    // Filter mock data based on selected IDs - In real app, this data comes from backend evaluation run
    const allMockResults = [
        { modelId: 'pt1', modelName: 'Image Classifier v2', accuracy: 92.5, precision: 91.8, recall: 93.0, f1Score: 92.4, latencyMs: 150, cpuUsage: 35, memoryMb: 512 },
        { modelId: 'tf2', modelName: 'NLP Sentiment Analyzer', accuracy: 85.2, precision: 88.0, recall: 82.1, f1Score: 84.9, latencyMs: 220, cpuUsage: 45, memoryMb: 820 },
        { modelId: 'jax3', modelName: 'Reinforcement Learner', accuracy: -1, precision: -1, recall: -1, f1Score: -1, latencyMs: 80, cpuUsage: 70, memoryMb: 1024 }, // Example where some metrics N/A
        { modelId: 'pt4', modelName: 'Object Detection', accuracy: 88.0, precision: 85.5, recall: 90.1, f1Score: 87.7, latencyMs: 350, cpuUsage: 65, memoryMb: 1280 },
        { modelId: 'olama1', modelName: 'llama3:latest', accuracy: 75.0, precision: -1, recall: -1, f1Score: -1, latencyMs: 500, cpuUsage: 55, memoryMb: 4700 },
    ];

    const results = allMockResults.filter(result => modelIds.includes(result.modelId));
    console.log("Simulated results:", results);
    return results;
};


// Chart Configs
const accuracyChartConfig = {
  accuracy: { label: 'Accuracy (%)', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

const latencyChartConfig = {
  latencyMs: { label: 'Latency (ms)', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

const resourceChartConfig = {
  cpuUsage: { label: 'CPU (%)', color: 'hsl(var(--chart-3))' },
  memoryMb: { label: 'Memory (MB)', color: 'hsl(var(--chart-4))', axis: 'right' }, // Specify right axis for Memory
} satisfies ChartConfig;


export default function ModelComparisonPage() {
  const [selectedModelIds, setSelectedModelIds] = React.useState<string[]>(['pt1', 'pt4']); // Default selection
  const [evaluationDataset, setEvaluationDataset] = React.useState<string>('default_validation'); // Mock dataset selection
  const [comparisonResults, setComparisonResults] = React.useState<any[]>(initialComparisonResults);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleModelSelectionChange = (modelId: string) => {
    setSelectedModelIds((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
    // Clear results when selection changes, requiring a new comparison run
    setComparisonResults(initialComparisonResults);
  };

   const handleRunComparison = async () => {
     if (selectedModelIds.length < 2) {
       toast({ title: "Select Models", description: "Please select at least two models to compare.", variant: "destructive" });
       return;
     }
     setIsLoading(true);
     setComparisonResults(initialComparisonResults); // Clear previous results visually
     toast({ title: "Comparison Started", description: `Evaluating ${selectedModelIds.length} models on ${evaluationDataset}...` });

     try {
       const results = await fetchComparisonResults(selectedModelIds, evaluationDataset);
       setComparisonResults(results);
       toast({ title: "Comparison Complete", description: "Results are now displayed." });
     } catch (error: any) {
       console.error("Comparison error:", error);
       toast({ title: "Comparison Failed", description: `Error evaluating models: ${error.message || 'Unknown error'}`, variant: "destructive" });
     } finally {
       setIsLoading(false);
     }
   };

  // Prepare data for charts, only if results are available
   const performanceChartData = comparisonResults.map(m => ({
    name: m.modelName,
    accuracy: m.accuracy > 0 ? m.accuracy : 0, // Handle N/A for charting
    latencyMs: m.latencyMs > 0 ? m.latencyMs : 0,
  }));

   const resourceChartData = comparisonResults.map(m => ({
    name: m.modelName,
    cpuUsage: m.cpuUsage > 0 ? m.cpuUsage : 0,
    memoryMb: m.memoryMb > 0 ? m.memoryMb : 0,
  }));


  const getMetricIcon = (metric: string) => {
    switch (metric.toLowerCase()) {
        case 'accuracy': return <Target className="h-4 w-4 mr-1 text-green-500" />;
        case 'precision': return <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />;
        case 'recall': return <TrendingDown className="h-4 w-4 mr-1 text-orange-500" />; // Example icon choices
        case 'f1score': return <Scale className="h-4 w-4 mr-1 text-purple-500" />;
        case 'latencyms': return <Clock className="h-4 w-4 mr-1 text-yellow-600" />;
        case 'cpuusage': return <Cpu className="h-4 w-4 mr-1 text-red-500" />;
        case 'memorymb': return <MemoryStick className="h-4 w-4 mr-1 text-indigo-500" />;
        default: return <BarChart className="h-4 w-4 mr-1 text-muted-foreground" />;
    }
  };

  const formatMetricValue = (value: number | undefined | null, metric: string) => {
     if (value === undefined || value === null || value < 0) return 'N/A'; // Handle N/A or invalid values

     switch (metric.toLowerCase()) {
        case 'accuracy':
        case 'precision':
        case 'recall':
        case 'f1score':
        case 'cpuusage':
            return `${value.toFixed(1)}%`;
        case 'latencyms':
            return `${value} ms`;
        case 'memorymb':
            return `${(value / 1024).toFixed(1)} GB`; // Display memory in GB for better readability
        default:
            return value.toString();
     }
  }

  const renderMetricTableCell = (result: any, metricKey: keyof typeof result, metricName: string) => (
     <TableCell className="text-center whitespace-nowrap">{formatMetricValue(result[metricKey], metricName)}</TableCell>
  );

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Model Comparison & Performance</h1>
         <Button onClick={handleRunComparison} disabled={isLoading || selectedModelIds.length < 2}>
           {isLoading ? <Cpu className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
           {isLoading ? 'Running Comparison...' : 'Run Comparison'}
        </Button>
      </div>

      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle>Comparison Setup</CardTitle>
          <CardDescription>Select models and the evaluation dataset to run the comparison.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {/* Model Selection */}
          <div className="space-y-2">
            <Label className="font-semibold">Select Models to Compare (Select at least 2)</Label>
            <ScrollArea className="h-48 rounded-md border p-2">
                <div className="space-y-2">
                {availableModels.map((model) => (
                    <div key={model.id} className="flex items-center space-x-2">
                    <Checkbox
                        id={`model-${model.id}`}
                        checked={selectedModelIds.includes(model.id)}
                        onCheckedChange={() => handleModelSelectionChange(model.id)}
                        aria-label={`Select model ${model.name}`}
                    />
                    <Label htmlFor={`model-${model.id}`} className="flex items-center gap-2 font-normal cursor-pointer hover:text-foreground">
                        <model.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{model.name} <span className="text-xs text-muted-foreground">({model.framework} {model.version})</span></span>
                    </Label>
                    </div>
                ))}
                </div>
            </ScrollArea>
             <p className="text-xs text-muted-foreground">{selectedModelIds.length} model(s) selected.</p>
          </div>

          {/* Dataset Selection */}
          <div className="space-y-2">
            <Label htmlFor="eval-dataset" className="font-semibold">Evaluation Dataset</Label>
            <Select value={evaluationDataset} onValueChange={setEvaluationDataset}>
              <SelectTrigger id="eval-dataset">
                <SelectValue placeholder="Select dataset" />
              </SelectTrigger>
              <SelectContent>
                {/* Populate with actual datasets */}
                <SelectItem value="default_validation">Default Validation Set</SelectItem>
                <SelectItem value="imagenet_test">ImageNet Test Set</SelectItem>
                <SelectItem value="custom_reviews_v1">Custom Reviews v1</SelectItem>
                <SelectItem value="financial_forecast_q3">Financial Forecast Q3</SelectItem>
                 <SelectItem value="upload_new" disabled>Upload New Dataset...</SelectItem>
              </SelectContent>
            </Select>
             <p className="text-xs text-muted-foreground">Choose the dataset to evaluate the models against.</p>
          </div>
        </CardContent>
      </Card>

      {/* Results Section - Display only when comparison has run */}
      {isLoading && (
         <Card>
           <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                  <Cpu className="h-5 w-5 animate-spin" />
                  <span>Evaluating models, please wait...</span>
              </div>
           </CardContent>
         </Card>
      )}

      {!isLoading && comparisonResults.length > 0 ? (
        <>
          {/* Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics Comparison</CardTitle>
              <CardDescription>Key performance indicators for the selected models on the '{evaluationDataset}' dataset.</CardDescription>
            </CardHeader>
            <CardContent>
               <ScrollArea className="w-full whitespace-nowrap">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-background z-10">Model</TableHead>
                        <TableHead className="text-center">{getMetricIcon('accuracy')} Accuracy</TableHead>
                        <TableHead className="text-center">{getMetricIcon('precision')} Precision</TableHead>
                        <TableHead className="text-center">{getMetricIcon('recall')} Recall</TableHead>
                        <TableHead className="text-center">{getMetricIcon('f1Score')} F1-Score</TableHead>
                        <TableHead className="text-center">{getMetricIcon('latencyMs')} Latency</TableHead>
                        <TableHead className="text-center">{getMetricIcon('cpuUsage')} CPU</TableHead>
                        <TableHead className="text-center">{getMetricIcon('memoryMb')} Memory</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparisonResults.map((result) => (
                        <TableRow key={result.modelId}>
                          <TableCell className="font-medium sticky left-0 bg-background z-10">{result.modelName}</TableCell>
                          {renderMetricTableCell(result, 'accuracy', 'accuracy')}
                          {renderMetricTableCell(result, 'precision', 'precision')}
                          {renderMetricTableCell(result, 'recall', 'recall')}
                          {renderMetricTableCell(result, 'f1Score', 'f1Score')}
                          {renderMetricTableCell(result, 'latencyMs', 'latencyMs')}
                          {renderMetricTableCell(result, 'cpuUsage', 'cpuUsage')}
                          {renderMetricTableCell(result, 'memoryMb', 'memoryMb')}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
               </ScrollArea>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Info className="h-3 w-3" /> N/A indicates the metric is not applicable or wasn't measured for that model.
                </p>
            </CardContent>
          </Card>

           {/* Charts Section */}
           <div className="grid gap-6 md:grid-cols-2">
              {/* Accuracy Chart */}
              <Card>
                <CardHeader>
                    <CardTitle>Accuracy Comparison</CardTitle>
                    <CardDescription>Higher is better. (Values of N/A are shown as 0).</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={accuracyChartConfig} className="h-[250px] w-full">
                       <RechartsBarChart data={performanceChartData} margin={{ top: 5, right: 10, left: -20, bottom: 50 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} interval={0} angle={-45} textAnchor="end" />
                            <YAxis unit="%" />
                            <RechartsTooltip content={<ChartTooltipContent indicator="dot" hideLabel />} />
                            <Bar dataKey="accuracy" fill="var(--color-accuracy)" radius={4} barSize={30} />
                        </RechartsBarChart>
                    </ChartContainer>
                </CardContent>
              </Card>

               {/* Latency Chart */}
               <Card>
                <CardHeader>
                    <CardTitle>Latency Comparison</CardTitle>
                    <CardDescription>Lower is better. (Values of N/A are shown as 0).</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={latencyChartConfig} className="h-[250px] w-full">
                        <RechartsBarChart data={performanceChartData} margin={{ top: 5, right: 10, left: -20, bottom: 50 }}>
                            <CartesianGrid vertical={false} />
                             <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} interval={0} angle={-45} textAnchor="end" />
                            <YAxis unit=" ms" />
                            <RechartsTooltip content={<ChartTooltipContent indicator="dot" hideLabel />} />
                            <Bar dataKey="latencyMs" fill="var(--color-latencyMs)" radius={4} barSize={30}/>
                        </RechartsBarChart>
                    </ChartContainer>
                 </CardContent>
               </Card>

               {/* Resource Usage Chart */}
               <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Resource Usage</CardTitle>
                     <CardDescription>CPU (%) and Memory (GB) consumption during evaluation.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={resourceChartConfig} className="h-[350px] w-full">
                       <RechartsBarChart data={resourceChartData} margin={{ top: 5, right: 10, left: -20, bottom: 50 }}>
                            <CartesianGrid vertical={false} />
                             <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} interval={0} angle={-45} textAnchor="end" />
                            <YAxis yAxisId="left" orientation="left" stroke="var(--color-cpuUsage)" unit="%" />
                            <YAxis yAxisId="right" orientation="right" stroke="var(--color-memoryMb)" unit=" GB" />
                            <RechartsTooltip content={<ChartTooltipContent />} />
                            <RechartsLegend content={<ChartLegendContent />} />
                            <Bar yAxisId="left" dataKey="cpuUsage" fill="var(--color-cpuUsage)" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar yAxisId="right" dataKey="memoryMb" fill="var(--color-memoryMb)" radius={[4, 4, 0, 0]} barSize={20} />
                        </RechartsBarChart>
                    </ChartContainer>
                </CardContent>
               </Card>
           </div>

        </>
      ) : (
        !isLoading && ( // Only show this if not loading and no results
             <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                    Select at least two models and click "Run Comparison" to see the results.
                    </p>
                </CardContent>
            </Card>
        )
      )}
    </div>
  );
}
