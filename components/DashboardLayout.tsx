'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

export default function DashboardLayout({ children, activePath }: DashboardLayoutProps) {
  const pathname = usePathname();
  const currentPath = activePath || pathname;
  
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <Sidebar activePath={currentPath} />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
        
        <footer className="border-t border-gray-200/50 py-4 px-6 text-center text-sm text-gray-500 backdrop-blur-sm">
          <div className="container mx-auto max-w-7xl flex items-center justify-center">
            <span>JSON Dashboard © {new Date().getFullYear()}</span>
            <span className="mx-2">•</span>
            <span>Powered by JSONPath-Plus</span>
          </div>
        </footer>
      </div>
    </div>
  );
} 