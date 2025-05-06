import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a standard modern font
import Link from 'next/link';
import {
  LayoutDashboard,
  Database,
  BrainCircuit,
  Share2,
  BookOpen,
  Activity,
  Settings,
  DatabaseZap, // Use for Vector DB
  FileJson, // Use for JSON
  Box, // Generic for Supabase/SQLite/Mongo if specific icons not available
  Cpu, // for JAX
  Layers3, // for PyTorch
  Atom, // for TensorFlow
  Package, // Added for Dependencies
  User, // Added for User Profile
  Download, // Added for Export Project
  WandSparkles, // Added for Data Cleaning
  Plug, // Added for Integrations
  Scale, // Added for Model Comparison
  Terminal, // Added for Terminal/Script Runner
} from 'lucide-react';
import './globals.css';
import { cn } from '@/lib/utils';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Breadcrumbs } from '@/components/ui/breadcrumbs'; // Assuming Breadcrumbs component exists or is created
import AiChatPanel from '@/components/chat/ai-chat-panel'; // Import the Chat Panel

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' }) // Configure Inter font

export const metadata: Metadata = {
  title: {
     default: 'AetherMind',
     template: '%s | AetherMind', // Example template for page titles
  },
  description: 'Unified Data and AI Model Management Platform',
};

// Added Terminal to navItems
const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/data-connectors', label: 'Data Connectors', icon: Database },
  { href: '/model-management', label: 'Model Management', icon: BrainCircuit },
  { href: '/model-comparison', label: 'Model Comparison', icon: Scale },
  { href: '/model-sync', label: 'Model Sync', icon: Share2 },
  { href: '/data-cleaning', label: 'Data Cleaning', icon: WandSparkles },
  { href: '/integrations', label: 'Integrations', icon: Plug },
  { href: '/terminal', label: 'Terminal', icon: Terminal }, // Added Terminal
  { href: '/dependencies', label: 'Dependencies', icon: Package },
  { href: '/api-docs', label: 'API Docs', icon: BookOpen },
  { href: '/monitoring', label: 'Monitoring', icon: Activity },
  { href: '/export-project', label: 'Export Project', icon: Download },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning dir="ltr">{/* Added dir="ltr", removed whitespace after tag */}
      <body className={cn(inter.variable, 'font-sans antialiased')}>
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              {/* Use ms-auto for margin-start auto based on direction */}
              <div className="flex items-center gap-2 p-2">
                <BrainCircuit className="w-6 h-6 text-primary" />
                <h1 className="text-lg font-semibold tracking-tight">AetherMind</h1>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <Link href={item.href} legacyBehavior passHref>
                      <SidebarMenuButton
                        tooltip={item.label}
                        // Add logic here later to determine isActive based on current route
                        // isActive={pathname === item.href} // Use usePathname hook in a client component wrapper if needed
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                   <Link href="/settings" legacyBehavior passHref>
                      <SidebarMenuButton tooltip="Settings">
                        <Settings />
                        <span>Settings</span>
                      </SidebarMenuButton>
                   </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                   <Link href="/profile" legacyBehavior passHref>
                      <SidebarMenuButton tooltip="User Profile">
                        <Avatar className="w-6 h-6">
                          {/* TODO: Replace with dynamic user avatar */}
                          <AvatarImage src="https://picsum.photos/100/100" alt="User Avatar" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <span>User Profile</span>
                      </SidebarMenuButton>
                   </Link>
                 </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            {/* Main content area now uses flex to position content and chat */}
            <div className="flex flex-1 h-full">
                {/* Main content area */}
                <div className="flex-1 flex flex-col overflow-y-auto">
                     {/* Use px-* for horizontal padding */}
                    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="md:hidden" />
                            <Breadcrumbs />
                        </div>
                        {/* Header Actions - Removed AI Chat Trigger */}
                        {/* <div className="flex items-center gap-2"> ... </div> */}
                    </header>
                     {/* Use px-* for horizontal padding */}
                    <main className="flex-1 p-4 sm:px-6 lg:px-8">{children}</main>
                    <Toaster />
                 </div>

                 {/* AI Chat Panel Area - Takes full height and specific width, use border-s for border-start */}
                 <div className="hidden md:flex md:w-[350px] lg:w-[400px] border-s flex-shrink-0"> {/* Changed border-l to border-s */}
                   {/* Ensure AiChatPanel takes full height of its container */}
                   <AiChatPanel />
                 </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
