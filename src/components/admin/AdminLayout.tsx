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
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors duration-200">
      <AdminNavigation />
      <div className="container mx-auto flex flex-col gap-8 py-8">
        <header className="space-y-3">
          {badge && (
            <p className="text-xs uppercase tracking-wider text-primary-600 dark:text-primary-400 font-medium">{badge}</p>
          )}
          <h1 className="heading-1">{title}</h1>
          {subtitle && (
            <p className="text-body text-neutral-600 dark:text-neutral-400">{subtitle}</p>
          )}
        </header>

        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
