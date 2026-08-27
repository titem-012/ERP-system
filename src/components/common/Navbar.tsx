'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { translations } from '@/utils/translations';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, lang, setLang, darkMode, setDarkMode } = useAuth();
  const t = translations[lang];

  // Helper to determine active menu path
  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  // Route helpers based on role
  const getStockInPath = () => {
    if (!user) return '/login';
    return user.role === 'ADMIN' ? '/admin/stock-in' : '/cashier/stock-in';
  };

  const getStockOutPath = () => {
    if (!user) return '/login';
    return user.role === 'ADMIN' ? '/admin/stock-out' : '/cashier/stock-out';
  };

  const getReportsPath = () => {
    if (!user) return '/login';
    return user.role === 'ADMIN' ? '/admin/reports' : '/cashier/reports';
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-colors duration-300 bg-[#FAF7F2] dark:bg-[#0D0806] border-b border-[#E8E0D5] dark:border-[#2D1E14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Branding */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center transition-transform group-hover:scale-105">
              <svg className="w-8 h-8 text-[#A16438] dark:text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3c0 .8.6 1.5 1.4 1.8L3 13.5A1.5 1.5 0 0 0 4.2 16h15.6a1.5 1.5 0 0 0 1.2-2.5L13.6 6.8c.8-.3 1.4-1 1.4-1.8a3 3 0 0 0-3-3z" />
                <path d="M6 16v4a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-4" />
                <line x1="9" y1="11" x2="15" y2="11" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-wide text-[#3D2B1F] dark:text-[#FAF7F2] font-serif uppercase">
                {t.siteTitle}
              </span>
              <span className="text-[10px] tracking-widest text-[#6B4F3C] dark:text-[#A68F80]">
                {t.atelier}
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-[#A16438] ${
                pathname === '/' ? 'text-[#A16438] border-b-2 border-[#A16438] pb-1' : 'text-[#6B4F3C] dark:text-[#A68F80]'
              }`}
            >
              {t.nav.home}
            </Link>
            
            {/* ADMIN LINKS */}
            {user?.role === 'ADMIN' && (
              <>
                <Link
                  href="/admin/stock-in"
                  className={`text-sm font-medium transition-colors hover:text-[#A16438] ${
                    isActive('/admin/stock-in')
                      ? 'text-[#A16438] border-b-2 border-[#A16438] pb-1'
                      : 'text-[#6B4F3C] dark:text-[#A68F80]'
                  }`}
                >
                  {t.nav.stockIn || (lang === 'en' ? 'Stock In' : 'ገቢ እቃ')}
                </Link>
                <Link
                  href="/admin/stock-out"
                  className={`text-sm font-medium transition-colors hover:text-[#A16438] ${
                    isActive('/admin/stock-out')
                      ? 'text-[#A16438] border-b-2 border-[#A16438] pb-1'
                      : 'text-[#6B4F3C] dark:text-[#A68F80]'
                  }`}
                >
                  {t.nav.stockOut || (lang === 'en' ? 'Sale' : 'ሽያጭ')}
                </Link>
              </>
            )}

            {/* CASHIER LINKS */}
            {user?.role === 'CASHIER' && (
              <>
                <Link
                  href="/cashier/stock-in"
                  className={`text-sm font-medium transition-colors hover:text-[#A16438] ${
                    isActive('/cashier/stock-in')
                      ? 'text-[#A16438] border-b-2 border-[#A16438] pb-1'
                      : 'text-[#6B4F3C] dark:text-[#A68F80]'
                  }`}
                >
                  {t.nav.stockIn || (lang === 'en' ? 'Stock In' : 'ገቢ እቃ')}
                </Link>

                <Link
                  href="/cashier/stock-out"
                  className={`text-sm font-medium transition-colors hover:text-[#A16438] ${
                    isActive('/cashier/stock-out')
                      ? 'text-[#A16438] border-b-2 border-[#A16438] pb-1'
                      : 'text-[#6B4F3C] dark:text-[#A68F80]'
                  }`}
                >
                  {t.stockOut?.sale || (lang === 'en' ? 'Sale' : 'ሽያጭ')}
                </Link>
              </>
            )}

            {/* REPORTS LINK (SHARED) */}
            <Link
              href={getReportsPath()}
              className={`text-sm font-medium transition-colors hover:text-[#A16438] ${
                isActive('/admin/reports') || isActive('/cashier/reports')
                  ? 'text-[#A16438] border-b-2 border-[#A16438] pb-1'
                  : 'text-[#6B4F3C] dark:text-[#A68F80]'
              }`}
            >
              {t.nav.reports}
            </Link>

            {/* ADMIN ONLY CASHIERS & SETTINGS LINKS */}
            {user?.role === 'ADMIN' && (
              <>
                <Link
                  href="/admin/cashiers"
                  className={`text-sm font-medium transition-colors hover:text-[#A16438] ${
                    isActive('/admin/cashiers') ? 'text-[#A16438] border-b-2 border-[#A16438] pb-1' : 'text-[#6B4F3C] dark:text-[#A68F80]'
                  }`}
                >
                  {t.nav.cashiers}
                </Link>
                
                <Link
                  href="/admin/settings"
                  className={`text-sm font-medium transition-colors hover:text-[#A16438] ${
                    isActive('/admin/settings') ? 'text-[#A16438] border-b-2 border-[#A16438] pb-1' : 'text-[#6B4F3C] dark:text-[#A68F80]'
                  }`}
                >
                  {lang === 'en' ? 'Settings' : 'ቅንብሮች'}
                </Link>
              </>
            )}
          </nav>

          {/* Action Triggers */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Dashboard button REMOVED from here */}
                
                <button
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="hidden sm:inline-block border border-[#E8E0D5] dark:border-[#2D1E14] text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438] text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                >
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-[#A16438] hover:bg-[#854F2B] text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-all tracking-wider uppercase shadow-sm"
              >
                {t.nav.login}
              </Link>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-white/40 dark:bg-black/20 border border-[#E8E0D5] dark:border-[#2D1E14] rounded-full p-0.5">
              <button
                onClick={() => setLang('en')}
                className={`text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${
                  lang === 'en'
                    ? 'bg-[#A16438] text-white'
                    : 'text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('am')}
                className={`text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${
                  lang === 'am'
                    ? 'bg-[#A16438] text-white'
                    : 'text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438]'
                }`}
              >
                አማ
              </button>
            </div>

            {/* Notification Bell */}
            <button className="p-2 rounded-full border border-[#E8E0D5] dark:border-[#2D1E14] text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438] transition-colors relative">
              <span>🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#A16438] rounded-full"></span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full border border-[#E8E0D5] dark:border-[#2D1E14] text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438] transition-colors"
              aria-label="Toggle Theme"
            >
              {darkMode ? <span>☀️</span> : <span>🌙</span>}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}