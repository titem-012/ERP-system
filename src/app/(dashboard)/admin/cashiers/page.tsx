'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { translations } from '@/utils/translations';
import { User } from '@/types';
import toast from 'react-hot-toast';

export default function AdminCashiersPage() {
  const { lang, createCashier, deleteUser, getCashiersList } = useAuth();
  const t = translations[lang];

  const [cashiers, setCashiers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [assignedStore, setAssignedStore] = useState<'main' | 'sub'>('main');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchCashiers();
  }, []);

  const fetchCashiers = async () => {
    setLoading(true);
    try {
      const list = await getCashiersList();
      setCashiers(list);
    } catch (error) {
      console.error('Error listing cashiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const success = await createCashier({
        username,
        fullName,
        email,
        role: 'CASHIER',
        assignedStore,
        password,
      });

      if (success) {
        // Clear form
        setUsername('');
        setFullName('');
        setEmail('');
        setPassword('');
        setAssignedStore('main');
        fetchCashiers();
      }
    } catch (error) {
      console.error('Submit cashier error:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t.cashiers.deleteConfirm)) {
      try {
        const success = await deleteUser(id);
        if (success) {
          fetchCashiers();
        }
      } catch (error) {
        console.error('Delete cashier error:', error);
      }
    }
  };

  const getStoreLabel = (storeId?: 'main' | 'sub') => {
    if (storeId === 'main') return lang === 'en' ? 'Main Store (Bole)' : 'ዋና መደብር (ቦሌ)';
    if (storeId === 'sub') return lang === 'en' ? 'Annex (Jemo)' : 'ቅርንጫፍ (ጀሞ)';
    return '-';
  };

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <div className="border-b border-[#E8E0D5]/60 dark:border-[#2D1E14]/40 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#3D2B1F] dark:text-[#FAF7F2] font-serif uppercase">
          {t.cashiers.title}
        </h1>
        <p className="text-sm text-[#6B4F3C] dark:text-[#A68F80] mt-1">
          {t.cashiers.subtitle}
        </p>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Create cashier card */}
        <div className="lg:col-span-5 bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] uppercase font-serif border-b border-[#E8E0D5]/60 dark:border-[#2D1E14]/40 pb-4 mb-6">
            {t.cashiers.addNew}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">
                {t.cashiers.username}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-2.5 text-sm text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">
                {t.cashiers.fullName}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-2.5 text-sm text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">
                {t.cashiers.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-2.5 text-sm text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">
                {t.cashiers.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-2.5 text-sm text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">
                {t.cashiers.store}
              </label>
              <select
                value={assignedStore}
                onChange={(e) => setAssignedStore(e.target.value as 'main' | 'sub')}
                className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-2.5 text-sm text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] transition-colors"
              >
                <option value="main">{lang === 'en' ? 'Main Store (Bole)' : 'ዋና መደብር (ቦሌ)'}</option>
                <option value="sub">{lang === 'en' ? 'Annex (Jemo)' : 'ቅርንጫፍ (ጀሞ)'}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="w-full bg-[#A16438] hover:bg-[#854F2B] text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 mt-4"
            >
              {submitLoading ? '...' : t.cashiers.submit}
            </button>
          </form>
        </div>

        {/* Cashiers List card */}
        <div className="lg:col-span-7 bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] uppercase font-serif border-b border-[#E8E0D5]/60 dark:border-[#2D1E14]/40 pb-4 mb-6">
            {t.cashiers.listTitle}
          </h2>

          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <div className="w-6 h-6 border-2 border-[#A16438] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="divide-y divide-[#E8E0D5]/40 dark:divide-[#2D1E14]/30">
              {cashiers.length === 0 ? (
                <p className="text-sm text-[#6B4F3C] dark:text-[#A68F80]/60 italic py-6 text-center">
                  {t.cashiers.noCashiers}
                </p>
              ) : (
                cashiers.map((cashier) => (
                  <div key={cashier.id} className="py-4 flex items-center justify-between hover:bg-[#FAF7F2]/30 dark:hover:bg-[#0D0806]/10 px-2 rounded-lg transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-[#3D2B1F] dark:text-[#FAF7F2]">
                        {cashier.fullName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#6B4F3C] dark:text-[#A68F80]">
                        <span className="font-mono">@{cashier.username}</span>
                        <span>·</span>
                        <span>{cashier.email}</span>
                        <span>·</span>
                        <span className="bg-[#A16438]/15 text-[#A16438] dark:text-amber-200 dark:bg-amber-200/10 px-2 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider">
                          {getStoreLabel(cashier.assignedStore)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(cashier.id)}
                      className="p-2 border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                      title="Delete Cashier"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
