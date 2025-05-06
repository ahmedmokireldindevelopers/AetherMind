// src/app/export-project/page.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ExportProjectPage() {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);
    let downloadUrl: string | null = null; // Keep track of the object URL for cleanup

    try {
      const response = await fetch('/api/download-project');

      if (!response.ok) {
        let errorMsg = `Failed to download project: ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
        } catch (e) {
            // Ignore if response is not JSON
        }
        throw new Error(errorMsg);
      }

      // Get filename from Content-Disposition header
      const disposition = response.headers.get('Content-Disposition');
      let filename = 'aethermind-project.zip'; // Default filename
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      downloadUrl = url; // Store the URL for cleanup

      const a = document.createElement('a');
      a.style.display = 'none'; // Prevent display
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Use setTimeout to delay the removal, allowing the click event to process
      setTimeout(() => {
        if (document.body.contains(a)) {
             document.body.removeChild(a);
        }
        if (downloadUrl) {
             window.URL.revokeObjectURL(downloadUrl);
             downloadUrl = null; // Clear the stored URL
        }
      }, 100); // Small delay

      toast({
        title: "Download Started",
        description: "Your project files are being downloaded.",
      });

    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: error.message || "An unexpected error occurred during download.",
        variant: "destructive",
      });
       // Ensure URL is revoked even on error if it was created
      if (downloadUrl) {
           window.URL.revokeObjectURL(downloadUrl);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Export Project</h1>

      <Card>
        <CardHeader>
          <CardTitle>Download Project Files</CardTitle>
          <CardDescription>
            Compress and download all project files, including source code, configuration, and libraries.
            This allows you to easily transfer the project to another device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Click the button below to generate a compressed archive (.zip) of the entire AetherMind project.
            This includes:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
            <li>Source code (Next.js app, components, pages, AI flows)</li>
            <li>Configuration files (package.json, tsconfig.json, etc.)</li>
            <li>UI components and styles</li>
            <li>Dependency lists (node_modules will be excluded for smaller size, run `npm install` on the target device)</li>
          </ul>
          <p className="text-sm font-semibold">
            Note: Local data stored on your device (e.g., downloaded models not managed by the app, localStorage settings) will not be included.
          </p>

          <Button onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Compressing & Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Project (.zip)
              </>
            )}
          </Button>

          <div className="flex items-center space-x-2 p-3 border border-yellow-300 bg-yellow-50 rounded-md">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <p className="text-sm text-yellow-700">
              This process might take a few moments depending on the project size. Please do not navigate away from this page while the download is in progress.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
