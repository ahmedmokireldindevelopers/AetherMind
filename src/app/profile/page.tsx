// src/app/profile/page.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Camera } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea

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

export default function ProfilePage() {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = React.useState(false); // Track mount status

  // Initialize state with default values first
  const [name, setName] = React.useState<string>('Aether User');
  const [email, setEmail] = React.useState<string>('user@aethermind.ai');
  const [bio, setBio] = React.useState<string>('AI enthusiast and data wrangler.');
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>('https://picsum.photos/100/100'); // Use placeholder initially
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load state from localStorage after component mounts
  React.useEffect(() => {
    setIsMounted(true);
    setName(getInitialState('profile:name', 'Aether User'));
    setEmail(getInitialState('profile:email', 'user@aethermind.ai'));
    setBio(getInitialState('profile:bio', 'AI enthusiast and data wrangler.'));
    setAvatarPreview(getInitialState('profile:avatarPreview', 'https://picsum.photos/100/100'));
  }, []);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Save profile data to localStorage
    try {
        localStorage.setItem('profile:name', JSON.stringify(name));
        localStorage.setItem('profile:email', JSON.stringify(email));
        localStorage.setItem('profile:bio', JSON.stringify(bio));
        if (avatarPreview) { // Only save avatar if it exists
          localStorage.setItem('profile:avatarPreview', JSON.stringify(avatarPreview));
        } else {
             localStorage.removeItem('profile:avatarPreview'); // Remove if cleared
        }
        // TODO: Replace localStorage with actual API call to update user profile on the backend
        console.log('Updating profile (saved to localStorage):', { name, email, bio, avatarPreview });
        toast({
          title: "Profile Updated",
          description: "Your profile details have been saved locally.",
        });
    } catch (error) {
        console.error('Failed to save profile to localStorage:', error);
        toast({
            title: "Error Saving Profile",
            description: "Could not save profile to local storage.",
            variant: "destructive",
        });
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        // Preview updated, user needs to click "Save Changes" to persist
        toast({ title: "Avatar Preview Updated", description: "Click 'Save Changes' to apply." });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Avoid rendering potentially incorrect state before mount
  if (!isMounted) {
      // Optionally return a loading state or null
      return null; // Or a loading indicator
  }

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>

      <form onSubmit={handleProfileUpdate}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your account details. Changes are saved locally.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="relative group flex-shrink-0">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview || undefined} alt={name} />
                   {/* Fallback uses first letter of name or 'U' */}
                   <AvatarFallback>{name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background group-hover:bg-muted"
                  onClick={triggerFileInput}
                  aria-label="Change profile picture"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
                />
              </div>
              <div className="flex-1 space-y-4 w-full">
                 <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    {/* Disable email editing for now, common practice */}
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled/>
                    <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                </div>
              </div>
            </div>


             <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                 {/* Use Textarea for bio */}
                <Textarea
                   id="bio"
                   value={bio}
                   onChange={(e) => setBio(e.target.value)}
                   placeholder="Tell us a little about yourself"
                   rows={3} // Optional: suggest initial height
                 />
            </div>

            <Separator />

            {/* Placeholder for Password Change section */}
            <div>
              <h3 className="text-md font-medium mb-2">Security</h3>
              <Button type="button" variant="outline" disabled>Change Password</Button>
              <p className="text-xs text-muted-foreground mt-1">Password change functionality is not yet implemented.</p>
            </div>

             {/* Save button is placed at the end of the form */}
             <div className="flex justify-end">
                <Button type="submit">Save Changes</Button>
             </div>
          </CardContent>
        </Card>
      </form>

      {/* Placeholder for Linked Accounts or other profile sections */}
      {/* <Card>...</Card> */}
    </div>
  );
}
