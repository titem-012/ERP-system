'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { translations } from '@/utils/translations';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  
  const { login, user, lang, setLang, darkMode, setDarkMode } = useAuth();
  const t = translations[lang];

  // Redirect if already logged in (UPDATED: Admins go to reports)
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        router.push('/admin/reports');
      } else if (user.role === 'CASHIER') {
        router.push('/cashier/dashboard');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setErrorMessage('');
    
    try {
      const success = await login(username, password);
      if (success) {
        // Redirect handled by useEffect, but adding push as a fallback (UPDATED: Admins go to reports)
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.role === 'ADMIN') {
          router.push('/admin/reports');
        } else if (currentUser.role === 'CASHIER') {
          router.push('/cashier/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(error.message || (lang === 'en' ? 'Invalid username or password' : 'የተሳሳተ የተጠቃሚ ስም ወይም የይለፍ ቃል'));
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 bg-[#FAF7F2] dark:bg-[#0D0806]">
      <div className="w-full max-w-md">
        
        {/* Back to Home link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438] dark:hover:text-[#FAF7F2] mb-6 transition-colors"
        >
          <span>←</span> {lang === 'en' ? 'Back to Home' : 'ወደ መነሻ ተመለስ'}
        </Link>

        {/* Card */}
        <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl shadow-xl p-8 transition-colors duration-300">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 rounded-xl mb-4">
              <svg className="w-10 h-10 text-[#A16438] dark:text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3c0 .8.6 1.5 1.4 1.8L3 13.5A1.5 1.5 0 0 0 4.2 16h15.6a1.5 1.5 0 0 0 1.2-2.5L13.6 6.8c.8-.3 1.4-1 1.4-1.8a3 3 0 0 0-3-3z" />
                <path d="M6 16v4a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-4" />
                <line x1="9" y1="11" x2="15" y2="11" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#3D2B1F] dark:text-[#FAF7F2] font-serif uppercase">
              {t.nav.login}
            </h1>
            <p className="text-xs tracking-wider text-[#6B4F3C] dark:text-[#A68F80] uppercase mt-1.5">
              {t.siteTitle} · {t.atelier}
            </p>
          </div>

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center animate-fade-in">
              <p className="text-xs font-bold text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">
                {t.cashiers.username}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-2.5 text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] dark:focus:border-[#A16438] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">
                {t.cashiers.password}
              </label>
              
              {/* Relative container for the Eye Icon */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-2.5 pr-10 text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] dark:focus:border-[#A16438] transition-colors"
                  required
                />
                
                {/* Eye / Hide Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438] transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end mt-2">
                <Link 
                  href="/forgot-password" 
                  className="text-[10px] font-bold uppercase tracking-wider text-[#A16438] hover:text-[#854F2B] dark:hover:text-[#FAF7F2] transition-colors"
                >
                  {lang === 'en' ? 'Forgot Password?' : 'የይለፍ ቃል ረሱ?'}
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#A16438] hover:bg-[#854F2B] text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 mt-2"
            >
              {loginLoading ? '...' : t.nav.login}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-8 text-center text-[10px] tracking-wider text-[#6B4F3C]/60 dark:text-[#A68F80]/60 space-y-1.5 border-t border-[#E8E0D5]/60 dark:border-[#2D1E14]/40 pt-6 uppercase">
            <p>{t.cashiers.subtitle}</p>
            <p className="font-serif italic text-[#A16438]">{t.footer.trademark}</p>
          </div>

        </div>
        
        {/* Quick Lang Switcher on login screen */}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => setLang('en')}
            className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
              lang === 'en'
                ? 'bg-[#A16438] text-white'
                : 'text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438]'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLang('am')}
            className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
              lang === 'am'
                ? 'bg-[#A16438] text-white'
                : 'text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438]'
            }`}
          >
            አማርኛ
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-xs font-bold text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438] transition-colors ml-4"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

      </div>
    </div>
  );
}