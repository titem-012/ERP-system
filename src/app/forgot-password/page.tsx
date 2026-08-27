'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { translations } from '@/utils/translations';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { lang, setLang, darkMode, setDarkMode } = useAuth();
  const t = translations[lang];

  // Flow State
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:8081/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      setSuccessMessage(lang === 'en' ? 'Code sent! Check your email.' : 'ኮድ ተልኳል! ኢሜልዎን ያረጋግጡ።');
      setStep(2); // Move to Step 2
    } catch (error: any) {
      setErrorMessage(error.message || (lang === 'en' ? 'Failed to send OTP.' : 'ኮድ መላክ አልተሳካም።'));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage(lang === 'en' ? 'Passwords do not match.' : 'የይለፍ ቃሎች አይዛመዱም።');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      setSuccessMessage(lang === 'en' ? 'Password successfully reset! Redirecting...' : 'የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል! ወደ መግቢያ በመመለስ ላይ...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error: any) {
      setErrorMessage(error.message || (lang === 'en' ? 'Failed to reset password.' : 'የይለፍ ቃል መቀየር አልተሳካም።'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 bg-[#FAF7F2] dark:bg-[#0D0806]">
      <div className="w-full max-w-md">
        
        {/* Back to Login link */}
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438] dark:hover:text-[#FAF7F2] mb-6 transition-colors"
        >
          <span>←</span> {lang === 'en' ? 'Back to Login' : 'ወደ መግቢያ ተመለስ'}
        </Link>

        {/* Card */}
        <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl shadow-xl p-8 transition-colors duration-300">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-[#3D2B1F] dark:text-[#FAF7F2] font-serif uppercase">
              {lang === 'en' ? 'Reset Password' : 'የይለፍ ቃል ይቀይሩ'}
            </h1>
            <p className="text-xs tracking-wider text-[#6B4F3C] dark:text-[#A68F80] uppercase mt-1.5">
              {step === 1 
                ? (lang === 'en' ? 'Enter your email to receive a code' : 'ኮድ ለመቀበል ኢሜልዎን ያስገቡ')
                : (lang === 'en' ? 'Enter your code and new password' : 'ኮድዎን እና አዲሱን የይለፍ ቃል ያስገቡ')
              }
            </p>
          </div>

          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center animate-fade-in">
              <p className="text-xs font-bold text-red-600 dark:text-red-400">{errorMessage}</p>
            </div>
          )}
          {successMessage && (
            <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center animate-fade-in">
              <p className="text-xs font-bold text-green-600 dark:text-green-400">{successMessage}</p>
            </div>
          )}

          {/* STEP 1: Request OTP */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">
                  {lang === 'en' ? 'Email Address' : 'የኢሜል አድራሻ'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-2.5 text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#A16438] hover:bg-[#854F2B] text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 mt-2"
              >
                {loading ? '...' : (lang === 'en' ? 'Send Code' : 'ኮድ ላክ')}
              </button>
            </form>
          )}

          {/* STEP 2: Verify OTP and Reset */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">
                  {lang === 'en' ? '6-Digit Code' : '6-ዲጂት ኮድ'}
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="------"
                  className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-2.5 text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] tracking-widest text-center text-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">
                  {lang === 'en' ? 'New Password' : 'አዲስ የይለፍ ቃል'}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-2.5 text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">
                  {lang === 'en' ? 'Confirm Password' : 'የይለፍ ቃል አረጋግጥ'}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-2.5 text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#A16438] hover:bg-[#854F2B] text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 mt-2"
              >
                {loading ? '...' : (lang === 'en' ? 'Update Password' : 'የይለፍ ቃል አዘምን')}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}