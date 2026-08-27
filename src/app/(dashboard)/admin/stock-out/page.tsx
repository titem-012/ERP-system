'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { translations } from '@/utils/translations';
import { stockService } from '@/services/stockService';
import { Transaction } from '@/types';
import toast from 'react-hot-toast';

export default function AdminStockOutPage() {
  const { lang } = useAuth();
  const t = translations[lang];

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters (Removed DAMAGE)
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SALE' | 'TRANSFER_OUT'>('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [storeFilter, setStoreFilter] = useState<'all' | 'main' | 'sub'>('all');

  // Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txStore, setTxStore] = useState<'main' | 'sub'>('main');
  const [txType, setTxType] = useState<'SALE' | 'TRANSFER_OUT'>('SALE');
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
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allTransactions = await stockService.getTransactions();
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error fetching stock-out data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentStock = useMemo(() => {
    const stockMap: Record<string, { productName: string; size: string; color: string; quantity: number }> = {};

    transactions.filter(tx => tx.storeId === txStore).forEach(tx => {
      const isIncoming = ['STOCK_IN', 'TRANSFER_IN', 'RETURN'].includes(tx.type);
      const isOutgoing = ['SALE', 'TRANSFER_OUT', 'DAMAGE', 'RETURN_TO_SUPPLIER'].includes(tx.type);

      tx.items.forEach(it => {
        const key = `${(it.productName || '').toLowerCase().trim()}|${(it.size || '').toLowerCase().trim()}|${(it.color || '').toLowerCase().trim()}`;
        if (!stockMap[key]) {
          stockMap[key] = { productName: it.productName, size: it.size || '-', color: it.color || '-', quantity: 0 };
        }
        if (isIncoming) stockMap[key].quantity += it.quantity;
        if (isOutgoing) stockMap[key].quantity -= it.quantity;
      });
    });

    return Object.values(stockMap).filter(item => item.quantity > 0);
  }, [transactions, txStore]);

  const filteredStock = useMemo(() => {
    if (!searchQuery) return currentStock.slice(0, 15); 
    return currentStock.filter(item => 
      (item.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.size || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.color || '').toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 15);
  }, [searchQuery, currentStock]);

  const handleSelectStockItem = (item: any) => {
    setSearchQuery(item.productName || '');
    setProductName(item.productName || '');
    setSize(item.size || '');
    setColor(item.color || '');
    setIsDropdownOpen(false);
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) return toast.error(lang === 'en' ? 'Please select a product.' : 'እባክዎ ምርት ይምረጡ።');
    if (!itemQuantity || Number(itemQuantity) <= 0 || !itemUnitPrice || Number(itemUnitPrice) <= 0) return toast.error(lang === 'en' ? 'Please fill valid quantity and price.' : 'እባክዎ ትክክለኛ መጠን እና ዋጋ ይሙሉ።');

    const quantityNum = Number(itemQuantity);
    const selectedStock = currentStock.find(item => 
      (item.productName || '').toLowerCase().trim() === productName.toLowerCase().trim() &&
      (item.size || '-').toLowerCase().trim() === (size || '-').toLowerCase().trim() &&
      (item.color || '-').toLowerCase().trim() === (color || '-').toLowerCase().trim()
    );

    if (!selectedStock) return toast.error(lang === 'en' ? 'Product not found in this store\'s inventory.' : 'ምርቱ በዚህ መደብር ክምችት ውስጥ የለም።');
    
    if (quantityNum > selectedStock.quantity) {
      return toast.error(lang === 'en' ? `Not enough stock in ${txStore === 'main' ? 'Bole' : 'Jemo'}! Only ${selectedStock.quantity} available.` : `በቂ ክምችት የለም! በክምችት ያለው ${selectedStock.quantity} ብቻ ነው።`);
    }

    setSubmitLoading(true);
    try {
      const priceNum = Number(itemUnitPrice);
      const totalAmount = quantityNum * priceNum;
      const itemData = { productName: productName.trim(), quantity: quantityNum, unitPrice: priceNum, size: size.trim() || '-', color: color.trim() || '-' };

      // ==============================================================
      // AUTOMATED DOUBLE-ENTRY FIX FOR ADMIN
      // ==============================================================
      if (txType === 'TRANSFER_OUT') {
        const destinationStore = txStore === 'main' ? 'sub' : 'main';
        
        await Promise.all([
          stockService.createTransaction({
            type: 'TRANSFER_OUT',
            storeId: txStore,
            items: [itemData],
            totalAmount,
            note: note || `Transferred to ${destinationStore === 'main' ? 'Bole' : 'Jemo'}`,
          }),
          stockService.createTransaction({
            type: 'TRANSFER_IN',
            storeId: destinationStore,
            items: [itemData],
            totalAmount,
            note: note || `Received from ${txStore === 'main' ? 'Bole' : 'Jemo'}`,
          })
        ]);
        toast.success(lang === 'en' ? 'Transfer completed successfully!' : 'ዝውውሩ በተሳካ ሁኔታ ተጠናቋል!');
      } else {
        await stockService.createTransaction({
          type: 'SALE',
          storeId: txStore,
          items: [itemData],
          totalAmount,
          note,
        });
        toast.success(lang === 'en' ? 'Stock-out registered successfully.' : 'ወጪ ግብይት በተሳካ ሁኔታ ተመዝግቧል።');
      }
      
      setIsModalOpen(false);
      setSearchQuery(''); setProductName(''); setSize(''); setColor(''); setItemQuantity(1); setItemUnitPrice(''); setNote('');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || (lang === 'en' ? 'Failed to record transaction.' : 'መመዝገብ አልተሳካም።'));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(lang === 'en' ? 'Are you sure you want to delete this transaction?' : 'ይህን የግብይት መዝገብ መሰረዝ እርግጠኛ ነዎት?')) {
      try {
        await stockService.deleteTransaction(id);
        toast.success(lang === 'en' ? 'Transaction deleted successfully.' : 'ግብይቱ በተሳካ ሁኔታ ተሰርዟል።');
        if (selectedDateTransactions) {
          const updated = selectedDateTransactions.filter(tx => tx.id !== id);
          if (updated.length === 0) setSelectedDateTransactions(null);
          else setSelectedDateTransactions(updated);
        }
        fetchData();
      } catch (error) {
        toast.error(lang === 'en' ? 'Failed to delete transaction.' : 'ግብይቱን መሰረዝ አልተሳካም።');
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

  const outgoingTransactions = transactions.filter((tx) => ['SALE', 'TRANSFER_OUT'].includes(tx.type));

  const filtered = outgoingTransactions.filter((tx) => {
    if (storeFilter !== 'all' && tx.storeId !== storeFilter) return false;
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

  const getStoreName = (storeId: 'main' | 'sub') => {
    if (storeId === 'main') return lang === 'en' ? 'Main Store (Bole)' : 'ዋና መደብር (ቦሌ)';
    return lang === 'en' ? 'Annex (Jemo)' : 'ቅርንጫፍ (ጀሞ)';
  };

  const getTxTypeLabel = (type: string) => {
    if (type === 'SALE') return t.stockOut.sale || 'Sale';
    if (type === 'TRANSFER_OUT') return t.stockOut.transfer || 'Transfer Out';
    return type;
  };

  const getTxTypeStyles = (type: string) => {
    if (type === 'SALE') return 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300';
    if (type === 'TRANSFER_OUT') return 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300';
    return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  };

  return (
    <div className="space-y-10">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-[#E8E0D5]/60 dark:border-[#2D1E14]/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#3D2B1F] dark:text-[#FAF7F2] font-serif uppercase">
            {t.stockOut.title || 'Stock Out Register'}
          </h1>
          <p className="text-sm text-[#6B4F3C] dark:text-[#A68F80] mt-1">
            {t.stockOut.subtitle || 'Sales and outgoing transfers'} <span className="font-semibold text-[#A16438]">(Admin View)</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 self-start">
          <div className="flex items-center bg-white/40 dark:bg-black/20 border border-[#E8E0D5] dark:border-[#2D1E14] rounded-full p-1">
            <button onClick={() => setStoreFilter('all')} className={`text-[10px] sm:text-xs font-bold px-4 py-2 rounded-full transition-all uppercase tracking-wider ${storeFilter === 'all' ? 'bg-[#A16438] text-white shadow-sm' : 'text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438]'}`}>{t.inventory.bothBranches || 'All'}</button>
            <button onClick={() => setStoreFilter('main')} className={`text-[10px] sm:text-xs font-bold px-4 py-2 rounded-full transition-all uppercase tracking-wider ${storeFilter === 'main' ? 'bg-[#A16438] text-white shadow-sm' : 'text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438]'}`}>{t.inventory.mainStoreFilter || 'Bole'}</button>
            <button onClick={() => setStoreFilter('sub')} className={`text-[10px] sm:text-xs font-bold px-4 py-2 rounded-full transition-all uppercase tracking-wider ${storeFilter === 'sub' ? 'bg-[#A16438] text-white shadow-sm' : 'text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438]'}`}>{t.inventory.annexFilter || 'Jemo'}</button>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="bg-[#A16438] hover:bg-[#854F2B] text-white font-bold text-[10px] sm:text-xs uppercase tracking-widest px-5 py-2.5 rounded-full transition-colors shadow-sm">
            {t.inventory.addOutflow || '+ Record Sale'}
          </button>
        </div>
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
                {typeFilter === 'TRANSFER_OUT' ? (lang === 'en' ? 'Total Transfer Value' : 'የዝውውር ጠቅላላ ዋጋ') : typeFilter === 'SALE' ? (lang === 'en' ? 'Total Sales Value' : 'የሽያጭ ጠቅላላ ዋጋ') : (lang === 'en' ? 'Total Outgoing Value' : 'ጠቅላላ ወጪ ዋጋ')}
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-[#3D2B1F] dark:text-[#FAF7F2] font-serif">
                  ብር {filteredTotalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl p-6 shadow-sm transition-all duration-300">
              <span className="text-[10px] font-bold tracking-widest text-[#6B4F3C] dark:text-[#A68F80] uppercase">
                {typeFilter === 'TRANSFER_OUT' ? (lang === 'en' ? 'Total Items Transferred' : 'የተዘዋወረ እቃ ብዛት') : (lang === 'en' ? 'Total Items Sold' : 'የተሸጠው እቃ ብዛት')}
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-[#3D2B1F] dark:text-[#FAF7F2] font-serif">
                  {filteredTotalItems.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl p-6 shadow-sm transition-all duration-300">
              <span className="text-[10px] font-bold tracking-widest text-[#6B4F3C] dark:text-[#A68F80] uppercase">
                {t.stockOut.totalEntries || 'Total Entries'}
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
                <input type="text" placeholder={t.inventory.searchOutflowPlaceholder || 'Search records...'} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438]" />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-white/40 dark:bg-black/20 border border-[#E8E0D5] dark:border-[#2D1E14] rounded-full p-0.5">
                  <button onClick={() => setTypeFilter('ALL')} className={`text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider transition-colors ${typeFilter === 'ALL' ? 'bg-[#A16438] text-white shadow-sm' : 'text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438]'}`}>{t.inventory.all || 'All'}</button>
                  <button onClick={() => setTypeFilter('SALE')} className={`text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider transition-colors ${typeFilter === 'SALE' ? 'bg-[#A16438] text-white shadow-sm' : 'text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438]'}`}>{t.stockOut.sale || 'Sale'}</button>
                  <button onClick={() => setTypeFilter('TRANSFER_OUT')} className={`text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider transition-colors ${typeFilter === 'TRANSFER_OUT' ? 'bg-[#A16438] text-white shadow-sm' : 'text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438]'}`}>{t.stockOut.transfer || 'Transfer'}</button>
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
                  <div className="text-4xl mb-4">📅</div>
                  <p className="text-[#6B4F3C] dark:text-[#A68F80]/60 italic">{t.stockOut.noRecords || 'No records found.'}</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E8E0D5] dark:border-[#2D1E14] text-[10px] font-bold tracking-widest text-[#6B4F3C] dark:text-[#A68F80] uppercase">
                      <th className="pb-3">{lang === 'en' ? 'Date' : 'ቀን'}</th>
                      <th className="pb-3 text-center">{lang === 'en' ? 'Total Records' : 'የግብይት ብዛት'}</th>
                      <th className="pb-3 text-center">{typeFilter === 'TRANSFER_OUT' ? (lang === 'en' ? 'Total Items Transferred' : 'የተዘዋወረ እቃ ብዛት') : (lang === 'en' ? 'Total Items Sold' : 'የተሸጠው እቃ ብዛት')}</th>
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

      {/* Admin Add Stock Out Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6 relative">
            <div className="flex items-start justify-between border-b border-[#E8E0D5]/60 dark:border-[#2D1E14]/40 pb-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#3D2B1F] dark:text-[#FAF7F2] uppercase">{t.common.recordOutflowModal || 'Record Outgoing Stock'}</h3>
                <span className="text-xs text-[#6B4F3C] dark:text-[#A68F80] block mt-1 uppercase font-semibold">Admin Entry</span>
              </div>
              <button onClick={() => { setIsModalOpen(false); setSearchQuery(''); setProductName(''); }} className="text-2xl text-[#6B4F3C]/60 dark:text-[#A68F80]/60 hover:text-rose-500 font-bold transition-colors">×</button>
            </div>

            <form onSubmit={handleTransactionSubmit} className="space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">Source Branch Store</label>
                  <select value={txStore} onChange={(e) => setTxStore(e.target.value as 'main' | 'sub')} className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-3 text-xs font-bold text-[#A16438] focus:outline-none focus:border-[#A16438]">
                    <option value="main">Main Store (Bole)</option>
                    <option value="sub">Annex (Jemo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">{lang === 'en' ? 'Transaction Type' : 'የግብይት አይነት'}</label>
                  <div className="flex items-center gap-1 bg-[#FAF7F2] dark:bg-[#0D0806] p-1 rounded-xl border border-[#E8E0D5] dark:border-[#2D1E14]">
                    <button type="button" onClick={() => setTxType('SALE')} className={`flex-1 text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-lg transition-all ${txType === 'SALE' ? 'bg-[#A16438] text-white shadow-sm' : 'text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438]'}`}>{lang === 'en' ? 'Sale' : 'ሽያጭ'}</button>
                    <button type="button" onClick={() => setTxType('TRANSFER_OUT')} className={`flex-1 text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-lg transition-all ${txType === 'TRANSFER_OUT' ? 'bg-[#A16438] text-white shadow-sm' : 'text-[#6B4F3C] dark:text-[#A68F80] hover:text-[#A16438]'}`}>{lang === 'en' ? 'Transfer' : 'ዝውውር'}</button>
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">1. {lang === 'en' ? 'Select Product' : 'ምርት ይምረጡ'}</label>
                <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setProductName(e.target.value); setIsDropdownOpen(true); }} onFocus={() => setIsDropdownOpen(true)} onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} placeholder={lang === 'en' ? `Search inventory in ${txStore === 'main' ? 'Bole' : 'Jemo'}...` : 'በክምችት ለመፈለግ ይጻፉ...'} className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-3 text-sm text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] focus:ring-1 focus:ring-[#A16438]" required />
                
                {isDropdownOpen && (
                  <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {filteredStock.length > 0 ? (
                      filteredStock.map((item, index) => (
                        <li key={index} onClick={() => handleSelectStockItem(item)} className="px-4 py-3 border-b border-[#E8E0D5]/50 dark:border-[#2D1E14]/50 cursor-pointer hover:bg-[#FAF7F2] dark:hover:bg-[#0D0806] flex justify-between items-center transition-colors">
                          <div>
                            <span className="block text-sm font-bold text-[#3D2B1F] dark:text-[#FAF7F2]">{item.productName}</span>
                            <span className="text-[10px] uppercase tracking-wider text-[#6B4F3C] dark:text-[#A68F80]">Size: {item.size} · Color: {item.color}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#A16438] bg-[#A16438]/10 px-2 py-1 rounded-md">Qty: {item.quantity}</span>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-3 text-sm text-center text-rose-500 italic">{lang === 'en' ? `Product not found in ${txStore === 'main' ? 'Bole' : 'Jemo'}.` : 'ምርቱ በክምችት ውስጥ የለም።'}</li>
                    )}
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
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">5. {lang === 'en' ? 'Unit Price (ETB)' : 'የአንዱ ዋጋ (ብር)'}</label>
                  <input type="number" min="0" step="any" value={itemUnitPrice} onChange={(e) => setItemUnitPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder={lang === 'en' ? 'Enter price' : 'ዋጋ ያስገቡ'} className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-3 text-base font-mono text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438] focus:ring-1 focus:ring-[#A16438] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" required />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3D2B1F] dark:text-[#FAF7F2] mb-1.5">{t.common.note || 'Note (Optional)'}</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Invoice code or customer name" className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-4 py-2.5 text-sm text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438]" />
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-[#A16438]">Total Amount</span>
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

      {/* Daily Details Modal */}
      {selectedDateTransactions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8E0D5]/60 dark:border-[#2D1E14]/40 pb-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#3D2B1F] dark:text-[#FAF7F2] uppercase">{lang === 'en' ? 'Daily Outgoing Report' : 'የዕለት ወጪ ሪፖርት'}</h3>
                <span className="text-sm font-bold text-[#A16438] block mt-1">{selectedDateLabel}</span>
              </div>
              <button onClick={() => setSelectedDateTransactions(null)} className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#3D2B1F] dark:text-[#FAF7F2] p-2 rounded-full font-bold transition-colors">✕</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E0D5] dark:border-[#2D1E14] text-[10px] font-bold tracking-widest text-[#6B4F3C] dark:text-[#A68F80] uppercase">
                    <th className="pb-3">{t.stockIn.type || 'Type'}</th>
                    <th className="pb-3">{t.reports.store || 'Store'}</th>
                    <th className="pb-3">{t.stockIn.items || 'Items'}</th>
                    <th className="pb-3 text-right">{t.stockIn.total || 'Total'}</th>
                    <th className="pb-3 text-center">{t.stockIn.actions || 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D5]/40 dark:divide-[#2D1E14]/30">
                  {selectedDateTransactions.map((tx) => (
                    <tr key={tx.id} className="text-sm text-[#3D2B1F] dark:text-[#FAF7F2]/90 hover:bg-[#FAF7F2]/50 dark:hover:bg-[#0D0806]/30 transition-colors">
                      <td className="py-4">
                        <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${getTxTypeStyles(tx.type)}`}>{getTxTypeLabel(tx.type)}</span>
                        <span className="block text-xs mt-1 opacity-60">{new Date(tx.date).toLocaleTimeString(lang === 'en' ? 'en-US' : 'am-ET', { timeZone: 'Africa/Addis_Ababa', hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="py-4 text-[#6B4F3C] dark:text-[#A68F80] font-medium text-xs uppercase tracking-wider">{getStoreName(tx.storeId)}</td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1">
                          {tx.items.map((it, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="font-semibold">{it.productName}</span>
                              <span className="text-xs text-[#6B4F3C] dark:text-[#A68F80]">{it.size} · {it.color} · <strong className="text-[#3D2B1F] dark:text-white">{it.quantity} units</strong></span>
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