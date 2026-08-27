'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { lang, user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation: Check if new passwords match
    if (newPassword !== confirmPassword) {
      toast.error(
        lang === 'en' 
          ? 'New passwords do not match!' 
          : 'አዲሱ የይለፍ ቃል አይመሳሰልም!'
      );
      return;
    }

    // 2. Validation: Check password length
    if (newPassword.length < 6) {
      toast.error(
        lang === 'en' 
          ? 'New password must be at least 6 characters long.' 
          : 'አዲሱ የይለፍ ቃል ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት።'
      );
      return;
    }

    setLoading(true);
    try {
      // Get the authentication token
      const token = localStorage.getItem('token');

      // Send the password change request to your Spring Boot backend
      const response = await fetch('http://localhost:8081/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to change password');
      }

      // Success
      toast.success(
        lang === 'en' 
          ? 'Password updated successfully!' 
          : 'የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል!'
      );
      
      // Clear the form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (error: any) {
      toast.error(
        error.message || 
        (lang === 'en' ? 'Failed to update password. Please check your current password.' : 'የይለፍ ቃል መቀየር አልተሳካም። እባክዎ የአሁኑን የይለፍ ቃል ያረጋግጡ።')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-3xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-[#E8E0D5]/60 dark:border-[#2D1E14]/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#3D2B1F] dark:text-[#FAF7F2] font-serif uppercase">
            {lang === 'en' ? 'Settings' : 'ማስተካከያዎች'}
          </h1>
          <p className="text-sm text-[#6B4F3C] dark:text-[#A68F80] mt-1">
            {lang === 'en' ? 'Manage your account security' : 'የአካውንትዎን ደህንነት ያስተዳድሩ'} · <span className="font-semibold text-[#A16438]">@{user?.username || 'admin'}</span>
          </p>
        </div>
      </div>

      {/* Password Edit Card */}
      <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl p-6 md:p-8 shadow-sm">
        
        <div className="mb-6">
          <h2 className="text-lg font-bold font-serif text-[#3D2B1F] dark:text-[#FAF7F2] uppercase">
            {lang === 'en' ? 'Change Password' : 'የይለፍ ቃል ቀይር'}
          </h2>
          <p className="text-xs text-[#6B4F3C] dark:text-[#A68F80] mt-1">
            {lang === 'en' ? 'Update your admin password to keep your account secure.' : 'አካውንትዎን ደህንነቱ የተጠበቀ ለማድረግ የአስተዳዳሪ የይለፍ ቃልዎን ያዘምኑ።'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Current Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">
              {lang === 'en' ? 'Current Password' : 'የአሁኑ የይለፍ ቃል'}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-3 text-sm text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] focus:ring-1 focus:ring-[#A16438]"
              required
            />
          </div>

          <div className="border-t border-[#E8E0D5]/60 dark:border-[#2D1E14]/40 my-6"></div>

          {/* New Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">
              {lang === 'en' ? 'New Password' : 'አዲስ የይለፍ ቃል'}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-3 text-sm text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] focus:ring-1 focus:ring-[#A16438]"
              required
            />
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">
              {lang === 'en' ? 'Confirm New Password' : 'አዲሱን የይለፍ ቃል ያረጋግጡ'}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-3 text-sm text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] focus:ring-1 focus:ring-[#A16438]"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full sm:w-auto bg-[#A16438] hover:bg-[#854F2B] text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading 
                ? '...' 
                : (lang === 'en' ? 'Save Password' : 'የይለፍ ቃል አድስ')}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}