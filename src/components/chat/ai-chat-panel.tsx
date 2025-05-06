// src/components/chat/ai-chat-panel.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Keep Card for structure
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2, User, Bot, Paperclip, Database, FileText } from 'lucide-react'; // Added Paperclip, Database
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { sendMessageToAI, ChatMessageInput, AgentType } from '@/ai/flows/chat-flow'; // Assuming the flow exists

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  fileName?: string; // Optional: display file name if attached by user
}

// Note: This component assumes it will be placed within a container that provides appropriate height.
// For example, when used inside a SheetContent with flex-col.
export default function AiChatPanel() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fileDataUri, setFileDataUri] = React.useState<string | null>(null);
  const [agentType, setAgentType] = React.useState<AgentType>('general'); // Default agent type
  const { toast } = useToast();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages update
  React.useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      const viewport = scrollArea.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        requestAnimationFrame(() => {
           viewport.scrollTop = viewport.scrollHeight;
        });
      }
    }
  }, [messages]);

  // Convert file to Data URI when selected
  React.useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileDataUri(reader.result as string);
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast({ title: "Error reading file", variant: "destructive" });
        setSelectedFile(null); // Clear selection on error
        setFileDataUri(null);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFileDataUri(null); // Clear URI if no file selected
    }
  }, [selectedFile, toast]);

  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return; // Need either text or file

    const userMessageContent = input.trim();
    const messageId = `user-${Date.now()}`;

    const userMessage: Message = {
      id: messageId,
      role: 'user',
      content: userMessageContent,
      fileName: selectedFile?.name, // Include filename if file exists
    };

    // Add user message optimistically
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSelectedFile(null); // Clear file selection after sending
    setFileDataUri(null); // Clear data URI
    setIsLoading(true);

    try {
      const historyToSend = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

      const flowInput: ChatMessageInput = {
        message: userMessageContent,
        history: historyToSend,
        agentType: agentType, // Pass selected agent type
        fileDataUri: fileDataUri || undefined, // Pass data URI if it exists
      };

      const aiResponse = await sendMessageToAI(flowInput);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponse.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error('Error sending message to AI:', error);
      toast({
        title: 'Error',
        description: `Failed to get response from AI: ${error.message || 'Please try again.'}`,
        variant: 'destructive',
      });
      // Remove the user's message if the AI failed to respond
      setMessages((prev) => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
       document.getElementById('chat-input')?.focus();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        // Optional: Add file size/type validation here
        setSelectedFile(file);
        toast({ title: "File selected", description: file.name });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
     <div className="flex flex-col h-full bg-card text-card-foreground">
        {/* Header with Agent Selection */}
        <div className="p-4 border-b flex justify-between items-center">
           <div>
                <h2 className="text-lg font-semibold">AI Chat Assistant</h2>
                <p className="text-sm text-muted-foreground">
                    Mode: {agentType === 'database' ? 'Database Expert' : 'General Assistant'}
                </p>
           </div>
           <Select value={agentType} onValueChange={(value: AgentType) => setAgentType(value)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Agent Mode" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="general">General Assistant</SelectItem>
                    <SelectItem value="database">Database Expert</SelectItem>
                    {/* Add more agent types as needed */}
                </SelectContent>
            </Select>
        </div>

        {/* Chat messages area */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4 pr-4">
                {messages.map((message) => (
                <div
                    key={message.id}
                    className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : ''
                    )}
                >
                    {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 border">
                        <AvatarFallback>{agentType === 'database' ? <Database className="h-4 w-4" /> : <Bot className="h-4 w-4" />}</AvatarFallback>
                    </Avatar>
                    )}
                    <div
                      className={cn(
                          'rounded-lg p-3 text-sm max-w-[85%] break-words', // Added break-words
                          message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {/* Render message content */}
                      {message.content.split('\n').map((line, i, arr) => (
                          <React.Fragment key={i}>
                              {line}
                              {i < arr.length - 1 && <br />}
                          </React.Fragment>
                      ))}
                      {/* Display attached file name for user messages */}
                      {message.role === 'user' && message.fileName && (
                          <div className="mt-2 pt-2 border-t border-primary-foreground/30 flex items-center gap-1 text-xs opacity-80">
                              <FileText className="h-3 w-3" />
                              <span>{message.fileName}</span>
                          </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                    <Avatar className="h-8 w-8 border">
                        <AvatarImage src="https://picsum.photos/100/100" alt="User" />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    )}
                </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 border">
                         <AvatarFallback>{agentType === 'database' ? <Database className="h-4 w-4" /> : <Bot className="h-4 w-4" />}</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 text-sm bg-muted flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>
                        <span className="text-muted-foreground italic">Thinking...</span>
                    </div>
                    </div>
                )}
                 {messages.length === 0 && !isLoading && (
                    <div className="text-center text-sm text-muted-foreground py-10">
                        Start the conversation by typing your message below.
                    </div>
                )}
            </div>
        </ScrollArea>

        {/* Input area */}
        <div className="p-4 border-t space-y-2">
            {/* Display selected file */}
            {selectedFile && (
                <div className="flex items-center justify-between text-xs bg-muted p-2 rounded">
                    <span className="truncate">Selected: {selectedFile.name}</span>
                    <Button variant="ghost" size="sm" className="h-auto p-1" onClick={() => setSelectedFile(null)}>Clear</Button>
                </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" onClick={triggerFileInput} disabled={isLoading}>
                    <Paperclip className="h-4 w-4" />
                    <span className="sr-only">Attach file</span>
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    // Add accept attribute if needed: accept=".txt,.csv,.json,.pdf,image/*"
                />
                <Input
                    id="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message or attach a file..."
                    className="flex-1"
                    disabled={isLoading}
                    autoComplete="off"
                />
                <Button type="submit" size="icon" disabled={isLoading || (!input.trim() && !selectedFile)}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only">Send message</span>
                </Button>
            </form>
        </div>
    </div>
  );
}
