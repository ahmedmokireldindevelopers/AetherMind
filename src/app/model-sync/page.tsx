'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Share2, RefreshCw, Search, HardDrive, CheckCircle2, AlertCircle, XCircle, List, FileCheck, SlidersHorizontal, Filter, ShieldAlert, Clock, Info } from "lucide-react"; // Added Info icon
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label"; // Import Label component
import { Switch } from "@/components/ui/switch"; // Import Switch component
import { Slider } from "@/components/ui/slider"; // Import Slider component

// Mock data for sync logs
const syncLogs = [
  { id: 'log1', timestamp: '2024-07-22 10:30:15', model: 'Image Classifier v2', action: 'Sync Started', status: 'Info', details: 'Syncing to External Drive A' },
  { id: 'log2', timestamp: '2024-07-22 10:31:02', model: 'Image Classifier v2', action: 'Integrity Check', status: 'Success', details: 'File checksum verified' },
  { id: 'log3', timestamp: '2024-07-22 10:32:45', model: 'Image Classifier v2', action: 'Sync Completed', status: 'Success', details: 'Successfully synced to External Drive A' },
  { id: 'log4', timestamp: '2024-07-22 09:15:00', model: 'NLP Sentiment Analyzer', action: 'Sync Started', status: 'Info', details: 'Syncing to Backup Server' },
  { id: 'log5', timestamp: '2024-07-22 09:16:10', model: 'NLP Sentiment Analyzer', action: 'Sync Failed', status: 'Error', details: 'Insufficient space on Backup Server (Needs 5GB, 2GB available)' },
   { id: 'log6', timestamp: '2024-07-21 14:05:22', model: 'Object Detection', action: 'New Model Detected', status: 'Info', details: 'Detected new Ollama model download' },
   { id: 'log7', timestamp: '2024-07-21 14:06:00', model: 'Object Detection', action: 'Sync Started', status: 'Info', details: 'Syncing to Internal SSD, External Drive B' },
   { id: 'log8', timestamp: '2024-07-21 14:08:30', model: 'Object Detection', action: 'Sync Completed', status: 'Success', details: 'Sync successful to all locations' },
];

// Mock data for model inventory
const modelInventory = [
  { id: 'pt1', name: 'Image Classifier v2', version: '2.1.0', size: '2.5 GB', locations: ['Internal SSD', 'External Drive A'], lastSynced: '2024-07-22 10:32', isCritical: true },
  { id: 'tf2', name: 'NLP Sentiment Analyzer', version: '1.5.2', size: '1.8 GB', locations: ['Internal SSD'], lastSynced: '2024-07-22 09:15', isCritical: false },
  { id: 'jax3', name: 'Reinforcement Learner', version: '0.3.1', size: '500 MB', locations: ['Internal SSD'], lastSynced: '2024-07-20 15:00', isCritical: false },
   { id: 'pt4', name: 'Object Detection', version: '3.0.0-beta', size: '4.1 GB', locations: ['Internal SSD', 'External Drive B'], lastSynced: '2024-07-21 14:08', isCritical: true },
   { id: 'olama1', name: 'llama3:latest', version: 'ollama-auto', size: '4.7 GB', locations: ['Internal SSD', 'External Drive A', 'External Drive B'], lastSynced: '2024-07-22 11:00', isCritical: false },
];

export default function ModelSyncPage() {
   const [inventorySearchTerm, setInventorySearchTerm] = React.useState("");
   const [selectedModels, setSelectedModels] = React.useState<Record<string, boolean>>({});

   const filteredInventory = modelInventory.filter(model =>
    model.name.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
    model.locations.some(loc => loc.toLowerCase().includes(inventorySearchTerm.toLowerCase()))
  );

   const handleSelectModel = (modelId: string, checked: boolean | 'indeterminate') => {
     setSelectedModels(prev => ({ ...prev, [modelId]: !!checked }));
   };

   const handleSelectAll = (checked: boolean | 'indeterminate') => {
     const newSelected: Record<string, boolean> = {};
     if (checked) {
       filteredInventory.forEach(model => newSelected[model.id] = true);
     }
     setSelectedModels(newSelected);
   };

   const numSelected = Object.values(selectedModels).filter(Boolean).length;
   const allSelected = numSelected > 0 && numSelected === filteredInventory.length;
   const isIndeterminate = numSelected > 0 && numSelected < filteredInventory.length;


   const getLogStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };


  return (
    <TooltipProvider>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Model Synchronization</h1>
          <Button>
            <RefreshCw className="mr-2 h-4 w-4" /> Trigger Manual Sync
          </Button>
        </div>

        <Card>
           <CardHeader>
            <CardTitle>Sync Status & Overview</CardTitle>
             <CardDescription>Monitor and manage the synchronization of your AI models across storage devices.</CardDescription>
          </CardHeader>
           <CardContent className="grid gap-4 md:grid-cols-3">
             <div className="flex items-center space-x-4 rounded-md border p-4">
                <Share2 className="h-8 w-8 text-primary" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Overall Status</p>
                  <p className="text-sm text-muted-foreground text-green-600 font-semibold">Synchronized</p>
                </div>
             </div>
             <div className="flex items-center space-x-4 rounded-md border p-4">
                <HardDrive className="h-8 w-8 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Managed Devices</p>
                  <p className="text-sm text-muted-foreground">Internal SSD, Ext Drive A, Ext Drive B</p>
                </div>
             </div>
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Last Sync</p>
                  <p className="text-sm text-muted-foreground">5 minutes ago</p>
                </div>
             </div>
             <div className="md:col-span-3">
                <p className="text-sm font-medium leading-none mb-2">Storage Capacity</p>
                 <div className="grid gap-2 grid-cols-1 md:grid-cols-3">
                    {/* Example Storage Gauges - Replace with actual data */}
                    <div>
                        <Label className="text-xs text-muted-foreground">Internal SSD (500GB)</Label>
                        <Progress value={75} className="h-2" />
                        <p className="text-xs text-muted-foreground text-right">375GB Used</p>
                    </div>
                    <div>
                         <Label className="text-xs text-muted-foreground">External Drive A (1TB)</Label>
                        <Progress value={50} className="h-2" />
                         <p className="text-xs text-muted-foreground text-right">500GB Used</p>
                    </div>
                    <div>
                         <Label className="text-xs text-muted-foreground">External Drive B (2TB)</Label>
                        <Progress value={95} className="h-2 [&>div]:bg-destructive" />
                         <p className="text-xs text-destructive text-right flex items-center justify-end"><ShieldAlert className="h-3 w-3 mr-1"/>1.9TB Used - Low Space!</p>
                    </div>
                 </div>
             </div>
          </CardContent>
        </Card>


        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                  <div>
                     <CardTitle>Model Inventory</CardTitle>
                    <CardDescription>Searchable list of all synchronized models.</CardDescription>
                  </div>
                   <div className="flex gap-2">
                       <Button variant="outline" size="sm" disabled={numSelected === 0}>
                           <RefreshCw className="mr-2 h-4 w-4"/> Sync Selected
                       </Button>
                       <Button variant="outline" size="icon">
                           <Filter className="h-4 w-4" />
                           <span className="sr-only">Filter</span>
                       </Button>
                   </div>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search inventory (name, location)..."
                  className="pl-8 w-full"
                  value={inventorySearchTerm}
                  onChange={(e) => setInventorySearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-[50px]">
                         <Checkbox
                           checked={allSelected || isIndeterminate}
                           onCheckedChange={handleSelectAll}
                           aria-label="Select all models"
                           data-state={isIndeterminate ? 'indeterminate' : undefined}
                          />
                      </TableHead>
                       <TableHead className="w-[20px]">P</TableHead> {/* Priority */}
                      <TableHead>Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Locations</TableHead>
                      <TableHead>Last Synced</TableHead>

                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.length > 0 ? filteredInventory.map((model) => (
                      <TableRow key={model.id} data-state={selectedModels[model.id] ? 'selected' : undefined}>
                         <TableCell>
                           <Checkbox
                             checked={selectedModels[model.id] ?? false}
                             onCheckedChange={(checked) => handleSelectModel(model.id, checked)}
                             aria-label={`Select model ${model.name}`}
                            />
                        </TableCell>
                         <TableCell>
                            <Tooltip>
                                <TooltipTrigger>{model.isCritical ? <Badge variant="destructive" className="p-1">!</Badge> : ''}</TooltipTrigger>
                                <TooltipContent>
                                    <p>Critical Model (Prioritized)</p>
                                </TooltipContent>
                            </Tooltip>
                         </TableCell>
                        <TableCell className="font-medium">{model.name}<br/><span className="text-xs text-muted-foreground">{model.version}</span></TableCell>
                        <TableCell>{model.size}</TableCell>
                        <TableCell>
                           <Tooltip>
                                <TooltipTrigger className="cursor-default">
                                   {model.locations.slice(0, 1).join(', ')}{model.locations.length > 1 ? ` +${model.locations.length - 1}` : ''}
                                </TooltipTrigger>
                                <TooltipContent>
                                   {model.locations.map(loc => <p key={loc}>{loc}</p>)}
                                </TooltipContent>
                            </Tooltip>
                        </TableCell>
                        <TableCell>{model.lastSynced}</TableCell>

                      </TableRow>
                    )) : (
                       <TableRow>
                         <TableCell colSpan={6} className="h-24 text-center">
                           No models found in inventory.
                         </TableCell>
                       </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Synchronization Logs</CardTitle>
              <CardDescription>Detailed history of sync activities and events.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[450px]">
                <div className="space-y-4">
                  {syncLogs.slice().reverse().map((log, index) => ( // Reverse logs to show newest first
                    <React.Fragment key={log.id}>
                       <div className="flex items-start gap-3">
                        <div className="mt-1">{getLogStatusIcon(log.status)}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                             {log.model} - {log.action}
                             <span className={`ml-2 text-xs font-normal ${log.status === 'Error' ? 'text-red-600' : log.status === 'Success' ? 'text-green-600' : 'text-muted-foreground'}`}>({log.status})</span>
                          </p>
                          <p className="text-xs text-muted-foreground">{log.details}</p>
                          <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                        </div>
                      </div>
                      {index < syncLogs.length - 1 && <Separator />}
                    </React.Fragment>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        {/* TODO: Add sections for Sync Settings, Recovery Options, Manual Override */}
         <Card>
             <CardHeader>
                 <CardTitle>Sync Settings</CardTitle>
                 <CardDescription>Configure synchronization behavior.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="auto-sync">Automatic Sync on New Download</Label>
                    <Switch id="auto-sync" defaultChecked />
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="integrity-check">Verify File Integrity During Sync</Label>
                    <Switch id="integrity-check" defaultChecked />
                </div>
                 <div className="space-y-2">
                     <Label htmlFor="storage-threshold">Low Storage Warning Threshold (%)</Label>
                     <Slider id="storage-threshold" defaultValue={[10]} max={30} step={5} />
                     <p className="text-xs text-muted-foreground">Warn when available space drops below 10%.</p>
                 </div>
                 {/* Add Priority Settings, etc. */}
             </CardContent>
         </Card>

      </div>
    </TooltipProvider>
  );
}
