import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle2, AlertCircle, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock health status - In a real app, fetch this data
const apiHealth = {
  status: 'Healthy',
  lastCheck: new Date().toLocaleString(),
  endpoints: [
    { name: '/api/generate', status: 'Operational' },
    { name: '/api/tags', status: 'Operational' },
    { name: '/api/show', status: 'Operational' },
    { name: '/api/ps', status: 'Degraded Performance' }, // Example
  ]
};

export default function ApiDocsPage() {
  const isHealthy = apiHealth.status === 'Healthy';

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">API Documentation & Health</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Ollama API Reference</CardTitle>
              <CardDescription>Explore the available endpoints for interacting with Ollama.</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <a href="https://github.com/ollama/ollama/blob/main/docs/api.md" target="_blank" rel="noopener noreferrer">
                View Full Docs on GitHub <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Option 1: Embed using an iframe (if possible and allowed) */}
          {/* <iframe src="URL_TO_HOSTED_DOCS_IF_AVAILABLE" className="w-full h-[600px] border rounded-md"></iframe> */}

          {/* Option 2: Basic overview and link */}
          <p className="mb-4 text-sm text-muted-foreground">
            Refer to the official Ollama API documentation on GitHub for detailed information on request/response formats, parameters, and authentication.
          </p>
          <p className="text-sm">Common Endpoints:</p>
          <ul className="list-disc list-inside text-sm space-y-1 my-2 ml-4 text-muted-foreground">
            <li><code>POST /api/generate</code>: Generate text based on a prompt.</li>
            <li><code>GET /api/tags</code>: List locally available models.</li>
            <li><code>POST /api/show</code>: Get details about a specific model.</li>
            <li><code>GET /api/ps</code>: List running models.</li>
            <li><code>POST /api/pull</code>: Download a model from the library.</li>
            {/* Add more as needed */}
          </ul>
          <Button asChild>
             <a href="https://github.com/ollama/ollama/blob/main/docs/api.md" target="_blank" rel="noopener noreferrer">
                Go to Ollama API Docs <ExternalLink className="ml-2 h-4 w-4" />
             </a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Health Check</CardTitle>
          <CardDescription>Monitor the status of the Ollama API endpoints.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            {isHealthy ? (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-500" />
            )}
            <div>
              <p className={`text-lg font-semibold ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                {apiHealth.status}
              </p>
              <p className="text-xs text-muted-foreground">Last check: {apiHealth.lastCheck}</p>
            </div>
          </div>

          <h4 className="text-md font-semibold mb-2">Endpoint Status:</h4>
          <div className="space-y-2">
            {apiHealth.endpoints.map((endpoint) => (
              <div key={endpoint.name} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center space-x-2">
                   <Server className="h-4 w-4 text-muted-foreground" />
                   <code className="text-sm">{endpoint.name}</code>
                </div>

                <Badge variant={endpoint.status === 'Operational' ? 'default' : 'destructive'} className={endpoint.status === 'Operational' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {endpoint.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
