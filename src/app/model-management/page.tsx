'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Cpu, Layers3, Atom, Wand2, PlusCircle, Search, Upload, Pencil, Trash2, Info } from "lucide-react"; // Using Cpu for JAX, Layers3 for PyTorch, Atom for TensorFlow
import { recommendModel, RecommendModelInput, RecommendModelOutput } from '@/ai/flows/recommend-model'; // Assuming Genkit flow exists
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";


// Mock data for models
const models = [
  { id: 'pt1', name: 'Image Classifier v2', framework: 'PyTorch', version: '2.1.0', status: 'Active', icon: Layers3, color: 'text-orange-500', lastUpdated: '2024-07-20' },
  { id: 'tf2', name: 'NLP Sentiment Analyzer', framework: 'TensorFlow', version: '1.5.2', status: 'Active', icon: Atom, color: 'text-blue-600', lastUpdated: '2024-07-18' },
  { id: 'jax3', name: 'Reinforcement Learner', framework: 'JAX', version: '0.3.1', status: 'Inactive', icon: Cpu, color: 'text-purple-500', lastUpdated: '2024-06-30' },
  { id: 'pt4', name: 'Object Detection', framework: 'PyTorch', version: '3.0.0-beta', status: 'Development', icon: Layers3, color: 'text-orange-500', lastUpdated: '2024-07-21' },
];

const RecommendSchema = z.object({
  dataDescription: z.string().min(10, "Please provide a more detailed data description."),
  performanceRequirements: z.string().min(10, "Please describe the performance needs."),
});

type RecommendFormData = z.infer<typeof RecommendSchema>;

export default function ModelManagementPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [recommendation, setRecommendation] = React.useState<RecommendModelOutput | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<RecommendFormData>({
    resolver: zodResolver(RecommendSchema),
    defaultValues: {
      dataDescription: "",
      performanceRequirements: "",
    },
  });

   const handleRecommendSubmit: SubmitHandler<RecommendFormData> = async (data) => {
    setIsLoadingRecommendation(true);
    setRecommendation(null); // Clear previous recommendation
    try {
      const result = await recommendModel(data);
      setRecommendation(result);
      toast({
        title: "Recommendation Ready",
        description: `Recommended model: ${result.recommendedModel}`,
      });
    } catch (error) {
       console.error("Error fetching recommendation:", error);
      toast({
        title: "Recommendation Failed",
        description: "Could not get a model recommendation. Please try again.",
        variant: "destructive",
      });
      setRecommendation({ recommendedModel: "Error", reasoning: "Failed to fetch recommendation." }); // Show error in dialog
    } finally {
      setIsLoadingRecommendation(false);
    }
  };


  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.framework.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'development': return 'outline';
      default: return 'secondary';
    }
  };
   const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'development': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };


  return (
     <TooltipProvider>
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Model Management</h1>
        <div className="flex gap-2">
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Wand2 className="mr-2 h-4 w-4" /> Recommend Model
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Recommend AI Model</DialogTitle>
                <DialogDescription>
                  Describe your data and performance needs, and we'll suggest the best framework.
                </DialogDescription>
              </DialogHeader>
               <Form {...form}>
                <form onSubmit={form.handleSubmit(handleRecommendSubmit)} className="space-y-4">
                   <FormField
                    control={form.control}
                    name="dataDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Large dataset of customer reviews (text), tabular sales data..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="performanceRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Performance Requirements</FormLabel>
                        <FormControl>
                           <Textarea placeholder="e.g., High accuracy needed for prediction, real-time inference required, minimize training time..." {...field} />
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isLoadingRecommendation}>
                      {isLoadingRecommendation ? "Getting Recommendation..." : "Get Recommendation"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>

               {recommendation && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       {recommendation.recommendedModel === "Error" ? "Error" : "Recommendation"}
                       {recommendation.recommendedModel !== "Error" && <Info className="h-4 w-4 text-muted-foreground"/>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recommendation.recommendedModel !== "Error" && (
                        <p className="text-lg font-semibold mb-2">{recommendation.recommendedModel}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
                  </CardContent>
                </Card>
              )}
            </DialogContent>
          </Dialog>
          <Button>
            <Upload className="mr-2 h-4 w-4" /> Upload New Model
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your AI Models</CardTitle>
          <CardDescription>Manage, version, and monitor your deployed and development models.</CardDescription>
           <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search models..."
              className="pl-8 sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Framework</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModels.map((model) => {
                const Icon = model.icon;
                 return (
                  <TableRow key={model.id}>
                    <TableCell>
                       <Tooltip>
                          <TooltipTrigger asChild>
                             <Icon className={`h-6 w-6 ${model.color}`} />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{model.framework}</p>
                          </TooltipContent>
                        </Tooltip>
                    </TableCell>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>{model.version}</TableCell>
                    <TableCell>
                       <Badge variant={getStatusBadgeVariant(model.status)} className={getStatusBadgeClass(model.status)}>
                        {model.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{model.lastUpdated}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                         <span className="sr-only">Edit</span>
                      </Button>
                       <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                         <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredModels.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No models found.
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
     </TooltipProvider>
  );
}
