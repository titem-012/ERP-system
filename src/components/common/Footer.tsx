'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { translations } from '@/utils/translations';

export default function Footer() {
  const { lang, user } = useAuth();
  const t = translations[lang];

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

  const getDashboardPath = () => {
    if (!user) return '/login';
    return user.role === 'ADMIN' ? '/admin/dashboard' : '/cashier/stock-out';
  };

  return (
    <footer className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border-t border-[#E8E0D5] dark:border-[#2D1E14] transition-colors duration-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12">
          
          {/* Logo & Tagline */}
          <div className="col-span-1 md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
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
              </div>
            </div>
            <p className="text-sm leading-relaxed text-[#6B4F3C]/80 dark:text-[#A68F80]/80 max-w-sm">
              {t.footer.tagline}
            </p>
          </div>

          {/* Features Column */}
          <div className="col-span-1 md:col-span-2.5 flex flex-col gap-4">
            <span className="text-xs font-bold tracking-widest text-[#3D2B1F] dark:text-[#FAF7F2] uppercase">
              {t.footer.features}
            </span>
            <nav className="flex flex-col gap-2.5">
              <Link href={getStockInPath()} className="text-sm text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438] transition-colors">
                {t.footer.stockIn}
              </Link>
              <Link href={getStockOutPath()} className="text-sm text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438] transition-colors">
                {t.footer.stockOut}
              </Link>
              <Link href={getReportsPath()} className="text-sm text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438] transition-colors">
                {t.footer.reports}
              </Link>
              <Link href={getDashboardPath()} className="text-sm text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438] transition-colors">
                {t.nav.dashboard}
              </Link>
            </nav>
          </div>

          {/* Support Column */}
          <div className="col-span-1 md:col-span-2.5 flex flex-col gap-4">
            <span className="text-xs font-bold tracking-widest text-[#3D2B1F] dark:text-[#FAF7F2] uppercase">
              {t.footer.support}
            </span>
            <nav className="flex flex-col gap-2.5">
              <a href="#" className="text-sm text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438] transition-colors">
                {t.footer.helpCenter}
              </a>
              <a href="#" className="text-sm text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438] transition-colors">
                {t.footer.contactSales}
              </a>
            </nav>
          </div>

          {/* Legal Column */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
            <span className="text-xs font-bold tracking-widest text-[#3D2B1F] dark:text-[#FAF7F2] uppercase">
              {t.footer.legal}
            </span>
            <nav className="flex flex-col gap-2.5">
              <a href="#" className="text-sm text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438] transition-colors">
                {t.footer.privacy}
              </a>
              <a href="#" className="text-sm text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438] transition-colors">
                {t.footer.terms}
              </a>
            </nav>
          </div>

        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#E8E0D5] dark:bg-[#2D1E14] my-6"></div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[#6B4F3C]/60 dark:text-[#A68F80]/60">
            © 2026 {t.siteTitle.toUpperCase()} · ADDIS ABABA, ETHIOPIA.
          </span>
          <span className="text-xs font-semibold tracking-widest text-[#5D3A1A] dark:text-[#FAF7F2]/80 uppercase font-serif">
            {t.footer.trademark}
          </span>
        </div>

      </div>
    </footer>
  );
}
