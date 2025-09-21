'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/campaign', label: 'Campaign Control', icon: '📧' },
    { href: '/admin/templates', label: 'Templates', icon: '📝' },
    { href: '/admin/analytics', label: 'Analytics', icon: '📊' },
  ];

  return (
    <nav className="bg-neutral-900 border-b border-neutral-800">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-neutral-400 hover:text-neutral-300 hover:border-neutral-600'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
