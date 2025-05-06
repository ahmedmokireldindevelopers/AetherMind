'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FolderUp, FileUp, Settings2, Sparkles, Loader2, Trash2 } from "lucide-react";

// Define the structure for a file/folder to be cleaned
interface InputItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number; // Optional size in bytes
  nativeFile?: File; // Store the actual File object
}

// Mock cleaning function - Replace with actual implementation
const performCleaning = async (items: InputItem[], outputFormat: string): Promise<Blob> => {
  console.log('Starting cleaning process for:', items, 'Output format:', outputFormat);
  // Simulate asynchronous work (e.g., API call, complex processing)
  await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate 3 seconds of work

  // --- Placeholder for actual cleaning logic ---
  // 1. Read data from items (potentially using FileReader for files)
  // 2. Apply cleaning rules/transformations based on data format/user settings
  // 3. Format the cleaned data into the selected outputFormat (CSV, JSON, etc.)
  // 4. Create a Blob from the cleaned data
  // --- End Placeholder ---

  const cleanedContent = `Cleaned data for ${items.map(i => i.name).join(', ')}\nFormat: ${outputFormat}\nTimestamp: ${new Date().toISOString()}`;
  const blob = new Blob([cleanedContent], { type: outputFormat === 'json' ? 'application/json' : 'text/csv' });
  console.log('Cleaning complete.');
  return blob;
};


export default function DataCleaningPage() {
  const [inputItems, setInputItems] = React.useState<InputItem[]>([]);
  const [outputFormat, setOutputFormat] = React.useState<string>('csv');
  const [isCleaning, setIsCleaning] = React.useState(false);
  const [cleaningProgress, setCleaningProgress] = React.useState(0); // Progress simulation
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const folderInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newItems: InputItem[] = Array.from(files).map(file => ({
        id: `${file.name}-${file.lastModified}-${file.size}`, // Simple unique ID
        name: file.name,
        type: 'file',
        size: file.size,
        nativeFile: file,
      }));
      setInputItems(prev => [...prev, ...newItems]);
      toast({ title: `${files.length} file(s) added.` });
    }
    // Reset input value to allow selecting the same file again
    if(event.target) event.target.value = '';
  };

  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // The 'webkitdirectory' attribute provides File objects, but the folder structure isn't directly available.
      // We can represent it as a single "folder" item.
      // For simplicity, we use the name of the first file's relative path to guess the folder name.
      const firstFile = files[0];
      const folderName = firstFile.webkitRelativePath.split('/')[0] || 'Selected Folder';

      const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);

      const newItem: InputItem = {
        id: `folder-${folderName}-${Date.now()}`,
        name: folderName,
        type: 'folder',
        size: totalSize,
        // Note: We don't store individual files here for simplicity,
        // actual cleaning would need to process the 'files' list.
      };
      setInputItems(prev => [...prev, newItem]);
      toast({ title: `Folder "${folderName}" added (${files.length} files).` });
    }
     // Reset input value
     if(event.target) event.target.value = '';
  };

  const removeItem = (id: string) => {
    setInputItems(prev => prev.filter(item => item.id !== id));
    toast({ title: "Item removed." });
  };

  const handleStartCleaning = async () => {
    if (inputItems.length === 0) {
      toast({ title: "No data selected", description: "Please upload files or folders to clean.", variant: "destructive" });
      return;
    }

    setIsCleaning(true);
    setCleaningProgress(0);
    toast({ title: "Cleaning Started", description: "Processing your data..." });

    // Simulate progress
    const progressInterval = setInterval(() => {
      setCleaningProgress(prev => {
        const nextProgress = prev + 10;
        if (nextProgress >= 90) { // Stop simulation before actual completion
          clearInterval(progressInterval);
        }
        return nextProgress;
      });
    }, 300); // Update progress every 300ms

    let downloadUrl: string | null = null; // Track object URL for cleanup

    try {
      // --- Call the actual cleaning logic ---
      // In a real app, you'd pass the necessary data (potentially file contents)
      // and configuration to your cleaning function/API.
      const cleanedDataBlob = await performCleaning(inputItems, outputFormat);
      // ------------------------------------

      setCleaningProgress(100); // Mark as complete
      clearInterval(progressInterval); // Ensure interval is cleared

      // Trigger download
      const url = window.URL.createObjectURL(cleanedDataBlob);
      downloadUrl = url; // Store URL for cleanup

      const a = document.createElement('a');
      a.style.display = 'none'; // Hide the element
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `cleaned_data_${timestamp}.${outputFormat}`; // Dynamic filename
      document.body.appendChild(a);
      a.click();

      // Use setTimeout to delay the removal, allowing the click event to process
      setTimeout(() => {
         if (document.body.contains(a)) {
            document.body.removeChild(a);
         }
         if (downloadUrl) {
            window.URL.revokeObjectURL(downloadUrl);
            downloadUrl = null; // Clear stored URL
         }
      }, 100); // Small delay

      toast({ title: "Cleaning Successful", description: "Cleaned data downloaded." });
      setInputItems([]); // Clear input items after successful cleaning and download


    } catch (error: any) {
      console.error("Cleaning error:", error);
      clearInterval(progressInterval); // Clear interval on error
      toast({
        title: "Cleaning Failed",
        description: error.message || "An unexpected error occurred during cleaning.",
        variant: "destructive",
      });
      // Ensure URL is revoked even on error if it was created
      if (downloadUrl) {
         window.URL.revokeObjectURL(downloadUrl);
      }
    } finally {
      setIsCleaning(false);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Data Cleaning</h1>

      <Card>
        <CardHeader>
          <CardTitle>1. Select Data for Cleaning</CardTitle>
          <CardDescription>
            Upload individual files or entire folders containing data in a consistent format (e.g., all CSV, all JSON).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <FileUp className="mr-2 h-4 w-4" /> Upload Files
            </Button>
            <Button type="button" variant="outline" onClick={() => folderInputRef.current?.click()}>
              <FolderUp className="mr-2 h-4 w-4" /> Upload Folder
            </Button>
            {/* Hidden inputs */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              onChange={handleFileChange}
              className="hidden"
              // Add 'accept' attribute if you want to restrict file types, e.g., accept=".csv, .json"
            />
            <input
              type="file"
              ref={folderInputRef}
              onChange={handleFolderChange}
              className="hidden"
              //@ts-ignore - webkitdirectory is non-standard but widely supported
              webkitdirectory="true"
              directory="true"
            />
          </div>

          {inputItems.length > 0 && (
            <div className="mt-4 space-y-2 rounded-md border p-4">
              <h4 className="font-medium">Selected Items:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm max-h-60 overflow-y-auto">
                {inputItems.map(item => (
                  <li key={item.id} className="flex justify-between items-center group">
                     <span>
                        {item.type === 'file' ? <FileUp className="inline h-4 w-4 mr-1 text-muted-foreground" /> : <FolderUp className="inline h-4 w-4 mr-1 text-muted-foreground" />}
                        {item.name} {item.size ? `(${formatBytes(item.size)})` : ''}
                     </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4"/>
                        <span className="sr-only">Remove {item.name}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Configure Cleaning Options</CardTitle>
          <CardDescription>Set parameters for the cleaning process and output.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="output-format">Output Format</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger id="output-format">
                    <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                    {/* Add more formats as needed */}
                    <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                    <SelectItem value="json">JSON (JavaScript Object Notation)</SelectItem>
                    <SelectItem value="parquet" disabled>Parquet (Coming Soon)</SelectItem>
                </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Choose the file format for the cleaned data.</p>
             </div>
              <div className="space-y-2">
                <Label htmlFor="output-location">Output Location</Label>
                <Input id="output-location" value="Downloads Folder (Default)" disabled />
                 <p className="text-xs text-muted-foreground">Cleaned files will be saved to your default browser download location.</p>
                {/* Future enhancement: Allow selecting a specific directory using File System Access API (requires user permission) */}
              </div>
          </div>
            {/* Placeholder for more advanced cleaning rules/settings */}
            <div className="flex items-center space-x-2 mt-4 text-muted-foreground">
                <Settings2 className="h-5 w-5" />
                <p className="text-sm italic">Advanced cleaning rules and structural options (e.g., column mapping, data type conversion) can be configured here in future versions.</p>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Start Cleaning</CardTitle>
          <CardDescription>Initiate the data cleaning process based on your selections.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleStartCleaning} disabled={isCleaning || inputItems.length === 0}>
            {isCleaning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cleaning in Progress...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Start Cleaning Process
              </>
            )}
          </Button>

          {isCleaning && (
            <div className="mt-4 space-y-2">
               <Label>Progress:</Label>
               <Progress value={cleaningProgress} className="w-full" />
               <p className="text-sm text-muted-foreground text-center">{cleaningProgress}% Complete</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
