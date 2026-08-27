// src/components/NavBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Stock In', href: '/stock-in' },
    { name: 'Stock Out', href: '/stock-out' },
    { name: 'Reports', href: '/reports' },
    { name: 'Settings', href: '/settings' }, // <-- Dashboard removed, Settings added
  ];

  return (
    <nav className="flex justify-between items-center p-6 border-b border-white/20">
      <div className="text-2xl font-bold tracking-tight">
        Echo <span className="text-indigo-400">Menswear</span>
      </div>
      <div className="space-x-6 hidden md:block">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`transition ${
              pathname === item.href
                ? 'text-indigo-400 font-semibold'
                : 'text-white hover:text-indigo-300'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}