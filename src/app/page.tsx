import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Database, BrainCircuit, Share2, Activity, BookOpen } from "lucide-react";
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Connected Databases
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Vector, JSON, Mongo, SQLite, Supabase
            </p>
             <Button variant="link" size="sm" className="p-0 h-auto mt-2" asChild>
               <Link href="/data-connectors">Manage Connectors</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Managed AI Models
            </CardTitle>
            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              PyTorch, TensorFlow, JAX models
            </p>
             <Button variant="link" size="sm" className="p-0 h-auto mt-2" asChild>
               <Link href="/model-management">Manage Models</Link>
            </Button>
          </CardContent>
        </Card>
        {/* Removed extra closing </Card> tag that was here */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Sync Status</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Synced</div>
            <p className="text-xs text-muted-foreground">
              Last sync: 5 minutes ago
            </p>
             <Button variant="link" size="sm" className="p-0 h-auto mt-2" asChild>
               <Link href="/model-sync">View Sync Logs</Link>
            </Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All services operational
            </p>
             <Button variant="link" size="sm" className="p-0 h-auto mt-2" asChild>
               <Link href="/monitoring">View Monitoring</Link>
            </Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Documentation</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-lg font-semibold">Ollama API</div>
             <p className="text-xs text-muted-foreground">
              Access API endpoints and details.
            </p>
             <Button variant="link" size="sm" className="p-0 h-auto mt-2" asChild>
               <Link href="/api-docs">View API Docs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Add more sections like Recent Activity, Quick Actions etc. */}
       <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Perform common tasks quickly.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
           {/* Update links to avoid non-existent '/new' and '/upload' paths unless they are implemented */}
           <Button asChild>
             {/* Link to the main page; adding connectors is handled via dialog there */}
            <Link href="/data-connectors">Add New Connector</Link>
          </Button>
           <Button asChild>
             {/* Link to the main page; uploading models is handled there */}
            <Link href="/model-management">Upload New Model</Link>
          </Button>
           <Button asChild>
              {/* Link to the main page; triggering sync is handled there */}
             <Link href="/model-sync">Trigger Manual Sync</Link>
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
