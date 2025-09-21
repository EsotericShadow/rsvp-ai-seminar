'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/campaign', label: 'Campaign Control', icon: '📧' },
    { href: '/admin/analytics', label: 'Analytics', icon: '📊' },
  ];

  return (
    <nav className="bg-secondary-900/50 backdrop-blur-xl border-b border-secondary-700/50 shadow-lg">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                  isActive
                    ? 'border-primary-500 text-primary-400 bg-primary-900/20'
                    : 'border-transparent text-neutral-300 hover:text-white hover:border-secondary-500 hover:bg-secondary-800/30'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
