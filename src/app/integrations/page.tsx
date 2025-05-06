
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Import Input
import { ExternalLink, CheckCircle2, XCircle, Loader2, Save, X, ServerCog } from "lucide-react"; // Added ServerCog icon
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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
} from "@/components/ui/alert-dialog";

// Define the structure for an integration
interface Integration {
  id: string;
  name: string;
  description: string;
  logoUrl?: string; // Optional: URL to the platform's logo
  icon?: React.ElementType; // Added for custom icons like ServerCog
  websiteUrl?: string; // Optional website URL
  docsUrl?: string; // Optional: URL to specific API docs
  status: 'connected' | 'disconnected' | 'coming_soon' | 'connecting' | 'disconnecting'; // Added connecting/disconnecting states
  configRequired: boolean; // Indicate if config (API key, URL etc.) is needed
  // Store config securely in a real app (backend/secrets manager). This is for demo purposes only.
  config?: { apiKey?: string; serverUrl?: string }; // Expanded config
  configFields?: { key: keyof NonNullable<Integration['config']>; label: string; placeholder: string; type?: string }[]; // Define config fields
}

// Mock function to simulate saving/validating configuration
// !! IMPORTANT: Replace this with actual API calls to your backend or directly to the service (handle security appropriately) !!
const simulateSaveConfig = async (id: string, config: Integration['config']): Promise<boolean> => {
  console.log(`Simulating save/validate for ${id} with config:`, config);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

  // Basic validation: Check if required fields are present
  const integrationMeta = initialIntegrations.find(int => int.id === id);
  let isValid = true;
  if (integrationMeta?.configFields) {
     integrationMeta.configFields.forEach(field => {
         if (!config?.[field.key] || config[field.key]?.trim().length === 0) {
             console.log(`Validation failed for ${id}: Missing field ${field.key}`);
             isValid = false;
         }
     });
  } else if (integrationMeta?.configRequired && (!config?.apiKey || config.apiKey.trim().length <= 5)) {
      // Fallback for simple API key validation if no specific fields defined
      isValid = false;
      console.log(`Validation failed for ${id}: API Key invalid or missing`);
  }

  console.log(`Validation result for ${id}: ${isValid}`);
  return isValid;
};

// Mock function to simulate disconnecting
// !! IMPORTANT: Replace this with actual API calls if necessary (e.g., invalidating a token) !!
const simulateDisconnect = async (id: string): Promise<boolean> => {
    console.log(`Simulating disconnect for ${id}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Disconnect successful for ${id}`);
    return true;
}

// Initial mock data for integrations - replace with actual state/API data
// Added MCP Server
const initialIntegrations: Integration[] = [
  { id: 'n8n', name: 'n8n', description: 'Workflow automation tool.', logoUrl: '/logos/n8n.svg', websiteUrl: 'https://n8n.io/', docsUrl: 'https://docs.n8n.io/', status: 'disconnected', configRequired: false },
  { id: 'huggingface', name: 'Hugging Face', description: 'Platform for AI models.', logoUrl: '/logos/huggingface.svg', websiteUrl: 'https://huggingface.co/', docsUrl: 'https://huggingface.co/docs', status: 'disconnected', configRequired: true, config: {}, configFields: [{ key: 'apiKey', label: 'API Key', placeholder: 'hf_...' }] },
  { id: 'openrouter', name: 'OpenRouter', description: 'Unified LLM API access.', logoUrl: '/logos/openrouter.svg', websiteUrl: 'https://openrouter.ai/', docsUrl: 'https://openrouter.ai/docs', status: 'disconnected', configRequired: true, config: {}, configFields: [{ key: 'apiKey', label: 'API Key', placeholder: 'sk-or-...' }] },
  { id: 'openai', name: 'OpenAI', description: 'Leading AI research (GPT).', logoUrl: '/logos/openai.svg', websiteUrl: 'https://openai.com/', docsUrl: 'https://platform.openai.com/docs/introduction', status: 'disconnected', configRequired: true, config: {}, configFields: [{ key: 'apiKey', label: 'API Key', placeholder: 'sk-...' }] },
  { id: 'anthropic', name: 'Anthropic (Claude)', description: 'AI safety creators of Claude.', logoUrl: '/logos/anthropic.svg', websiteUrl: 'https://www.anthropic.com/', docsUrl: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api', status: 'disconnected', configRequired: true, config: {}, configFields: [{ key: 'apiKey', label: 'API Key', placeholder: 'sk-ant-...' }] },
  { id: 'gemini', name: 'Google Gemini', description: 'Google\'s powerful AI models.', logoUrl: '/logos/gemini.svg', websiteUrl: 'https://deepmind.google/technologies/gemini/', docsUrl: 'https://ai.google.dev/docs', status: 'connected', configRequired: true, config: { apiKey: 'AIza...' }, configFields: [{ key: 'apiKey', label: 'API Key', placeholder: 'AIza...' }] }, // Pre-connected example
  { id: 'mcp_server', name: 'MCP Server', description: 'Connect to a custom Model Control Panel or server endpoint.', icon: ServerCog, status: 'disconnected', configRequired: true, config: {}, configFields: [{ key: 'serverUrl', label: 'Server URL', placeholder: 'http://localhost:8080' }, { key: 'apiKey', label: 'API Key (Optional)', placeholder: 'mcp-key-...', type: 'password' }] }, // Added MCP Server
  { id: 'replicate', name: 'Replicate', description: 'Run ML models via API.', logoUrl: '/logos/replicate.svg', websiteUrl: 'https://replicate.com/', docsUrl: 'https://replicate.com/docs', status: 'coming_soon', configRequired: true },
];


// Helper to get status badge color
const getStatusClass = (status: Integration['status']) => {
  switch (status) {
    case 'connected': return 'bg-green-100 text-green-800';
    case 'disconnected': return 'bg-gray-100 text-gray-800';
    case 'coming_soon': return 'bg-blue-100 text-blue-800';
    case 'connecting':
    case 'disconnecting': return 'bg-yellow-100 text-yellow-800 animate-pulse';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Helper to get status icon
const getStatusIcon = (status: Integration['status']) => {
  switch (status) {
    case 'connected': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'disconnected': return <XCircle className="h-4 w-4 text-gray-500" />;
    case 'connecting':
    case 'disconnecting': return <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />;
    case 'coming_soon': return null;
    default: return null;
  }
};

// Placeholder Logo Component
const IntegrationLogo = ({ name, url, Icon }: { name: string; url?: string, Icon?: React.ElementType }) => {
  if (Icon) {
     return <Icon className="h-10 w-10 text-muted-foreground" />; // Render custom icon
  }
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={`${name} logo`} className="h-10 w-10 object-contain" onError={(e) => e.currentTarget.style.display = 'none'}/>; // Basic error handling
  }
  // Fallback to initials
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
      {name.substring(0, 2).toUpperCase()}
    </div>
  );
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = React.useState<Integration[]>(initialIntegrations);
  const [editingConfigId, setEditingConfigId] = React.useState<string | null>(null); // Track which integration's config is being edited
  const [currentConfig, setCurrentConfig] = React.useState<Integration['config']>({}); // Temp store for config inputs
  const { toast } = useToast();

  // **IMPORTANT**: The actual connection logic happens in the mock functions `simulateSaveConfig` and `simulateDisconnect`.
  // You MUST replace these with real API calls to your backend or the respective service APIs.
  // Securely handle API keys/config – do not store them directly in frontend state long-term.

  const handleToggleConnection = async (id: string) => {
    const integration = integrations.find(int => int.id === id);
    if (!integration || integration.status === 'coming_soon' || integration.status === 'connecting' || integration.status === 'disconnecting') {
      return;
    }

    // --- Disconnecting ---
    if (integration.status === 'connected') {
        setIntegrations(prev => prev.map(int => int.id === id ? { ...int, status: 'disconnecting' } : int));
        try {
            const success = await simulateDisconnect(id); // Replace with actual disconnect logic
            if (success) {
                setIntegrations(prev => prev.map(int => int.id === id ? { ...int, status: 'disconnected', config: {} } : int)); // Clear config on disconnect
                toast({ title: "Disconnected", description: `${integration.name} integration disconnected.` });
                if (editingConfigId === id) { // Hide input if disconnecting while editing
                    setEditingConfigId(null);
                    setCurrentConfig({});
                }
            } else {
                throw new Error('Disconnect simulation failed'); // Or specific error from API
            }
        } catch (error: any) {
            console.error("Disconnect error:", error);
            setIntegrations(prev => prev.map(int => int.id === id ? { ...int, status: 'connected' } : int)); // Revert status on failure
            toast({ title: "Error", description: `Could not disconnect ${integration.name}: ${error.message || 'Unknown error'}.`, variant: "destructive" });
        }
      return;
    }

    // --- Connecting ---
    if (integration.configRequired) {
      // If config is required and not being edited, show the input form
      if (editingConfigId !== id) {
         setEditingConfigId(id);
         setCurrentConfig(integration.config || {}); // Pre-fill if exists
         return; // Don't change status yet, wait for save
      }
      // If already editing, this toggle shouldn't happen directly (handled by save/cancel)
    } else {
       // Connect directly if no config needed
       setIntegrations(prev => prev.map(int => int.id === id ? { ...int, status: 'connecting' } : int));
       try {
           // Simulate connection (replace with actual logic if needed for non-config integrations)
           await new Promise(resolve => setTimeout(resolve, 1000));
           setIntegrations(prev => prev.map(int => int.id === id ? { ...int, status: 'connected' } : int));
           toast({ title: "Connected", description: `${integration.name} integration connected.` });
       } catch (error: any) {
           console.error("Connection error (no config):", error);
           setIntegrations(prev => prev.map(int => int.id === id ? { ...int, status: 'disconnected' } : int)); // Revert status
            toast({ title: "Error", description: `Could not connect ${integration.name}: ${error.message || 'Unknown error'}.`, variant: "destructive" });
       }
    }
  };

   // Handle changes in the config input fields
   const handleConfigInputChange = (key: keyof NonNullable<Integration['config']>, value: string) => {
       setCurrentConfig(prev => ({ ...prev, [key]: value }));
   };


  const handleSaveConfig = async (id: string) => {
    const integration = integrations.find(int => int.id === id);
    if (!integration) return;

    // Basic check if any required field is empty
    const requiredFields = integration.configFields?.filter(f => !f.label.includes('(Optional)')) ?? [];
    const missingField = requiredFields.find(f => !currentConfig?.[f.key]?.trim());
    if (missingField) {
        toast({ title: "Missing Information", description: `Please enter the ${missingField.label}.`, variant: "destructive"});
        return;
    }

     setIntegrations(prev => prev.map(int => int.id === id ? { ...int, status: 'connecting' } : int));
     setEditingConfigId(null); // Hide input immediately

     try {
        const isValid = await simulateSaveConfig(id, currentConfig); // Replace with actual config validation/saving call

        if (isValid) {
            setIntegrations(prev => prev.map(int => int.id === id ? { ...int, status: 'connected', config: currentConfig } : int));
            toast({ title: "Connected", description: `${integration.name} integration connected successfully.` });
        } else {
            throw new Error('Invalid Configuration'); // Or specific error from API
        }
     } catch (error: any) {
         console.error("Save Config error:", error);
         setIntegrations(prev => prev.map(int => int.id === id ? { ...int, status: 'disconnected' } : int)); // Revert status
         toast({ title: "Connection Failed", description: `Failed to connect ${integration.name}: ${error.message || 'Please check the details and try again.'}`, variant: "destructive" });
     } finally {
        setCurrentConfig({}); // Clear temp config regardless of outcome
     }
  };

   const handleCancelEditConfig = (id: string) => {
        setEditingConfigId(null);
        setCurrentConfig({});
   };

  // Determine if switch should be disabled
  const isSwitchDisabled = (status: Integration['status']) => {
    return status === 'coming_soon' || status === 'connecting' || status === 'disconnecting';
  };

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
      <p className="text-muted-foreground">
        Connect AetherMind with your favorite AI platforms, workflow tools, and servers. Manage configurations and enable/disable integrations.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                 <IntegrationLogo name={integration.name} url={integration.logoUrl} Icon={integration.icon} />
                 <div className="flex flex-col items-end space-y-1">
                      {integration.status !== 'coming_soon' && (
                        <div className="flex items-center space-x-2">
                             {getStatusIcon(integration.status)}
                              <Switch
                                id={`switch-${integration.id}`}
                                checked={integration.status === 'connected' || integration.status === 'disconnecting'} // Checked if connected or in process of disconnecting
                                disabled={isSwitchDisabled(integration.status)}
                                onCheckedChange={() => handleToggleConnection(integration.id)}
                                aria-label={`Toggle ${integration.name} connection`}
                                />
                        </div>
                      )}
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", getStatusClass(integration.status))}>
                        {integration.status.replace('_', ' ')}
                    </span>
                 </div>
              </div>
               <CardTitle className="mt-4">{integration.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between space-y-4">
               <CardDescription>{integration.description}</CardDescription>

               {/* Config Input Section */}
               {editingConfigId === integration.id && integration.configRequired && (
                 <div className="space-y-3 pt-2 border-t">
                    {integration.configFields?.map((field) => (
                        <div key={field.key} className="space-y-1">
                            <Label htmlFor={`${integration.id}-${field.key}`}>{field.label}</Label>
                            <Input
                               id={`${integration.id}-${field.key}`}
                               type={field.type || 'text'}
                               value={currentConfig?.[field.key] || ''}
                               onChange={(e) => handleConfigInputChange(field.key, e.target.value)}
                               placeholder={field.placeholder}
                               className="h-9"
                            />
                        </div>
                    )) ?? (
                         // Fallback for integrations without specific configFields but requiring config (assumed API key)
                        <div className="space-y-1">
                            <Label htmlFor={`${integration.id}-apiKey`}>API Key</Label>
                            <Input
                               id={`${integration.id}-apiKey`}
                               type="password"
                               value={currentConfig?.apiKey || ''}
                               onChange={(e) => handleConfigInputChange('apiKey', e.target.value)}
                               placeholder={`Enter your ${integration.name} API Key`}
                               className="h-9"
                            />
                        </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                         <Button variant="ghost" size="sm" onClick={() => handleCancelEditConfig(integration.id)}>
                             <X className="h-4 w-4 mr-1"/> Cancel
                         </Button>
                        <Button size="sm" onClick={() => handleSaveConfig(integration.id)} disabled={integration.status === 'connecting'}>
                             {integration.status === 'connecting' ? <Loader2 className="h-4 w-4 mr-1 animate-spin"/> : <Save className="h-4 w-4 mr-1"/>}
                            Save & Connect
                        </Button>
                    </div>
                 </div>
               )}

               {/* Action Buttons */}
               <div className="flex flex-wrap gap-2 mt-auto pt-4"> {/* Added mt-auto and pt-4 for spacing */}
                 {integration.websiteUrl && (
                   <Button variant="outline" size="sm" asChild>
                      <a href={integration.websiteUrl} target="_blank" rel="noopener noreferrer">
                          Visit Website <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                   </Button>
                 )}
                 {integration.docsUrl && (
                   <Button variant="ghost" size="sm" asChild>
                      <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer">
                          API Docs <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                 )}
                  {/* Show Configure button only if disconnected and config is required */}
                  {integration.status === 'disconnected' && integration.configRequired && editingConfigId !== integration.id && (
                     <Button size="sm" onClick={() => handleToggleConnection(integration.id)}>
                         Configure
                     </Button>
                  )}
                  {/* Add a disconnect confirmation */}
                   {integration.status === 'connected' && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="destructive" size="sm" disabled={integration.status === 'disconnecting'}>
                                {integration.status === 'disconnecting' ? <Loader2 className="h-4 w-4 mr-1 animate-spin"/> : null}
                                Disconnect
                             </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect {integration.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to disconnect the {integration.name} integration? Configuration details will be removed.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleToggleConnection(integration.id)} className="bg-destructive hover:bg-destructive/90">
                                Disconnect
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                     </AlertDialog>
                   )}
               </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

    