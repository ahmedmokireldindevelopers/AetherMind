// src/app/terminal/page.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal as TerminalIcon, ChevronRight, Loader2, ServerCrash } from 'lucide-react'; // Assuming LTR layout for ChevronRight
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { runCommand } from '@/services/command-runner'; // Assuming this service exists

interface OutputLine {
  id: number;
  type: 'input' | 'output' | 'error';
  text: string;
}

export default function TerminalPage() {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState<OutputLine[]>([]);
  const [history, setHistory] = React.useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState<number>(-1);
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Scroll to bottom when output updates
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
  }, [output]);

  // Focus input on load
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addOutputLine = (type: OutputLine['type'], text: string) => {
    setOutput((prev) => [...prev, { id: Date.now() + Math.random(), type, text }]);
  };

  const handleCommandSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const command = input.trim();
    if (!command || isLoading) return;

    setIsLoading(true);
    addOutputLine('input', command);
    setInput('');

    // Add to history if it's not the same as the last command
    if (history.length === 0 || history[history.length - 1] !== command) {
      setHistory((prev) => [...prev, command]);
    }
    setHistoryIndex(-1); // Reset history index

    try {
      // ---- Call the backend service to run the command ----
      // WARNING: Running arbitrary commands is dangerous.
      // This requires a secure backend implementation that sandboxes execution
      // and validates allowed commands.
      const result = await runCommand(command);
      // ----------------------------------------------------

      // Display stdout
      if (result.stdout) {
        result.stdout.split('\n').forEach(line => addOutputLine('output', line));
      }
      // Display stderr
      if (result.stderr) {
         result.stderr.split('\n').forEach(line => addOutputLine('error', line));
      }
      if (!result.stdout && !result.stderr) {
          // Optionally show a success message if there was no output
          // addOutputLine('output', `Command executed successfully.`);
      }

    } catch (error: any) {
      console.error('Command execution error:', error);
      addOutputLine('error', `Error: ${error.message || 'Failed to execute command.'}`);
      toast({
        title: 'Command Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      // Refocus input after command execution
      inputRef.current?.focus();
    }
  };

   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
     if (history.length === 0) return;

     if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex] || '');
     } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex === -1 || historyIndex === history.length - 1) {
            setHistoryIndex(-1);
            setInput('');
        } else {
             const newIndex = Math.min(history.length - 1, historyIndex + 1);
            setHistoryIndex(newIndex);
            setInput(history[newIndex] || '');
        }
     }
   };

  return (
    <div className="flex flex-col space-y-6 h-[calc(100vh-120px)]"> {/* Adjust height as needed */}
      <h1 className="text-3xl font-bold tracking-tight flex-shrink-0">Terminal</h1>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Command Runner</CardTitle>
          <CardDescription>
            Execute predefined project scripts and commands. Use with caution.
            Allowed commands: `npm install`, `npm run build`, `git status`. (Example restrictions)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Terminal Output Area */}
          <ScrollArea className="flex-1 bg-muted/50 p-4" ref={scrollAreaRef}>
            <pre className="text-xs font-mono whitespace-pre-wrap break-words">
              {output.map((line) => (
                <div key={line.id} className={cn(
                   'flex items-start',
                   line.type === 'input' ? 'text-primary' : '',
                   line.type === 'error' ? 'text-destructive' : '',
                   line.type === 'output' ? 'text-foreground' : ''
                 )}>
                   {/* Use ms for margin-start */}
                   {line.type === 'input' && <ChevronRight className="h-3 w-3 ms-1 mt-0.5 flex-shrink-0" />} {/* Changed mr-1 to ms-1 */}
                   {line.type === 'error' && <ServerCrash className="h-3 w-3 ms-1 mt-0.5 flex-shrink-0 text-destructive"/>} {/* Changed mr-1 to ms-1 */}
                   <span>{line.text}</span>
                 </div>
              ))}
              {isLoading && (
                 <div className="flex items-center text-muted-foreground">
                    {/* Use ms for margin-start */}
                    <Loader2 className="h-3 w-3 ms-1 animate-spin" /> {/* Changed mr-1 to ms-1 */}
                    <span>Running...</span>
                 </div>
              )}
            </pre>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t flex-shrink-0">
            <form onSubmit={handleCommandSubmit} className="flex items-center gap-2">
               <TerminalIcon className="h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown} // Handle history navigation
                placeholder="Enter command (e.g., npm install)..."
                className="flex-1 font-mono text-sm h-9"
                disabled={isLoading}
                autoComplete="off"
                spellCheck="false"
              />
              <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Run'}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
