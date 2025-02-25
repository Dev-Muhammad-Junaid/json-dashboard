'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileJson, 
  Home, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
  collapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, path, active, collapsed }) => {
  return (
    <Link 
      href={path} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm' 
          : 'hover:bg-gray-100/80 text-gray-700'
      }`}
      title={collapsed ? label : undefined}
    >
      <span className={`${active ? 'text-blue-600' : 'text-gray-500'}`}>
        {icon}
      </span>
      {!collapsed && (
        <span className={`font-medium ${active ? 'font-semibold' : ''}`}>{label}</span>
      )}
      {active && !collapsed && (
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-auto"></div>
      )}
    </Link>
  );
};

export default function Sidebar({ activePath = '/' }: { activePath?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  
  const menuItems = [
    { icon: <Home size={18} />, label: 'Dashboard', path: '/' },
    { icon: <FileJson size={18} />, label: 'JSON Data', path: '/json' },
    { icon: <BarChart3 size={18} />, label: 'Performance', path: '/performance' },
  ];

  return (
    <div 
      className={`flex flex-col h-full bg-white/90 border-r border-gray-200/40 ${
        collapsed ? 'w-16' : 'w-64'
      } p-4 backdrop-blur-sm transition-all duration-300 ease-in-out relative`}
    >
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-12 p-1 bg-white rounded-full shadow-md border border-gray-200 z-10 hover:bg-gray-50"
      >
        {collapsed ? 
          <ChevronRight size={14} className="text-gray-600" /> : 
          <ChevronLeft size={14} className="text-gray-600" />
        }
      </button>
      
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-4'} py-5`}>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-md">
              <FileJson className="text-white" size={collapsed ? 18 : 20} />
            </div>
            {!collapsed && <h1 className="text-xl font-bold text-gray-900 tracking-tight">JSON Dashboard</h1>}
          </div>
          
          <div className="mt-8 flex flex-col gap-2">
            {!collapsed && (
              <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Main Menu
              </div>
            )}
            {menuItems.map((item) => (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                active={activePath === item.path}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>
        
        {!collapsed && (
          <div className="mt-auto">
            <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Support
            </div>
            <SidebarItem 
              icon={<HelpCircle size={18} />} 
              label="Help & Support" 
              path="https://jsonpath-plus.github.io/JSONPath/docs/ts/"
              active={false} 
              collapsed={collapsed}
            />
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mx-2 mt-6">
              <div className="text-sm font-medium text-gray-800">Need assistance?</div>
              <div className="text-xs text-gray-600 mt-1">Check our documentation for JSONPath examples</div>
              <button 
                className="mt-3 text-xs bg-white text-blue-600 px-3 py-1.5 rounded-lg font-medium shadow-sm hover:shadow transition-all"
                onClick={() => window.open("https://jsonpath-plus.github.io/JSONPath/docs/ts/", "_blank")}
              >
                View Docs
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 