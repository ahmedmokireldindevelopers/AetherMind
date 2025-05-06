// src/app/dependencies/page.tsx
'use client'; // Add this directive

import * as React from "react"; // Import React for useState and useEffect if needed later
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Copy, Package, ExternalLink } from "lucide-react"; // Added ExternalLink
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast"; // Import useToast

interface DependencyInfo {
  name: string;
  description: string;
  installCommand: string;
  alternatives?: string[];
  docsUrl?: string;
}

const dependencies: DependencyInfo[] = [
  {
    name: "Next.js",
    description: "The React framework for production. Handles routing, rendering (server & client), and optimizations.",
    installCommand: "npx create-next-app@latest",
    docsUrl: "https://nextjs.org/docs",
  },
  {
    name: "React",
    description: "A JavaScript library for building user interfaces. Forms the foundation of the UI.",
    installCommand: "npm install react react-dom",
    alternatives: ["Vue", "Angular", "Svelte"],
    docsUrl: "https://react.dev/",
  },
   {
    name: "TypeScript",
    description: "A typed superset of JavaScript that compiles to plain JavaScript. Enhances code quality and developer experience.",
    installCommand: "npm install --save-dev typescript @types/react @types/node",
    docsUrl: "https://www.typescriptlang.org/docs/",
  },
  {
    name: "Tailwind CSS",
    description: "A utility-first CSS framework for rapidly building custom designs.",
    installCommand: "npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p",
    alternatives: ["Bootstrap", "CSS Modules", "Styled Components"],
    docsUrl: "https://tailwindcss.com/docs",
  },
  {
    name: "Shadcn/ui",
    description: "Reusable UI components built using Radix UI and Tailwind CSS. Provides building blocks like Buttons, Cards, Dialogs, etc.",
    installCommand: "npx shadcn-ui@latest init",
    alternatives: ["Material UI (MUI)", "Ant Design", "Chakra UI"],
    docsUrl: "https://ui.shadcn.com/docs",
  },
   {
    name: "Lucide React",
    description: "A comprehensive library of simply beautiful open-source icons.",
    installCommand: "npm install lucide-react",
    alternatives: ["Heroicons", "Font Awesome", "Material Icons"],
    docsUrl: "https://lucide.dev/guide/packages/lucide-react",
  },
  {
    name: "Genkit",
    description: "An open-source framework from Google to build, deploy, and monitor production-ready AI flows.",
    installCommand: "npm install genkit @genkit-ai/googleai", // Example, might need more specific plugins
    alternatives: ["LangChain", "LlamaIndex"],
    docsUrl: "https://firebase.google.com/docs/genkit",
  },
  {
    name: "Zod",
    description: "TypeScript-first schema declaration and validation library. Used for validating form inputs and API responses.",
    installCommand: "npm install zod",
    alternatives: ["Yup", "Joi"],
    docsUrl: "https://zod.dev/",
  },
   {
    name: "React Hook Form",
    description: "Performant, flexible and extensible forms with easy-to-use validation.",
    installCommand: "npm install react-hook-form @hookform/resolvers",
    alternatives: ["Formik"],
    docsUrl: "https://react-hook-form.com/get-started",
  },
  {
    name: "Archiver",
    description: "Node.js library for creating archive files (like zip). Used for project export.",
    installCommand: "npm install archiver",
    docsUrl: "https://www.archiverjs.com/",
   },
   {
    name: "Recharts",
    description: "A composable charting library built on React components. Used for monitoring graphs.",
    installCommand: "npm install recharts",
    alternatives: ["Chart.js", "Nivo"],
    docsUrl: "https://recharts.org/en-US/",
   },
];

export default function DependenciesPage() {
  const { toast } = useToast(); // Use the toast hook

  // Helper to copy text to clipboard (now inside the Client Component)
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied!", description: "Install command copied to clipboard." });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
       toast({ title: "Error", description: "Failed to copy text.", variant: "destructive" });
    });
  };

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Project Dependencies</h1>
      <p className="text-muted-foreground">
        This project relies on several key libraries and frameworks. Below is an overview of the core dependencies,
        their purpose, and how to install them if you were setting up the project manually.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dependencies.map((dep) => (
          <Card key={dep.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {dep.name}
              </CardTitle>
              <CardDescription>{dep.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-1 text-sm font-medium">Installation Command</h4>
                 {/* Use ps/pe for padding */}
                <div className="flex items-center space-x-2 rounded-md bg-muted p-2 ps-2 pe-1"> {/* Adjusted padding */}
                  <Code className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <code className="flex-grow overflow-x-auto text-xs font-mono">{dep.installCommand}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={() => copyToClipboard(dep.installCommand)} // onClick is now allowed
                    aria-label={`Copy install command for ${dep.name}`}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {dep.alternatives && dep.alternatives.length > 0 && (
                <div>
                  <h4 className="mb-1 text-sm font-medium">Common Alternatives</h4>
                  <div className="flex flex-wrap gap-1">
                    {dep.alternatives.map((alt) => (
                      <Badge key={alt} variant="secondary">{alt}</Badge>
                    ))}
                  </div>
                </div>
              )}
               {dep.docsUrl && (
                 <div>
                     <Button variant="outline" size="sm" asChild>
                        <a href={dep.docsUrl} target="_blank" rel="noopener noreferrer">
                             {/* Use ms for margin-start */}
                            View Docs <ExternalLink className="ms-1 h-3 w-3" /> {/* Changed ml-1 to ms-1 */}
                        </a>
                    </Button>
                 </div>
               )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
