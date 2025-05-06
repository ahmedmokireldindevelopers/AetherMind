'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
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

// Helper function to get initial state from localStorage safely on the client
const getInitialState = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

// Helper function to get initial theme state, handling SSR and system preference
const getInitialThemeState = (): boolean => {
  if (typeof window === 'undefined') {
    return false; // Default to light on server
  }
  try {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) {
          return storedTheme === 'dark';
      }
      // Check system preference if no setting stored
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (error) {
       console.error('Error reading theme from localStorage or media query:', error);
       return false; // Default to light on error
  }
};


export default function SettingsPage() {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = React.useState(false); // Track mount status

  // State for settings - Initialize with defaults first, then update from localStorage on mount
  const [ollamaUrl, setOllamaUrl] = React.useState<string>('http://localhost:11434');
  const [syncNotifications, setSyncNotifications] = React.useState<boolean>(true);
  const [lowSpaceWarnings, setLowSpaceWarnings] = React.useState<boolean>(true);
  const [darkMode, setDarkMode] = React.useState<boolean>(false); // Start with default
  const [usageStats, setUsageStats] = React.useState<boolean>(false);

   // Load state from localStorage after component mounts
   React.useEffect(() => {
       setIsMounted(true);
       setOllamaUrl(getInitialState('settings:ollamaUrl', 'http://localhost:11434'));
       setSyncNotifications(getInitialState('settings:syncNotifications', true));
       setLowSpaceWarnings(getInitialState('settings:lowSpaceWarnings', true));
       setDarkMode(getInitialThemeState()); // Use specific function for theme
       setUsageStats(getInitialState('settings:usageStats', false));
   }, []);


  // Effect to apply dark mode class and save preference
  React.useEffect(() => {
    // Only run this effect on the client after mounting
    if (!isMounted) return;

    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode, isMounted]);


  const handleSaveChanges = () => {
    // Save settings to localStorage
    try {
        localStorage.setItem('settings:ollamaUrl', JSON.stringify(ollamaUrl));
        localStorage.setItem('settings:syncNotifications', JSON.stringify(syncNotifications));
        localStorage.setItem('settings:lowSpaceWarnings', JSON.stringify(lowSpaceWarnings));
        localStorage.setItem('settings:usageStats', JSON.stringify(usageStats));
        // Dark mode is saved in its own useEffect

        toast({
        title: "Settings Saved",
        description: "Your preferences have been updated.",
        });
    } catch (error) {
         console.error('Failed to save settings to localStorage:', error);
         toast({
            title: "Error Saving Settings",
            description: "Could not save preferences to local storage.",
            variant: "destructive",
         });
    }
    // In a real app, you might send these settings to a backend API
  };

  const handleDeleteLocalData = () => {
    try {
        // Clear relevant localStorage items
        localStorage.removeItem('settings:ollamaUrl');
        localStorage.removeItem('settings:syncNotifications');
        localStorage.removeItem('settings:lowSpaceWarnings');
        localStorage.removeItem('settings:usageStats');
        localStorage.removeItem('theme');
        // Add any other keys related to connector/model data if stored locally
        localStorage.removeItem('connectors'); // Assuming connectors are stored here

        // Optionally reset state to defaults
        setOllamaUrl('http://localhost:11434');
        setSyncNotifications(true);
        setLowSpaceWarnings(true);
        setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        setUsageStats(false);

        toast({
        title: "Local Data Cleared",
        description: "Application data stored in your browser has been removed.",
        variant: "destructive",
        });
    } catch (error) {
        console.error('Failed to delete local data from localStorage:', error);
        toast({
            title: "Error Clearing Data",
            description: "Could not clear local storage data.",
            variant: "destructive",
        });
    }
  };

  // Avoid rendering potentially incorrect state before mount
  if (!isMounted) {
      // Optionally return a loading state or null
      return null; // Or <LoadingSpinner />
  }

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Manage application-wide preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ollama-url">Ollama API URL</Label>
            <Input
              id="ollama-url"
              placeholder="http://localhost:11434"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">The base URL for your Ollama instance.</p>
          </div>

          <Separator />

          <div className="space-y-4">
             <h3 className="text-md font-medium">Notifications</h3>
             <div className="flex items-center justify-between">
                <Label htmlFor="sync-notifications" className="flex flex-col space-y-1">
                    <span>Sync Completion Notifications</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                    Receive notifications when model synchronization completes or fails.
                    </span>
                </Label>
                <Switch
                  id="sync-notifications"
                  checked={syncNotifications}
                  onCheckedChange={setSyncNotifications}
                />
             </div>
             <div className="flex items-center justify-between">
                 <Label htmlFor="low-space-warnings" className="flex flex-col space-y-1">
                    <span>Low Storage Space Warnings</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                    Get warned when connected storage devices are running low on space.
                    </span>
                </Label>
                <Switch
                  id="low-space-warnings"
                  checked={lowSpaceWarnings}
                  onCheckedChange={setLowSpaceWarnings}
                 />
             </div>
          </div>

           <Separator />

           <div className="space-y-4">
             <h3 className="text-md font-medium">Appearance</h3>
              <div className="flex items-center justify-between">
                 <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                    <span>Dark Mode</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                    Enable dark theme for the interface.
                    </span>
                </Label>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                 />
             </div>
           </div>

           <div className="flex justify-end">
             <Button onClick={handleSaveChanges}>Save Changes</Button>
           </div>
        </CardContent>
      </Card>

         <Card>
            <CardHeader>
                <CardTitle>Data & Privacy</CardTitle>
                <CardDescription>Manage data handling and privacy settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center justify-between">
                    <Label htmlFor="usage-stats" className="flex flex-col space-y-1">
                        <span>Anonymous Usage Statistics</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                        Help improve AetherMind by sending anonymous usage data.
                        </span>
                    </Label>
                    <Switch
                      id="usage-stats"
                      checked={usageStats}
                      onCheckedChange={setUsageStats}
                    />
                </div>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete All Local Data</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all application settings and data (like connector configurations) stored locally in your browser.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteLocalData} className="bg-destructive hover:bg-destructive/90">
                            Delete Data
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                 </AlertDialog>
                 <p className="text-xs text-muted-foreground">Warning: This action only affects data stored in this browser. Server-side data (if any) will not be affected.</p>
            </CardContent>
         </Card>

    </div>
  );
}
