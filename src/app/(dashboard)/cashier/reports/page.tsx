'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { translations } from '@/utils/translations';
import { stockService } from '@/services/stockService';
import { Product, Transaction } from '@/types';

interface DailyStockItemReport {
  productName: string;
  size: string;
  color: string;
  stockIn: number;
  stockOut: number;
  closingBalance: number;
}

export default function CashierReportsPage() {
  const { lang, user } = useAuth();
  const t = translations[lang];

  const cashierStore = user?.assignedStore || 'main';

  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Daily Details Pop-up Modal States
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedDateLabel, setSelectedDateLabel] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [cashierStore]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [storeProducts, storeTransactions] = await Promise.all([
        stockService.getProducts(cashierStore),
        stockService.getTransactions(cashierStore),
      ]);
      setProducts(storeProducts);
      setTransactions(storeTransactions);
    } catch (error) {
      console.error('Error fetching cashier report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ETHIOPIAN TIME FORMATTER - groups into YYYY-MM-DD string
  const getEthioDateString = (dateStr?: string | Date) => {
    try {
      const d = dateStr ? new Date(dateStr) : new Date();
      return new Intl.DateTimeFormat('en-CA', { 
        timeZone: 'Africa/Addis_Ababa',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(d);
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'am-ET', {
        timeZone: 'Africa/Addis_Ababa',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStoreLabel = (storeId: 'main' | 'sub') => {
    if (storeId === 'main') return lang === 'en' ? 'Main Store (Bole)' : 'ዋና መደብር (ቦሌ)';
    return lang === 'en' ? 'Annex (Jemo)' : 'ቅርንጫፍ (ጀሞ)';
  };

  // Group all transactions by Day (Ethiopian Time)
  const filteredTransactions = transactions.filter((tx) => {
    if (dateFilter) {
      const txDate = getEthioDateString(tx.date);
      if (txDate !== dateFilter) return false;
    }

    // BULLETPROOF SEARCH FIX: Prevent .toLowerCase() crashes
    if (search) {
      const matchesSearch = tx.items.some(
        (it) =>
          (it.productName || '').toLowerCase().includes(search.toLowerCase()) ||
          (it.color || '').toLowerCase().includes(search.toLowerCase()) ||
          (it.size || '').toLowerCase().includes(search.toLowerCase())
      ) || (tx.note && (tx.note || '').toLowerCase().includes(search.toLowerCase()));
      if (!matchesSearch) return false;
    }

    return true;
  });

  const groupedByDay = filteredTransactions.reduce((acc: any, tx) => {
    const day = getEthioDateString(tx.date);
    if (!acc[day]) {
      acc[day] = {
        transactions: [],
        totalStockInQty: 0,
        totalStockOutQty: 0,
        totalSalesValue: 0,
      };
    }
    acc[day].transactions.push(tx);

    // Calculate totals for summary table
    tx.items.forEach((it) => {
      if (['PURCHASE', 'TRANSFER_IN', 'STOCK_IN'].includes(tx.type)) {
        acc[day].totalStockInQty += it.quantity;
      } else if (['SALE', 'TRANSFER_OUT', 'DAMAGE'].includes(tx.type)) {
        acc[day].totalStockOutQty += it.quantity;
        if (tx.type === 'SALE') {
          acc[day].totalSalesValue += it.quantity * it.unitPrice;
        }
      }
    });

    return acc;
  }, {});

  // Convert daily groups to array and sort newest first
  const dailyRows = Object.entries(groupedByDay).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

  // Function to calculate exact detailed item reports for a chosen pop-up day
  const getDetailedDayReport = (targetDateKey: string): DailyStockItemReport[] => {
    const itemGroups: { [key: string]: { productName: string; size: string; color: string } } = {};

    // Seed current products securely
    products.forEach((p) => {
      const colorLabel = (p.color || '-').trim();
      const sizeLabel = (p.size || '-').trim();
      const nameLabel = (p.name || '').trim();
      const key = `${nameLabel}-${sizeLabel}-${colorLabel}`;
      itemGroups[key] = {
        productName: nameLabel,
        size: sizeLabel,
        color: colorLabel,
      };
    });

    // Seed historical transactions items securely
    transactions.forEach((tx) => {
      tx.items.forEach((it) => {
        const colorLabel = (it.color || '-').trim();
        const sizeLabel = (it.size || '-').trim();
        const nameLabel = (it.productName || '').trim();
        const key = `${nameLabel}-${sizeLabel}-${colorLabel}`;
        if (!itemGroups[key]) {
          itemGroups[key] = {
            productName: nameLabel,
            size: sizeLabel,
            color: colorLabel,
          };
        }
      });
    });

    const reportRows: DailyStockItemReport[] = [];

    Object.values(itemGroups).forEach((group) => {
      let stockIn = 0;
      let stockOut = 0;
      let netMovementAfter = 0;

      transactions.forEach((tx) => {
        const txDateStr = getEthioDateString(tx.date);

        tx.items.forEach((it) => {
          if (
            (it.productName || '').trim() === group.productName &&
            (it.size || '-').trim() === group.size &&
            (it.color || '-').trim() === group.color
          ) {
            if (txDateStr === targetDateKey) {
              if (['PURCHASE', 'TRANSFER_IN', 'STOCK_IN'].includes(tx.type)) {
                stockIn += it.quantity;
              } else if (['SALE', 'TRANSFER_OUT', 'DAMAGE'].includes(tx.type)) {
                stockOut += it.quantity;
              }
            } else if (txDateStr > targetDateKey) {
              if (['PURCHASE', 'TRANSFER_IN', 'STOCK_IN'].includes(tx.type)) {
                netMovementAfter += it.quantity;
              } else if (['SALE', 'TRANSFER_OUT', 'DAMAGE'].includes(tx.type)) {
                netMovementAfter -= it.quantity;
              }
            }
          }
        });
      });

      const currentQty = products
        .filter(
          (p) =>
            (p.name || '').trim() === group.productName &&
            (p.size || '-').trim() === group.size &&
            (p.color || '-').trim() === group.color
        )
        .reduce((sum, p) => sum + (p.currentQuantity || 0), 0);

      const closingBalance = currentQty - netMovementAfter;

      if (stockIn > 0 || stockOut > 0 || closingBalance > 0) {
        reportRows.push({
          productName: group.productName,
          size: group.size,
          color: group.color,
          stockIn,
          stockOut,
          closingBalance,
        });
      }
    });

    return reportRows;
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlySales = transactions
    .filter((tx) => {
      const txDate = new Date(tx.date);
      return (
        tx.type === 'SALE' &&
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, tx) => sum + tx.totalAmount, 0);

  const totalProductsCount = products.reduce((sum, p) => sum + (p.currentQuantity || 0), 0);

  const activeReportData = selectedDateKey ? getDetailedDayReport(selectedDateKey) : [];

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <div className="border-b border-[#E8E0D5]/60 dark:border-[#2D1E14]/40 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#3D2B1F] dark:text-[#FAF7F2] font-serif uppercase">
          {t.reports.title || 'Daily Stock Reports'}
        </h1>
        <p className="text-sm text-[#6B4F3C] dark:text-[#A68F80] mt-1">
          {t.reports.subtitle || 'Audited daily inventory logs'} · <span className="font-semibold text-[#A16438]">{getStoreLabel(cashierStore)}</span>
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-[#A16438] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl p-6 shadow-sm">
              <span className="text-[10px] font-bold tracking-widest text-[#6B4F3C] dark:text-[#A68F80] uppercase">
                {lang === 'en' ? 'Monthly Sales Revenue' : 'የወሩ ሽያጭ'}
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-[#3D2B1F] dark:text-[#FAF7F2] font-serif">
                  ብር {monthlySales.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl p-6 shadow-sm">
              <span className="text-[10px] font-bold tracking-widest text-[#6B4F3C] dark:text-[#A68F80] uppercase">
                {lang === 'en' ? 'Total Active Days' : 'የመዝገብ ቀናት'}
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-[#3D2B1F] dark:text-[#FAF7F2] font-serif">
                  {dailyRows.length}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl p-6 shadow-sm">
              <span className="text-[10px] font-bold tracking-widest text-[#6B4F3C] dark:text-[#A68F80] uppercase">
                {lang === 'en' ? 'Current Physical Units' : 'አሁን ያለው እቃ ብዛት'}
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-[#3D2B1F] dark:text-[#FAF7F2] font-serif">
                  {totalProductsCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Table & Filters Card */}
          <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl p-6 shadow-sm">
            
            {/* Filters Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E0D5]/60 dark:border-[#2D1E14]/40 mb-6">
              <div className="flex-1 relative max-w-md">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#6B4F3C]/50 dark:text-[#A68F80]/50">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder={t.inventory.searchPlaceholder || 'Search reports...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#3D2B1F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#A16438]"
                />
              </div>

              <div className="flex items-center bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-lg px-3 py-2 text-xs font-bold text-[#6B4F3C] dark:text-[#A68F80]">
                <span className="mr-2 uppercase">{t.stockIn.selectDate || 'Filter Date'}:</span>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent border-0 focus:outline-none dark:color-scheme-dark"
                />
                {dateFilter && (
                  <button onClick={() => setDateFilter('')} className="ml-2 text-rose-500 font-bold">
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Daily Grouped Table */}
            <div className="overflow-x-auto">
              {dailyRows.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-4">📅</div>
                  <p className="text-[#6B4F3C] dark:text-[#A68F80]/60 italic">
                    {lang === 'en' ? 'No reports found for the selected criteria.' : 'ምንም ዓይነት ሪፖርት አልተገኘም።'}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E8E0D5] dark:border-[#2D1E14] text-[10px] font-bold tracking-widest text-[#6B4F3C] dark:text-[#A68F80] uppercase">
                      <th className="pb-3">{lang === 'en' ? 'Date' : 'ቀን'}</th>
                      <th className="pb-3 text-center">{lang === 'en' ? 'Transactions' : 'የግብይት ብዛት'}</th>
                      <th className="pb-3 text-center">{lang === 'en' ? 'Stock In (+)' : 'ገቢ እቃ ብዛት'}</th>
                      <th className="pb-3 text-center">{lang === 'en' ? 'Stock Out (-)' : 'ወጪ እቃ ብዛት'}</th>
                      <th className="pb-3 text-right">{lang === 'en' ? 'Sales Value' : 'የቀኑ ሽያጭ'}</th>
                      <th className="pb-3 text-center">{t.stockIn.actions || 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E0D5]/40 dark:divide-[#2D1E14]/30">
                    {dailyRows.map(([dateKey, dayData]: any) => (
                      <tr key={dateKey} className="text-sm text-[#3D2B1F] dark:text-[#FAF7F2]/90 hover:bg-[#FAF7F2]/50 dark:hover:bg-[#0D0806]/30 transition-colors">
                        <td className="py-4 font-semibold text-[#A16438]">{formatDateDisplay(dateKey)}</td>
                        <td className="py-4 text-center font-mono">
                          <span className="bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full text-xs font-bold">
                            {dayData.transactions.length}
                          </span>
                        </td>
                        <td className="py-4 text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {dayData.totalStockInQty > 0 ? `+${dayData.totalStockInQty}` : '-'}
                        </td>
                        <td className="py-4 text-center font-mono font-semibold text-rose-600 dark:text-rose-400">
                          {dayData.totalStockOutQty > 0 ? `-${dayData.totalStockOutQty}` : '-'}
                        </td>
                        <td className="py-4 text-right font-semibold font-mono text-[#3D2B1F] dark:text-[#FAF7F2]">
                          ብር {dayData.totalSalesValue.toLocaleString()}
                        </td>
                        <td className="py-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedDateKey(dateKey);
                              setSelectedDateLabel(formatDateDisplay(dateKey));
                            }}
                            className="bg-[#FAF7F2] dark:bg-[#0D0806] border border-[#E8E0D5] dark:border-[#2D1E14] hover:border-[#A16438] text-[#A16438] font-bold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-colors"
                          >
                            {lang === 'en' ? 'View Details' : 'ዝርዝር እይ'}
                          </button>
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

      {/* Detailed Day Report Pop-Up Modal */}
      {selectedDateKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#160F0A] border border-[#E8E0D5] dark:border-[#2D1E14] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#E8E0D5]/60 dark:border-[#2D1E14]/40 pb-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#3D2B1F] dark:text-[#FAF7F2] uppercase">
                  {lang === 'en' ? 'Detailed Stock Audit' : 'የዕለት የክምችት ዝርዝር ሪፖርት'}
                </h3>
                <span className="text-sm font-bold text-[#A16438] block mt-1">
                  {selectedDateLabel}
                </span>
              </div>
              <button 
                onClick={() => setSelectedDateKey(null)}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#3D2B1F] dark:text-[#FAF7F2] p-2 rounded-full font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto">
              {activeReportData.length === 0 ? (
                <p className="text-center py-10 text-sm text-[#6B4F3C] italic">No active items recorded for this day.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E8E0D5] dark:border-[#2D1E14] text-[10px] font-bold tracking-widest text-[#6B4F3C] dark:text-[#A68F80] uppercase">
                      <th className="pb-3">{t.reports.product || 'Product Name'}</th>
                      <th className="pb-3 text-center">{t.reports.size || 'Size'}</th>
                      <th className="pb-3 text-center">{t.common?.color || 'Color'}</th>
                      <th className="pb-3 text-center">{t.reports.stockIn || 'Stock In'}</th>
                      <th className="pb-3 text-center">{t.reports.stockOut || 'Stock Out'}</th>
                      <th className="pb-3 text-right">{t.reports.closing || 'Closing Balance'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E0D5]/40 dark:divide-[#2D1E14]/30">
                    {activeReportData.map((row, idx) => (
                      <tr key={idx} className="text-sm text-[#3D2B1F] dark:text-[#FAF7F2]/90 hover:bg-[#FAF7F2]/50 dark:hover:bg-[#0D0806]/30 transition-colors">
                        <td className="py-4 font-semibold">{row.productName}</td>
                        <td className="py-4 text-center font-mono">{row.size}</td>
                        <td className="py-4 text-center font-mono text-[#6B4F3C] dark:text-[#A68F80]">{row.color}</td>
                        <td className="py-4 text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {row.stockIn > 0 ? `+${row.stockIn}` : '-'}
                        </td>
                        <td className="py-4 text-center font-mono font-semibold text-rose-600 dark:text-rose-400">
                          {row.stockOut > 0 ? `-${row.stockOut}` : '-'}
                        </td>
                        <td className="py-4 text-right font-bold font-mono text-[#A16438] dark:text-amber-200 text-base">
                          {row.closingBalance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}