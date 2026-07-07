import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative flex flex-col min-w-0">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
