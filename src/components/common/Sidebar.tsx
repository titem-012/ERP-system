'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/products', label: 'Products', icon: '👕' },
  { path: '/stock-in', label: 'Stock IN', icon: '📥' },
  { path: '/stock-out', label: 'Stock OUT', icon: '📤' },
  { path: '/adjustments', label: 'Adjustments', icon: '⚖️' },
  { path: '/reports', label: 'Reports', icon: '📈' },
  { path: '/suppliers', label: 'Suppliers', icon: '🏭' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredMenu = menuItems.filter(item => {
    if (user?.role === 'ADMIN') return true;
    if (user?.role === 'CASHIER') return ['/stock-out', '/reports'].includes(item.path);
    return true;
  });

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-lg font-bold border-b border-gray-700">
        Menu
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {filteredMenu.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              pathname === item.path
                ? 'bg-indigo-600 text-white'
                : 'hover:bg-gray-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 text-xs text-gray-400 border-t border-gray-700">
        Logged in as {user?.username}<br />
        Role: {user?.role}
      </div>
    </aside>
  );
}