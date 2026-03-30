import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  topBar?: React.ReactNode;
}

/**
 * Application shell providing the top bar + optional sidebar + main content layout.
 */
export default function AppShell({ children, sidebar, topBar }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      {topBar}
      <div className="flex flex-1 overflow-hidden">
        {sidebar && (
          <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto hidden lg:block">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
