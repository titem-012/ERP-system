'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { useAuth } from '@/context/AuthContext';
import { translations } from '@/utils/translations';

export default function LandingPage() {
  const { lang, user } = useAuth();
  const t = translations[lang];

  // UPDATED: Completely removed "dashboard" routing. Redirects straight to reports.
  const getReportsPath = () => {
    if (!user) return '/login';
    return user.role === 'ADMIN' ? '/admin/reports' : '/cashier/reports';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] dark:bg-[#0D0806] text-[#3D2B1F] dark:text-[#FAF7F2] transition-colors duration-300">
      
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        
        {/* Hero Section - UPDATED: Increased vertical padding (py-32) for premium international spacing */}
        <section className="relative overflow-hidden py-32 lg:py-40 border-b border-[#E8E0D5]/60 dark:border-[#2D1E14]/40">
          
          {/* Subtle warm light background effects */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#A16438]/5 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            {/* UPDATED: Increased gap between columns (gap-16) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Left Column: Text & CTA */}
              <div className="lg:col-span-7 text-left space-y-8"> {/* UPDATED: space-y-8 for better line spacing */}
                
                {/* Badge */}
                <span className="inline-block bg-[#5D3A1A]/10 dark:bg-white/5 border border-[#5D3A1A]/20 dark:border-white/10 text-[#5D3A1A] dark:text-[#A68F80] text-[11px] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full shadow-sm">
                  ✨ {lang === 'en' ? 'Echo Menswear System' : 'የኤኮ የወንዶች አልባሳት ስርዓት'}
                </span>

                {/* Title */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-serif uppercase leading-tight text-[#3D2B1F] dark:text-white">
                  {lang === 'en' ? 'Dual-Store' : 'የሁለት መደብሮች'}{' '}
                  <span className="text-[#A16438] block sm:inline italic font-normal font-serif mt-2 sm:mt-0">
                    {lang === 'en' ? 'Management' : 'አስተዳደር'}
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl text-[#6B4F3C] dark:text-[#A68F80] leading-relaxed max-w-2xl font-medium">
                  {lang === 'en' 
                    ? 'Seamlessly manage inventory, track daily sales, and generate real-time reports across our Main Store (Bole) and Annex (Jemo). Log in below to access your workspace.' 
                    : 'በዋናው መደብራችን (ቦሌ) እና በቅርንጫፋችን (ጀሞ) ውስጥ ያለውን ክምችት፣ እለታዊ ሽያጭ እና ሪፖርቶችን በቀላሉ ያስተዳድሩ። ወደ የስራ ገጽዎ ለመግባት ከታች ይግቡ።'}
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <Link
                    href={getReportsPath()}
                    className="group relative flex items-center gap-4 bg-[#A16438] hover:bg-[#854F2B] text-white font-bold text-sm uppercase tracking-widest px-10 py-5 rounded-full transition-all duration-300 shadow-xl hover:shadow-[#A16438]/40 hover:-translate-y-1"
                  >
                    <span>
                      {/* UPDATED: Changed from "Dashboard" to "Reports" */}
                      {user 
                        ? (lang === 'en' ? 'Go to Reports' : 'ወደ ሪፖርቶች ይሂዱ') 
                        : (lang === 'en' ? 'Login to Manage' : 'ለማስተዳደር ይግቡ')}
                    </span>
                    {/* Animated Arrow Icon */}
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>

                  {!user && (
                    <a 
                      href="#workflow" 
                      className="text-xs font-bold uppercase tracking-widest text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438] px-4 py-4 transition-colors duration-300"
                    >
                      {lang === 'en' ? 'See How It Works ↓' : 'እንዴት እንደሚሰራ ይመልከቱ ↓'}
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Hero Image Card */}
              <div className="lg:col-span-5 relative mt-10 lg:mt-0">
                <div className="absolute -inset-2 bg-[#A16438]/10 rounded-[2rem] blur-xl"></div>
                <div className="relative bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-3xl overflow-hidden shadow-2xl p-4 hover:scale-[1.02] transition-transform duration-500">
                  <img
                    src="/hero-suits.png"
                    alt="Echo Menswear Suits"
                    className="w-full h-[450px] object-cover rounded-2xl"
                  />
                  <div className="absolute bottom-8 left-8 right-8 bg-[#0D0806]/95 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-white">
                    <span className="font-bold font-serif uppercase tracking-widest block text-[#A16438] text-sm">Echo Atelier</span>
                    <span className="text-[#A68F80] mt-1.5 block text-xs leading-relaxed">
                      {lang === 'en' ? 'Premium suits, shirts, and custom accessories.' : 'ፕሪሚየም ሱፎች፣ ሸሚዞች እና ልዩ ቁሳቁሶች።'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Brand Highlights Section - UPDATED: Increased padding */}
        <section className="py-28 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 border-b border-[#E8E0D5]/60 dark:border-[#2D1E14]/40">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-[11px] font-bold tracking-widest text-[#A16438] uppercase block mb-3">
              {lang === 'en' ? 'System Capabilities' : 'የስርዓቱ ችሎታዎች'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif uppercase text-[#3D2B1F] dark:text-white leading-tight">
              {lang === 'en' ? 'Tailored Architecture' : 'የተመቻቸ አሰራር'}
            </h2>
            <div className="w-16 h-1 bg-[#A16438] mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-3xl p-10 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="text-3xl mb-6">🏬</div>
              <h3 className="text-xl font-bold font-serif uppercase text-[#3D2B1F] dark:text-[#FAF7F2]">
                {lang === 'en' ? 'Store Data Isolation' : 'የመደብር መረጃ መለያየት'}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-[#6B4F3C] dark:text-[#A68F80]">
                {lang === 'en' 
                  ? 'Cashier registers are isolated strictly to their assigned store (Bole or Jemo) to avoid overlapping balances, while administrators retain global visibility.' 
                  : 'የገንዘብ ያዦች መረጃ በተመደቡበት መደብር (ቦሌ ወይም ጀሞ) ብቻ የተገደበ ሲሆን፣ አስተዳዳሪዎች ግን የሁለቱንም መረጃ ማየት ይችላሉ።'}
              </p>
            </div>

            <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-3xl p-10 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="text-3xl mb-6">📈</div>
              <h3 className="text-xl font-bold font-serif uppercase text-[#3D2B1F] dark:text-[#FAF7F2]">
                {lang === 'en' ? 'Real-Time Audits' : 'የቀጥታ ክትትል'}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-[#6B4F3C] dark:text-[#A68F80]">
                {lang === 'en' 
                  ? 'Every sale, incoming transfer, purchase, or damage is instantly logged in the daily transaction log, updating real-time inventory levels automatically.' 
                  : 'እያንዳንዱ ሽያጭ፣ ገቢ ዝውውር፣ ግዢ ወይም ጉዳት ወዲያውኑ በእለታዊ መዝገብ ውስጥ ይሰፍራል፤ የክምችት መጠንም በቀጥታ ይዘመናል።'}
              </p>
            </div>

            <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-3xl p-10 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="text-3xl mb-6">🌐</div>
              <h3 className="text-xl font-bold font-serif uppercase text-[#3D2B1F] dark:text-[#FAF7F2]">
                {lang === 'en' ? 'Bilingual Control' : 'የሁለት ቋንቋ አጠቃቀም'}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-[#6B4F3C] dark:text-[#A68F80]">
                {lang === 'en' 
                  ? 'Easily toggle the entire workspace between English and Amharic language dictionaries with a single tap, dynamically translating data fields.' 
                  : 'በአንድ ጠቅታ ብቻ ሙሉ የስራ ገጹን በእንግሊዝኛ እና በአማርኛ ቋንቋዎች መካከል በቀላሉ መቀያየር ይችላሉ።'}
              </p>
            </div>
          </div>
        </section>

        {/* How to Use (Cashier Workflow) */}
        <section id="workflow" className="py-28 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-[11px] font-bold tracking-widest text-[#A16438] uppercase block mb-3">
              {lang === 'en' ? 'Quick Guide' : 'አጭር መመሪያ'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif uppercase text-[#3D2B1F] dark:text-white leading-tight">
              {lang === 'en' ? 'Cashier Workflow' : 'የገንዘብ ያዥ የስራ ሂደት'}
            </h2>
            <div className="w-16 h-1 bg-[#A16438] mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center p-8 group">
              <div className="w-20 h-20 rounded-full bg-[#A16438] text-white flex items-center justify-center text-2xl font-bold mb-8 shadow-xl z-10 transition-transform duration-500 group-hover:scale-110">
                1
              </div>
              <h3 className="text-xl font-bold font-serif uppercase text-[#3D2B1F] dark:text-[#FAF7F2] mb-4">
                {lang === 'en' ? 'Secure Login' : 'ደህንነቱ የተጠበቀ መግቢያ'}
              </h3>
              <p className="text-base text-[#6B4F3C] dark:text-[#A68F80] leading-relaxed">
                {lang === 'en' 
                  ? 'Log in using your assigned Cashier credentials to securely access either the Bole or Jemo store dashboard.' 
                  : 'በተሰጠዎት የገንዘብ ያዥ መታወቂያ በመጠቀም ወደ ቦሌ ወይም ጀሞ የመደብር ገጽ በደህንነት ይግቡ።'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center p-8 group">
              <div className="w-20 h-20 rounded-full bg-[#A16438] text-white flex items-center justify-center text-2xl font-bold mb-8 shadow-xl z-10 transition-transform duration-500 group-hover:scale-110">
                2
              </div>
              <h3 className="text-xl font-bold font-serif uppercase text-[#3D2B1F] dark:text-[#FAF7F2] mb-4">
                {lang === 'en' ? 'Manage Inventory' : 'ክምችት ያስተዳድሩ'}
              </h3>
              <p className="text-base text-[#6B4F3C] dark:text-[#A68F80] leading-relaxed">
                {lang === 'en' 
                  ? 'Use the "Stock In" page to add new products, and the "Sale/Stock Out" page to withdraw items and process daily sales.' 
                  : '"ገቢ እቃ" ገጽን በመጠቀም አዳዲስ ምርቶችን ይጨምሩ፣ እንዲሁም በ"ሽያጭ/ወጪ" ገጽ የእለት ሽያጮችን ያከናውኑ።'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center p-8 group">
              <div className="w-20 h-20 rounded-full bg-[#A16438] text-white flex items-center justify-center text-2xl font-bold mb-8 shadow-xl z-10 transition-transform duration-500 group-hover:scale-110">
                3
              </div>
              <h3 className="text-xl font-bold font-serif uppercase text-[#3D2B1F] dark:text-[#FAF7F2] mb-4">
                {lang === 'en' ? 'View Reports' : 'ሪፖርቶችን ይመልከቱ'}
              </h3>
              <p className="text-base text-[#6B4F3C] dark:text-[#A68F80] leading-relaxed">
                {lang === 'en' 
                  ? 'Check your reports page to view your daily transaction history, total sales, and low-stock warnings.' 
                  : 'የእለታዊ የግብይት ታሪክዎን፣ አጠቃላይ ሽያጮችን እና የአነስተኛ ክምችት ማስጠንቀቂያዎችን ለማየት የሪፖርት ገጽዎን ይጎብኙ።'}
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}