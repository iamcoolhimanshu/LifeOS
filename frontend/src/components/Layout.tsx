import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useSearchStore } from '../stores/useSearchStore';
import { SearchOverlay } from './SearchOverlay';
import { AIChatWidget } from './AIChatWidget';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isSearchOpen = useSearchStore((state) => state.isSearchOpen);
  const isChatOpen = useSearchStore((state) => state.isChatOpen);

  return (
    <div className="flex h-screen w-screen bg-transparent overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Content body */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}

          {/* Floating AI Chat Assistant Panel */}
          {isChatOpen && <AIChatWidget />}
        </main>
      </div>

      {/* Universal Search Dialog Dialog */}
      {isSearchOpen && <SearchOverlay />}
    </div>
  );
};
