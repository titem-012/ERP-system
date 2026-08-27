'use client';

import React from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] dark:bg-[#0D0806] text-[#3D2B1F] dark:text-[#FAF7F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#A16438] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] font-bold tracking-widest uppercase animate-pulse font-serif text-[#5D3A1A] dark:text-[#FAF7F2]/80">
            ECHO MENSWEAR
          </span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] dark:bg-[#0D0806] text-[#3D2B1F] dark:text-[#FAF7F2] transition-colors duration-300">
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
