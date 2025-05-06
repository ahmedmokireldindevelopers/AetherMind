'use client';

import * as React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Ensure Label is imported if used directly
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Connector } from '../page'; // Import the Connector type
import { DialogFooter, DialogClose } from "@/components/ui/dialog"; // Import DialogClose for cancel


// Define the validation schema using Zod
export const ConnectorSchema = z.object({
  name: z.string().min(1, 'Connector name is required'),
  type: z.enum(['Vector', 'JSON', 'MongoDB', 'SQLite', 'Supabase'], {
    required_error: 'Connector type is required',
  }),
  // Add details specific to each type using discriminated union or optional fields
  details: z.object({
    // Example: Make fields optional based on type
    filePath: z.string().optional(), // For JSON, SQLite
    connectionString: z.string().optional(), // For MongoDB, Vector, Supabase
    apiKey: z.string().optional(), // For Supabase, Vector etc.
    // Add other specific fields as needed
  }).optional().default({}) // Make the whole details object optional
});

export type ConnectorFormValues = z.infer<typeof ConnectorSchema>;

interface ConnectorFormProps {
  onSubmit: (values: ConnectorFormValues) => void;
  defaultValues?: Partial<ConnectorFormValues>; // Allow partial default values for editing
  onCancel: () => void;
}

export function ConnectorForm({ onSubmit, defaultValues, onCancel }: ConnectorFormProps) {
  const form = useForm<ConnectorFormValues>({
    resolver: zodResolver(ConnectorSchema),
    // Ensure defaultValues are correctly structured, especially the nested 'details'
    defaultValues: {
        name: defaultValues?.name || '',
        type: defaultValues?.type,
        details: defaultValues?.details || {},
    },
  });

  const selectedType = form.watch('type');

  // Re-initialize form if defaultValues change (e.g., switching between edit/add)
  React.useEffect(() => {
      form.reset({
        name: defaultValues?.name || '',
        type: defaultValues?.type,
        details: defaultValues?.details || {},
      });
  }, [defaultValues, form]);


  const renderDetailsFields = (type: Connector['type'] | undefined) => {
    if (!type) return null;

    switch (type) {
      case 'JSON':
      case 'SQLite':
        return (
          <FormField
            control={form.control}
            name="details.filePath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>File Path</FormLabel>
                <FormControl>
                  <Input placeholder="/path/to/your/file.json or ./database.db" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case 'MongoDB':
        return (
          <FormField
            control={form.control}
            name="details.connectionString"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Connection String</FormLabel>
                <FormControl>
                  <Input placeholder="mongodb+srv://<user>:<password>@cluster..." {...field} value={field.value ?? ''} />
                </FormControl>
                 <FormMessage />
              </FormItem>
            )}
          />
        );
       case 'Supabase':
        return (
          <>
            <FormField
              control={form.control}
              name="details.connectionString" // Often a project URL
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://<your-project-ref>.supabase.co" {...field} value={field.value ?? ''} />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="details.apiKey" // Service role or anon key
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key (anon or service_role)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="eyJhbGciOi..." {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        case 'Vector': // Example for a generic Vector DB
         return (
           <>
             <FormField
               control={form.control}
               name="details.connectionString" // Could be an endpoint URL
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Database Endpoint / URL</FormLabel>
                   <FormControl>
                     <Input placeholder="https://your-vector-db.example.com:19530" {...field} value={field.value ?? ''} />
                   </FormControl>
                    <FormMessage />
                 </FormItem>
               )}
             />
              <FormField
               control={form.control}
               name="details.apiKey" // Optional API Key
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>API Key (Optional)</FormLabel>
                   <FormControl>
                     <Input type="password" placeholder="vdb-api-key-..." {...field} value={field.value ?? ''} />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
           </>
         );
      default:
        return null; // No specific fields for this type yet
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connector Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., My Production Orders" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connector Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a connector type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Vector">Vector Database</SelectItem>
                  <SelectItem value="JSON">JSON File</SelectItem>
                  <SelectItem value="MongoDB">MongoDB</SelectItem>
                  <SelectItem value="SQLite">SQLite Database</SelectItem>
                  <SelectItem value="Supabase">Supabase</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Render type-specific fields */}
        {renderDetailsFields(selectedType)}

         <DialogFooter>
            <DialogClose asChild>
                 <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={form.formState.isSubmitting}>
             {form.formState.isSubmitting ? 'Saving...' : (defaultValues?.name ? 'Save Changes' : 'Add Connector')}
            </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
