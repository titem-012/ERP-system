'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { translations } from '@/utils/translations';
import { stockService } from '@/services/stockService';
import { Transaction } from '@/types';
import toast from 'react-hot-toast';

export default function CashierStockInPage() {
  const { lang, user } = useAuth();
  const t = translations[lang];

  const cashierStore = user?.assignedStore || 'main';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'STOCK_IN' | 'TRANSFER_IN'>('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [note, setNote] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Auto-Complete Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [productName, setProductName] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [itemQuantity, setItemQuantity] = useState<number | ''>(1);
  const [itemUnitPrice, setItemUnitPrice] = useState<number | ''>('');

  const [selectedDateTransactions, setSelectedDateTransactions] = useState<Transaction[] | null>(null);
  const [selectedDateLabel, setSelectedDateLabel] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, cashierStore]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const storeTx = await stockService.getTransactions(cashierStore);
      setTransactions(storeTx);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Check your connection.';
      toast.error(lang === 'en' ? `Failed to load records: ${errorMessage}` : `መረጃ ማምጣት አልተሳካም: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const knownStock = useMemo(() => {
    const stockMap: Record<string, { productName: string; size: string; color: string; quantity: number }> = {};

    transactions.forEach(tx => {
      const isIncoming = ['STOCK_IN', 'TRANSFER_IN', 'RETURN'].includes(tx.type);
      const isOutgoing = ['SALE', 'TRANSFER_OUT', 'DAMAGE', 'RETURN_TO_SUPPLIER'].includes(tx.type);

      tx.items.forEach(it => {
        const key = `${it.productName.toLowerCase().trim()}|${(it.size || '').toLowerCase().trim()}|${(it.color || '').toLowerCase().trim()}`;
        if (!stockMap[key]) {
          stockMap[key] = { productName: it.productName, size: it.size || '-', color: it.color || '-', quantity: 0 };
        }
        if (isIncoming) stockMap[key].quantity += it.quantity;
        if (isOutgoing) stockMap[key].quantity -= it.quantity;
      });
    });
    return Object.values(stockMap);
  }, [transactions]);

  // BULLETPROOF SEARCH
  const filteredStock = useMemo(() => {
    if (!searchQuery) return []; 
    return knownStock.filter(item => 
      (item.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.size || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.color || '').toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 15); 
  }, [searchQuery, knownStock]);

  const handleSelectStockItem = (item: any) => {
    setSearchQuery(item.productName || '');
    setProductName(item.productName || '');
    setSize(item.size || '');
    setColor(item.color || '');
    setIsDropdownOpen(false);
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) return toast.error(lang === 'en' ? 'Please type a product name.' : 'እባክዎ የምርት ስም ያስገቡ።');
    if (!itemQuantity || Number(itemQuantity) <= 0 || !itemUnitPrice || Number(itemUnitPrice) <= 0) return toast.error(lang === 'en' ? 'Please fill valid numbers.' : 'እባክዎ ትክክለኛ መጠን ይሙሉ።');

    setSubmitLoading(true);
    try {
      const quantityNum = Number(itemQuantity);
      const priceNum = Number(itemUnitPrice);
      const totalAmount = quantityNum * priceNum;
      
      await stockService.createTransaction({
        type: 'STOCK_IN', 
        storeId: cashierStore,
        items: [{ productName: productName.trim(), quantity: quantityNum, unitPrice: priceNum, size: size.trim() || '-', color: color.trim() || '-' }],
        totalAmount,
        note,
      });

      toast.success(lang === 'en' ? 'Stock-in registered successfully.' : 'ገቢ ግብይት በተሳካ ሁኔታ ተመዝግቧል።');
      setIsModalOpen(false);
      setSearchQuery(''); setProductName(''); setSize(''); setColor(''); setItemQuantity(1); setItemUnitPrice(''); setNote('');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || (lang === 'en' ? 'Failed to record stock-in.' : 'ገቢ እቃ መመዝገብ አልተሳካም።'));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(lang === 'en' ? 'Are you sure you want to delete this transaction?' : 'ይህን የግብይት መዝገብ መሰረዝ እርግጠኛ ነዎት?')) {
      try {
        await stockService.deleteTransaction(id);
        toast.success(lang === 'en' ? 'Transaction deleted.' : 'ግብይቱ ተሰርዟል።');
        if (selectedDateTransactions) {
          const updated = selectedDateTransactions.filter(tx => tx.id !== id);
          if (updated.length === 0) setSelectedDateTransactions(null);
          else setSelectedDateTransactions(updated);
        }
        fetchData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || (lang === 'en' ? 'Failed to delete transaction.' : 'መሰረዝ አልተሳካም።'));
      }
    }
  };

  const getEthioDateString = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Addis_Ababa', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
    } catch {
      return dateStr.split('T')[0];
    }
  };

  const incomingTransactions = transactions.filter((tx) => ['STOCK_IN', 'TRANSFER_IN'].includes(tx.type));

  const filtered = incomingTransactions.filter((tx) => {
    if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
    if (dateFilter && getEthioDateString(tx.date) !== dateFilter) return false;
    if (search) {
      const matchesSearch = tx.items.some(
        (it) => (it.productName || '').toLowerCase().includes(search.toLowerCase()) ||
                (it.color || '').toLowerCase().includes(search.toLowerCase()) ||
                (it.size || '').toLowerCase().includes(search.toLowerCase())
      ) || (tx.note && (tx.note || '').toLowerCase().includes(search.toLowerCase()));
      if (!matchesSearch) return false;
    }
    return true;
  });

  const groupedByDay = filtered.reduce((acc: any, tx) => {
    const day = getEthioDateString(tx.date);
    if (!acc[day]) acc[day] = { transactions: [], totalAmount: 0, totalItemsCount: 0 };
    acc[day].transactions.push(tx);
    acc[day].totalAmount += tx.totalAmount;
    acc[day].totalItemsCount += tx.items.reduce((sum: number, it: any) => sum + it.quantity, 0);
    return acc;
  }, {});

  const dailyRows = Object.entries(groupedByDay).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

  // DYNAMIC METRICS
  const filteredTotalAmount = filtered.reduce((sum, tx) => sum + tx.totalAmount, 0);
  const filteredTotalItems = filtered.reduce((sum, tx) => sum + tx.items.reduce((acc, it) => acc + it.quantity, 0), 0);
  const filteredEntriesCount = filtered.length;

  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'am-ET', { timeZone: 'Africa/Addis_Ababa', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getStoreLabel = (storeId: 'main' | 'sub') => {
    if (storeId === 'main') return lang === 'en' ? 'Main Store (Bole)' : 'ዋና መደብር (ቦሌ)';
    return lang === 'en' ? 'Annex (Jemo)' : 'ቅርንጫፍ (ጀሞ)';
  };

  const getTxTypeLabel = (type: string) => {
    if (type === 'STOCK_IN') return lang === 'en' ? 'New Stock (Purchase)' : 'የገዛነው እቃ';
    if (type === 'TRANSFER_IN') return lang === 'en' ? 'Transfer (From other store)' : 'ከሌላ መደብር የመጣ';
    return type;
  };

  const getTxTypeStyles = (type: string) => {
    if (type === 'STOCK_IN') return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300';
    if (type === 'TRANSFER_IN') return 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300';
    return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  };

  return (
    <div className="space-y-10">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-[#E8E0D5]/60 dark:border-[#2D1E14]/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#3D2B1F] dark:text-[#FAF7F2] font-serif uppercase">
            {t.stockIn.title || 'Stock In Register'}
          </h1>
          <p className="text-sm text-[#6B4F3C] dark:text-[#A68F80] mt-1">
            {t.stockIn.subtitle || 'Record incoming inventory'} · <span className="font-semibold text-[#A16438]">{getStoreLabel(cashierStore)}</span>
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="bg-[#A16438] hover:bg-[#854F2B] text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-full transition-colors shadow-sm self-start">
          {t.inventory.addInflow || '+ Add Inflow'}
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-[#A16438] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl p-6 shadow-sm transition-all duration-300">
              <span className="text-[10px] font-bold tracking-widest text-[#6B4F3C] dark:text-[#A68F80] uppercase">
                {typeFilter === 'TRANSFER_IN' ? (lang === 'en' ? 'Total Transfer Value' : 'የዝውውር ጠቅላላ ዋጋ') : typeFilter === 'STOCK_IN' ? (lang === 'en' ? 'Total Purchase Value' : 'የግዢ ጠቅላላ ዋጋ') : (lang === 'en' ? 'Total Inflow Value' : 'ጠቅላላ ገቢ ዋጋ')}
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-[#3D2B1F] dark:text-[#FAF7F2] font-serif">
                  ብር {filteredTotalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl p-6 shadow-sm transition-all duration-300">
              <span className="text-[10px] font-bold tracking-widest text-[#6B4F3C] dark:text-[#A68F80] uppercase">
                {lang === 'en' ? 'Total Items Received' : 'የገባው እቃ ብዛት'}
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-[#3D2B1F] dark:text-[#FAF7F2] font-serif">
                  {filteredTotalItems.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl p-6 shadow-sm transition-all duration-300">
              <span className="text-[10px] font-bold tracking-widest text-[#6B4F3C] dark:text-[#A68F80] uppercase">
                {lang === 'en' ? 'Total Entries (Filtered)' : 'የግብይት ብዛት'}
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-[#3D2B1F] dark:text-[#FAF7F2] font-serif">
                  {filteredEntriesCount}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E0D5]/60 dark:border-[#2D1E14]/40 mb-6">
              
              <div className="flex-1 relative max-w-md">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#6B4F3C]/50 dark:text-[#A68F80]/50">🔍</span>
                <input type="text" placeholder={lang === 'en' ? 'Search records...' : 'ፈልግ...'} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438]" />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-white/40 dark:bg-black/20 border border-[#E8E0D5] dark:border-[#2D1E14] rounded-full p-0.5">
                  <button onClick={() => setTypeFilter('ALL')} className={`text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider transition-colors ${typeFilter === 'ALL' ? 'bg-[#A16438] text-white shadow-sm' : 'text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438]'}`}>{t.inventory.all || 'All'}</button>
                  <button onClick={() => setTypeFilter('STOCK_IN')} className={`text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider transition-colors ${typeFilter === 'STOCK_IN' ? 'bg-[#A16438] text-white shadow-sm' : 'text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438]'}`}>{lang === 'en' ? 'New Stock' : 'አዲስ እቃ'}</button>
                  <button onClick={() => setTypeFilter('TRANSFER_IN')} className={`text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider transition-colors ${typeFilter === 'TRANSFER_IN' ? 'bg-[#A16438] text-white shadow-sm' : 'text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438]'}`}>{lang === 'en' ? 'Transfer In' : 'ዝውውር ገቢ'}</button>
                </div>
                <div className="flex items-center bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-3 py-2 text-xs font-bold text-[#6B4F3C] dark:text-[#A68F80]">
                  <span className="mr-2 uppercase">{t.stockIn.selectDate || 'Date'}:</span>
                  <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-transparent border-0 focus:outline-none dark:color-scheme-dark" />
                  {dateFilter && <button onClick={() => setDateFilter('')} className="ml-2 text-rose-500 font-bold">×</button>}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {dailyRows.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-4">📥</div>
                  <p className="text-[#6B4F3C] dark:text-[#A68F80]/60 italic">{lang === 'en' ? 'No incoming records found.' : 'ምንም የገቢ መዝገብ አልተገኘም።'}</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E8E0D5] dark:border-[#2D1E14] text-[10px] font-bold tracking-widest text-[#6B4F3C] dark:text-[#A68F80] uppercase">
                      <th className="pb-3">{lang === 'en' ? 'Date' : 'ቀን'}</th>
                      <th className="pb-3 text-center">{lang === 'en' ? 'Total Records' : 'የግብይት ብዛት'}</th>
                      <th className="pb-3 text-center">{lang === 'en' ? 'Total Items Received' : 'የገባው እቃ ብዛት'}</th>
                      <th className="pb-3 text-right">{t.stockIn.total || 'Total'}</th>
                      <th className="pb-3 text-center">{t.stockIn.actions || 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E0D5]/40 dark:divide-[#2D1E14]/30">
                    {dailyRows.map(([dateKey, dayData]: any) => (
                      <tr key={dateKey} className="text-sm text-[#3D2B1F] dark:text-[#FAF7F2]/90 hover:bg-[#FAF7F2]/50 dark:hover:bg-[#0D0806]/30 transition-colors">
                        <td className="py-4 font-semibold text-[#A16438]">{formatDateDisplay(dateKey)}</td>
                        <td className="py-4 text-center font-mono"><span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-xs font-bold">{dayData.transactions.length}</span></td>
                        <td className="py-4 text-center font-mono">{dayData.totalItemsCount}</td>
                        <td className="py-4 text-right font-semibold font-mono text-[#3D2B1F] dark:text-[#FAF7F2]">ብር {dayData.totalAmount.toLocaleString()}</td>
                        <td className="py-4 text-center">
                          <button onClick={() => { setSelectedDateLabel(formatDateDisplay(dateKey)); setSelectedDateTransactions(dayData.transactions); }} className="bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] hover:border-[#A16438] text-[#A16438] font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors">{lang === 'en' ? 'View Details' : 'ዝርዝር እይ'}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6 relative">
            <div className="flex items-start justify-between border-b border-[#E8E0D5]/60 dark:border-[#2D1E14]/40 pb-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#3D2B1F] dark:text-[#FAF7F2] uppercase">{lang === 'en' ? 'Record Incoming Stock' : 'የገቢ እቃ መዝገብ'}</h3>
                <span className="text-xs text-[#6B4F3C] dark:text-[#A68F80] block mt-1 uppercase font-semibold">Receiving Store: <span className="text-[#A16438]">{getStoreLabel(cashierStore)}</span></span>
              </div>
              <button onClick={() => { setIsModalOpen(false); setSearchQuery(''); setProductName(''); }} className="text-2xl text-[#6B4F3C]/60 dark:text-[#A68F80]/60 hover:text-rose-500 font-bold transition-colors">×</button>
            </div>

            <form onSubmit={handleTransactionSubmit} className="space-y-5">
              
              <div className="bg-[#A16438]/10 border border-[#A16438]/20 rounded-lg p-4 mb-4">
                <p className="text-xs text-[#A16438] font-semibold text-center uppercase tracking-wider">
                   {lang === 'en' ? '⚠️ Only use this for NEW purchases. Store transfers are automatic.' : '⚠️ ይህን የሚጠቀሙት ለአዲስ ግዢ ብቻ ነው። ከሌላ መደብር የሚመጡ እቃዎች በራሳቸው ይገባሉ።'}
                </p>
              </div>

              <div className="relative">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">1. {lang === 'en' ? 'Product Name' : 'የምርት ስም'}</label>
                <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setProductName(e.target.value); setIsDropdownOpen(true); }} onFocus={() => setIsDropdownOpen(true)} onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} placeholder={lang === 'en' ? 'Type new product or search existing...' : 'አዲስ ያስገቡ ወይም በክምችት ይፈልጉ...'} className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-3 text-sm text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] focus:ring-1 focus:ring-[#A16438]" required />
                {isDropdownOpen && filteredStock.length > 0 && (
                  <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {filteredStock.map((item, index) => (
                      <li key={index} onClick={() => handleSelectStockItem(item)} className="px-4 py-3 border-b border-[#E8E0D5]/50 dark:border-[#2D1E14]/50 cursor-pointer hover:bg-[#FAF7F2] dark:hover:bg-[#0D0806] flex justify-between items-center transition-colors">
                        <div>
                          <span className="block text-sm font-bold text-[#3D2B1F] dark:text-[#FAF7F2]">{item.productName}</span>
                          <span className="text-[10px] uppercase tracking-wider text-[#6B4F3C] dark:text-[#A68F80]">Size: {item.size} · Color: {item.color}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#A16438] bg-[#A16438]/10 px-2 py-1 rounded-md">Existing Qty: {item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">2. {t.reports.size || 'Size'}</label>
                  <input type="text" value={size} onChange={(e) => setSize(e.target.value)} placeholder={lang === 'en' ? 'e.g. M, L, XL, 42' : 'መጠን ያስገቡ'} className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-2.5 text-sm text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">3. {t.common.color || 'Color'}</label>
                  <input type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder={lang === 'en' ? 'e.g. Black, Blue' : 'ቀለም ያስገቡ'} className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-2.5 text-sm text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">4. {t.common.quantity || 'Quantity'}</label>
                  <input type="number" min="1" value={itemQuantity} onChange={(e) => setItemQuantity(e.target.value === '' ? '' : parseInt(e.target.value))} placeholder="Qty" className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-3 text-base font-mono text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] focus:ring-1 focus:ring-[#A16438] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">5. {lang === 'en' ? 'Unit Cost (ETB)' : 'የአንዱ ዋጋ (ብር)'}</label>
                  <input type="number" min="0" step="any" value={itemUnitPrice} onChange={(e) => setItemUnitPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder={lang === 'en' ? 'Enter cost' : 'ዋጋ ያስገቡ'} className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-3 text-base font-mono text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] focus:ring-1 focus:ring-[#A16438] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" required />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">{t.common.note || 'Note (Optional)'}</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Supplier name, Invoice number" className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-2.5 text-sm text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438]" />
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-lg p-4 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">Total Value</span>
                <span className="text-xl font-bold font-mono text-[#3D2B1F] dark:text-[#FAF7F2]">ብር {((Number(itemQuantity) || 0) * (Number(itemUnitPrice) || 0)).toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setIsModalOpen(false); setSearchQuery(''); setProductName(''); }} className="border border-[#E8E0D5] dark:border-[#2D1E14] hover:bg-gray-50 dark:hover:bg-gray-900 text-[#3D2B1F] dark:text-[#FAF7F2] font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-lg transition-colors">{t.common.cancel || 'Cancel'}</button>
                <button type="submit" disabled={submitLoading || !productName.trim()} className="bg-[#A16438] hover:bg-[#854F2B] text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-lg transition-colors shadow-sm disabled:opacity-50">{submitLoading ? '...' : (lang === 'en' ? 'Submit Record' : 'መዝግብ')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedDateTransactions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8E0D5]/60 dark:border-[#2D1E14]/40 pb-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#3D2B1F] dark:text-[#FAF7F2] uppercase">{lang === 'en' ? 'Daily Incoming Report' : 'የዕለት ገቢ ሪፖርት'}</h3>
                <span className="text-sm font-bold text-[#A16438] block mt-1">{selectedDateLabel}</span>
              </div>
              <button onClick={() => setSelectedDateTransactions(null)} className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#3D2B1F] dark:text-[#FAF7F2] p-2 rounded-full font-bold transition-colors">✕</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E0D5] dark:border-[#2D1E14] text-[10px] font-bold tracking-widest text-[#6B4F3C] dark:text-[#A68F80] uppercase">
                    <th className="pb-3">{t.stockIn.type || 'Type'}</th>
                    <th className="pb-3">{t.stockIn.items || 'Items'}</th>
                    <th className="pb-3 text-right">{t.stockIn.total || 'Total'}</th>
                    <th className="pb-3 text-center">{t.stockIn.actions || 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D5]/40 dark:divide-[#2D1E14]/30">
                  {selectedDateTransactions.map((tx) => (
                    <tr key={tx.id} className="text-sm text-[#3D2B1F] dark:text-[#FAF7F2]/90 hover:bg-[#FAF7F2]/50 dark:hover:bg-[#0D0806]/30 transition-colors">
                      <td className="py-4">
                        <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${getTxTypeStyles(tx.type)}`}>
                          {getTxTypeLabel(tx.type)}
                        </span>
                        <span className="block text-xs mt-1 opacity-60">
                          {new Date(tx.date).toLocaleTimeString(lang === 'en' ? 'en-US' : 'am-ET', { timeZone: 'Africa/Addis_Ababa', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1">
                          {tx.items.map((it, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="font-semibold">{it.productName}</span>
                              <span className="text-xs text-[#6B4F3C] dark:text-[#A68F80]">{it.size} · {it.color} · <strong className="text-[#3D2B1F] dark:text-white">{it.quantity} {t.inventory.units || 'units'}</strong></span>
                            </div>
                          ))}
                          {tx.note && <span className="text-xs text-[#A16438] italic font-serif mt-1">Note: {tx.note}</span>}
                        </div>
                      </td>
                      <td className="py-4 text-right font-semibold font-mono">ብር {tx.totalAmount.toLocaleString()}</td>
                      <td className="py-4 text-center">
                        <button onClick={() => handleDelete(tx.id)} className="p-1.5 rounded-lg border border-[#E8E0D5] dark:border-[#2D1E14] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors" title="Delete / Reverse entry">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}