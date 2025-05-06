// src/components/ui/breadcrumbs.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react'; // Assuming LTR layout, adjust icon if needed for RTL

import { cn } from '@/lib/utils';

// Function to generate breadcrumb segments from the pathname
const generateBreadcrumbs = (pathname: string | null) => {
  if (!pathname) return [];

  const pathSegments = pathname.split('/').filter(segment => segment);
  const breadcrumbs = [{ href: '/', label: 'Home' }]; // Always start with Home

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    // Capitalize the first letter and replace dashes with spaces
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    breadcrumbs.push({
      href: currentPath,
      label: label,
    });
  });

  return breadcrumbs;
};


export function Breadcrumbs({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  if (breadcrumbs.length <= 1) { // Only show breadcrumbs if there's more than just "Home"
     // Optionally render a default title if no breadcrumbs besides Home
     // return <span className="font-semibold text-foreground">Dashboard</span>;
      return <span className="font-semibold text-foreground">{breadcrumbs[0]?.label || 'AetherMind'}</span>; // Show 'Home' or App name
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm', className)} {...props}>
      <ol className="flex items-center space-x-1 text-muted-foreground">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center">
            {index > 0 && (
               // Use ChevronRight for LTR, consider ChevronLeft for RTL if direction changes
              <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" /> // mx-1 for horizontal margin
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-semibold text-foreground" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground hover:underline">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
