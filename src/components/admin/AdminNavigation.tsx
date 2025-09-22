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
    <nav className="bg-white border-b border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 shadow-sm">
      <div className="container mx-auto">
        <div className="flex space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
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
