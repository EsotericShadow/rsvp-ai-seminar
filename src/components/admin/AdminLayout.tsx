import React from 'react';
import AdminNavigation from './AdminNavigation';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
}

export default function AdminLayout({ children, title, subtitle, badge }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950 text-neutral-100">
      <AdminNavigation />
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-3 py-8 sm:px-4 sm:py-12 lg:px-8">
        <header className="space-y-2">
          {badge && (
            <p className="text-xs uppercase tracking-[0.35em] text-primary-300/80">{badge}</p>
          )}
          <h1 className="text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">{title}</h1>
          {subtitle && (
            <p className="text-sm text-neutral-300 sm:text-base">{subtitle}</p>
          )}
        </header>

        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
