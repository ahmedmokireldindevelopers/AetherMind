// src/app/data-connectors/page.tsx
'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { PlusCircle, DatabaseZap, FileJson, Database as MongoIcon, Database as SQLiteIcon, Database as SupabaseIcon, Pencil, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ConnectorForm, ConnectorFormValues, ConnectorSchema } from './components/connector-form'; // Create this component
import { useToast } from "@/hooks/use-toast"; // Assuming useToast hook exists


// Define the structure for a connector
export interface Connector {
  id: string;
  name: string;
  type: 'Vector' | 'JSON' | 'MongoDB' | 'SQLite' | 'Supabase';
  status: 'Connected' | 'Disconnected' | 'Error'; // Added Error status
  icon: LucideIcon;
  color: string;
  // Add connection details (potentially sensitive, handle carefully!)
  // Example: connectionString?: string; apiKey?: string; etc. - Store securely in a real app
  details?: Record<string, any>; // Store non-sensitive details like file path for JSON/SQLite
}

// Map connector types to icons and colors
const connectorMeta: Record<Connector['type'], { icon: LucideIcon; color: string }> = {
  Vector: { icon: DatabaseZap, color: 'text-blue-500' },
  JSON: { icon: FileJson, color: 'text-orange-500' },
  MongoDB: { icon: MongoIcon, color: 'text-green-600' },
  SQLite: { icon: SQLiteIcon, color: 'text-purple-500' },
  Supabase: { icon: SupabaseIcon, color: 'text-emerald-500' },
};

// Initial mock data (will be managed by state)
const initialConnectors: Connector[] = [
  { id: 'vec1', name: 'Product Vectors', type: 'Vector', status: 'Connected', ...connectorMeta.Vector, details: { endpoint: 'https://vector.example.com' } },
  { id: 'json2', name: 'User Settings', type: 'JSON', status: 'Connected', ...connectorMeta.JSON, details: { filePath: '/path/to/settings.json' } },
  { id: 'mongo3', name: 'Orders DB', type: 'MongoDB', status: 'Connected', ...connectorMeta.MongoDB },
  { id: 'sqlite4', name: 'Local Cache', type: 'SQLite', status: 'Disconnected', ...connectorMeta.SQLite, details: { filePath: './local.db' } },
  { id: 'supa5', name: 'Auth Database', type: 'Supabase', status: 'Error', ...connectorMeta.Supabase },
];

export default function DataConnectorsPage() {
  const [connectors, setConnectors] = React.useState<Connector[]>(initialConnectors);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = React.useState(false);
  const [editingConnector, setEditingConnector] = React.useState<Connector | null>(null);
  const { toast } = useToast();

  // TODO: In a real application, fetch connectors from a secure backend API instead of using useState.
  // React.useEffect(() => {
  //   fetch('/api/connectors')
  //     .then(res => res.json())
  //     .then(data => setConnectors(data))
  //     .catch(error => console.error("Failed to fetch connectors:", error));
  // }, []);

  const handleAddConnector = () => {
    setEditingConnector(null); // Ensure we are adding, not editing
    setIsAddEditDialogOpen(true);
  };

  const handleEditConnector = (connector: Connector) => {
    setEditingConnector(connector);
    setIsAddEditDialogOpen(true);
  };

  const handleDeleteConnector = (connectorId: string) => {
    // TODO: In a real application, send a DELETE request to the backend API.
    // fetch(`/api/connectors/${connectorId}`, { method: 'DELETE' })
    //   .then(response => {
    //     if (!response.ok) throw new Error('Failed to delete');
    //     setConnectors(prev => prev.filter(c => c.id !== connectorId));
    //     toast({ title: "Connector Deleted", description: "The connector has been removed." });
    //   })
    //   .catch(error => {
    //     console.error("Failed to delete connector:", error);
    //     toast({ title: "Error", description: "Could not delete the connector.", variant: "destructive" });
    //   });

    // --- State-based implementation ---
    setConnectors(prev => prev.filter(c => c.id !== connectorId));
    toast({ title: "Connector Deleted", description: "The connector has been removed." });
    // ---------------------------------
  };

  const handleFormSubmit = (values: ConnectorFormValues) => {
    const connectorData = {
      ...values,
      id: editingConnector?.id || `conn-${Date.now()}`, // Generate ID if new
      status: 'Disconnected' as Connector['status'], // Default status for new/edited
      ...connectorMeta[values.type], // Get icon and color based on type
    };

    if (editingConnector) {
        // TODO: In a real app, send PUT/PATCH request to `/api/connectors/${editingConnector.id}`
        // fetch(`/api/connectors/${editingConnector.id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(connectorData) })
        // .then(res => { if (!res.ok) throw new Error('Update failed'); return res.json(); })
        // .then(updatedConnector => {
        //     setConnectors(prev => prev.map(c => (c.id === updatedConnector.id ? updatedConnector : c)));
        //     toast({ title: "Connector Updated", description: `${values.name} has been updated.` });
        // })
        // .catch(err => toast({ title: "Error", description: "Failed to update connector.", variant: "destructive" }));

        // --- State-based implementation ---
        setConnectors(prev => prev.map(c => (c.id === connectorData.id ? connectorData : c)));
        toast({ title: "Connector Updated", description: `${values.name} has been updated.` });
        // ---------------------------------
    } else {
        // TODO: In a real app, send POST request to `/api/connectors`
        // fetch(`/api/connectors`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(connectorData) })
        // .then(res => { if (!res.ok) throw new Error('Add failed'); return res.json(); })
        // .then(newConnector => {
        //     setConnectors(prev => [...prev, newConnector]);
        //     toast({ title: "Connector Added", description: `${values.name} has been added.` });
        // })
        // .catch(err => toast({ title: "Error", description: "Failed to add connector.", variant: "destructive" }));

         // --- State-based implementation ---
         setConnectors(prev => [...prev, connectorData]);
         toast({ title: "Connector Added", description: `${values.name} has been added.` });
         // ---------------------------------
    }
    setIsAddEditDialogOpen(false); // Close dialog on successful submit
    setEditingConnector(null);
  };

   const getStatusBadgeVariant = (status: Connector['status']) => {
    switch (status) {
      case 'Connected': return 'default';
      case 'Disconnected': return 'secondary';
      case 'Error': return 'destructive';
      default: return 'secondary';
    }
  };
   const getStatusBadgeClass = (status: Connector['status']) => {
    switch (status) {
      case 'Connected': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Disconnected': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'Error': return 'bg-red-100 text-red-800 hover:bg-red-200'; // Use destructive variant styles
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Data Connectors</h1>
        <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleAddConnector}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Connector
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                <DialogTitle>{editingConnector ? 'Edit Connector' : 'Add New Connector'}</DialogTitle>
                <DialogDescription>
                    {editingConnector ? 'Update the details for your data source.' : 'Configure a new data source connection.'}
                </DialogDescription>
                </DialogHeader>
                <ConnectorForm
                 onSubmit={handleFormSubmit}
                 defaultValues={editingConnector ? { name: editingConnector.name, type: editingConnector.type, details: editingConnector.details ?? {} } : undefined}
                 onCancel={() => setIsAddEditDialogOpen(false)}
                />
                 {/* Footer is now handled within ConnectorForm */}
            </DialogContent>
        </Dialog>

      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Your Data Sources</CardTitle>
          <CardDescription>Connect and manage various database types to integrate with your AI models.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connectors.map((connector) => {
                const Icon = connector.icon;
                return (
                  <TableRow key={connector.id}>
                    <TableCell><Icon className={`h-6 w-6 ${connector.color}`} /></TableCell>
                    <TableCell className="font-medium">{connector.name}</TableCell>
                    <TableCell>{connector.type}</TableCell>
                    <TableCell>
                       <Badge variant={getStatusBadgeVariant(connector.status)} className={getStatusBadgeClass(connector.status)}>
                        {connector.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                       <Button variant="ghost" size="icon" aria-label={`Edit ${connector.name}`} onClick={() => handleEditConnector(connector)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label={`Delete ${connector.name}`}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the connector configuration for "{connector.name}".
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteConnector(connector.id)} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
               {connectors.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No connectors found. Click "Add New Connector" to get started.
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
