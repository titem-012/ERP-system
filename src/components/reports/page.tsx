// src/app/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import NavBar from '@/components/NavBar';

interface Transaction {
  id: string;
  type:
    | 'SALE'
    | 'PURCHASE'
    | 'DAMAGE'
    | 'RETURN_IN'
    | 'RETURN_TO_SUPPLIER'
    | 'TRANSFER_IN'
    | 'TRANSFER_OUT';
  date: string;
  customerName?: string;
  supplierId?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice?: number;
    sellingPrice?: number;
    size: string;
    color: string;
  }[];
  totalAmount: number;
}

interface MonthlyData {
  month: string;
  salesAmount: number;
  purchaseAmount: number;
  damageAmount: number;
  netProfit: number;
}

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const loadData = () => {
    try {
      const storedTx = localStorage.getItem('cloth_shop_transactions');
      if (storedTx) {
        const allTx: Transaction[] = JSON.parse(storedTx);
        setTransactions(allTx);

        const years = allTx
          .map(tx => new Date(tx.date).getFullYear())
          .filter((y, i, arr) => arr.indexOf(y) === i)
          .sort((a, b) => b - a);
        if (years.length === 0) {
          setAvailableYears([new Date().getFullYear()]);
        } else {
          setAvailableYears(years);
          setSelectedYear(years[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load transactions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTransactionsByYear = (year: number) => {
    return transactions.filter(tx => new Date(tx.date).getFullYear() === year);
  };

  const getMonthlyData = (): MonthlyData[] => {
    const yearTxs = getTransactionsByYear(selectedYear);
    const monthsMap = new Map<string, MonthlyData>();
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    monthNames.forEach(month => {
      monthsMap.set(month, {
        month,
        salesAmount: 0,
        purchaseAmount: 0,
        damageAmount: 0,
        netProfit: 0,
      });
    });

    yearTxs.forEach(tx => {
      const date = new Date(tx.date);
      const monthName = monthNames[date.getMonth()];
      const monthData = monthsMap.get(monthName)!;
      if (tx.type === 'SALE') {
        monthData.salesAmount += tx.totalAmount;
      } else if (tx.type === 'PURCHASE') {
        monthData.purchaseAmount += tx.totalAmount;
      } else if (tx.type === 'DAMAGE') {
        monthData.damageAmount += tx.totalAmount;
      }
    });

    monthsMap.forEach(month => {
      month.netProfit = month.salesAmount - month.purchaseAmount;
    });

    return Array.from(monthsMap.values());
  };

  const yearTransactions = getTransactionsByYear(selectedYear);
  const totalSales = yearTransactions
    .filter(tx => tx.type === 'SALE')
    .reduce((sum, tx) => sum + tx.totalAmount, 0);
  const totalPurchases = yearTransactions
    .filter(tx => tx.type === 'PURCHASE')
    .reduce((sum, tx) => sum + tx.totalAmount, 0);
  const totalDamage = yearTransactions
    .filter(tx => tx.type === 'DAMAGE')
    .reduce((sum, tx) => sum + tx.totalAmount, 0);
  const netProfit = totalSales - totalPurchases;
  const totalItemsSold = yearTransactions
    .filter(tx => tx.type === 'SALE')
    .reduce((sum, tx) => sum + tx.items.reduce((s, i) => s + i.quantity, 0), 0);

  const monthlyData = getMonthlyData();

  // Transaction type totals (for summary)
  const typeTotals = [
    { type: 'Sales', amount: totalSales, color: 'text-emerald-400' },
    { type: 'Purchases', amount: totalPurchases, color: 'text-blue-400' },
    { type: 'Damages', amount: totalDamage, color: 'text-red-400' },
  ].filter(t => t.amount > 0);

  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen text-white">
        <NavBar />
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <NavBar />
      <div className="p-6">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">📊 Reports & Analytics</h1>
            <p className="text-slate-400 text-sm mt-1">Monthly and yearly breakdown – all numbers, no charts</p>
          </div>
          <div>
            <label className="text-sm text-slate-400 mr-2">Year:</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <p className="text-sm text-slate-400">Total Sales (₹)</p>
            <p className="text-2xl font-bold text-emerald-400">₹{totalSales.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <p className="text-sm text-slate-400">Total Purchases (₹)</p>
            <p className="text-2xl font-bold text-blue-400">₹{totalPurchases.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <p className="text-sm text-slate-400">Net Profit (₹)</p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ₹{netProfit.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <p className="text-sm text-slate-400">Items Sold</p>
            <p className="text-2xl font-bold text-indigo-400">{totalItemsSold.toLocaleString()}</p>
          </div>
        </div>

        {/* Transaction type distribution table (instead of pie chart) */}
        {typeTotals.length > 0 && (
          <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Value by Transaction Type</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-700">
                  <tr>
                    <th className="text-left py-2 text-slate-400">Type</th>
                    <th className="text-right py-2 text-slate-400">Amount (₹)</th>
                    <th className="text-right py-2 text-slate-400">Percentage of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {typeTotals.map((item, idx) => {
                    const totalAll = typeTotals.reduce((sum, i) => sum + i.amount, 0);
                    const percent = totalAll > 0 ? ((item.amount / totalAll) * 100).toFixed(1) : 0;
                    return (
                      <tr key={idx} className="border-b border-slate-800/50">
                        <td className="py-2 font-medium">{item.type}</td>
                        <td className={`py-2 text-right ${item.color}`}>₹{item.amount.toLocaleString()}</td>
                        <td className="py-2 text-right text-slate-300">{percent}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Monthly breakdown table */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Monthly Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-700">
                <tr>
                  <th className="text-left py-2 text-slate-400">Month</th>
                  <th className="text-right py-2 text-slate-400">Sales (₹)</th>
                  <th className="text-right py-2 text-slate-400">Purchases (₹)</th>
                  <th className="text-right py-2 text-slate-400">Profit (₹)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month, idx) => (
                  <tr key={idx} className="border-b border-slate-800/50">
                    <td className="py-2 font-medium">{month.month}</td>
                    <td className="py-2 text-right text-emerald-400">₹{month.salesAmount.toLocaleString()}</td>
                    <td className="py-2 text-right text-blue-400">₹{month.purchaseAmount.toLocaleString()}</td>
                    <td className={`py-2 text-right font-medium ${month.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ₹{month.netProfit.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {monthlyData.every(m => m.salesAmount === 0 && m.purchaseAmount === 0) && (
                  <tr><td colSpan={4} className="text-center text-slate-400 py-8">No transactions for {selectedYear}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expandable transaction list */}
        <div className="mt-4">
          <button
            onClick={() => {
              const details = document.getElementById('year-details');
              if (details) details.classList.toggle('hidden');
            }}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition mb-2"
          >
            📋 {yearTransactions.length} transactions for {selectedYear} – click to view/hide
          </button>
          <div id="year-details" className="hidden bg-slate-900/50 rounded-xl border border-slate-800 p-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-slate-700">
                <tr>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-right py-2">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {yearTransactions.map(tx => (
                  <tr key={tx.id} className="border-b border-slate-800/50">
                    <td className="py-2">{format(parseISO(tx.date), 'dd MMM yyyy')}</td>
                    <td className="py-2">{tx.type}</td>
                    <td className="py-2 text-right">₹{tx.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
                {yearTransactions.length === 0 && (
                  <tr><td colSpan={3} className="text-center py-4 text-slate-400">No transactions</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}