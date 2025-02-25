'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, FileJson } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

export default function Header({ title = 'JSON Dashboard' }: HeaderProps) {
  return (
    <header className="border-b border-gray-200/40 bg-white/90 py-3 px-6 backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-lg shadow-sm">
            <FileJson className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">{title}</h1>
        </Link>
        
        <div className="flex items-center space-x-3">
          <Link 
            href="https://jsonpath-plus.github.io/JSONPath/docs/ts/" 
            className="p-2 rounded-full hover:bg-gray-100/80 transition-colors flex items-center gap-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <HelpCircle size={18} className="text-gray-600" />
            <span className="text-sm text-gray-600 hidden md:inline">JSONPath Docs</span>
          </Link>
        </div>
      </div>
    </header>
  );
} 