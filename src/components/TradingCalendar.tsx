/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { DailyPnL, Trade } from '../types/trade';
import { formatCurrency } from '../utils/tradingCalculations';

interface TradingCalendarProps {
  dailyMap: Map<string, DailyPnL>;
  currency: 'USD' | 'IDR';
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export const TradingCalendar: React.FC<TradingCalendarProps> = ({
  dailyMap,
  currency,
  selectedDate,
  onSelectDate,
}) => {
  // Default to October/November 2026 based on seed dates
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = October, 10 = November

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Days in month
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun
  // Let's adjust to start with Monday (Senin)
  // Monday = 0, Sunday = 6
  const startOffset = (firstDayOfWeek + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Monthly stats
  let monthPnl = 0;
  let monthTradeCount = 0;
  let profitDaysCount = 0;
  let lossDaysCount = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = String(d).padStart(2, '0');
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const key = `${currentYear}-${mStr}-${dStr}`;
    const dayData = dailyMap.get(key);
    if (dayData && dayData.tradeCount > 0) {
      monthPnl += dayData.pnl;
      monthTradeCount += dayData.tradeCount;
      if (dayData.pnl > 0) profitDaysCount++;
      if (dayData.pnl < 0) lossDaysCount++;
    }
  }

  // Helper for color intensity based on PnL
  const getCellStyles = (pnl: number | undefined) => {
    if (pnl === undefined) {
      return 'bg-[#111a2e] border-[#1e2b45] text-[#8a9ab5] hover:border-[#2a3c61] hover:bg-[#16223b]';
    }
    if (pnl > 0) {
      // Graduated green: 0.1 to 0.45
      const intensity = Math.min(0.45, 0.12 + (pnl / 2000) * 0.33);
      return `border-emerald-500/40 text-[#22c55e] hover:border-emerald-400`;
    }
    if (pnl < 0) {
      // Graduated red: 0.1 to 0.45
      const intensity = Math.min(0.45, 0.12 + (Math.abs(pnl) / 1000) * 0.33);
      return `border-rose-500/40 text-[#ef4444] hover:border-rose-400`;
    }
    return 'bg-[#111a2e] border-[#1e2b45] text-[#8a9ab5]';
  };

  const getCellBgColor = (pnl: number | undefined) => {
    if (pnl === undefined) return '#111a2e';
    if (pnl > 0) {
      const alpha = Math.min(0.45, 0.12 + (pnl / 2000) * 0.33);
      return `rgba(34, 197, 94, ${alpha.toFixed(2)})`;
    }
    if (pnl < 0) {
      const alpha = Math.min(0.45, 0.12 + (Math.abs(pnl) / 1000) * 0.33);
      return `rgba(239, 68, 68, ${alpha.toFixed(2)})`;
    }
    return '#111a2e';
  };

  return (
    <div className="bg-[#111a2e] border border-[#1e2b45] rounded-[14px] p-5">
      {/* Calendar Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#22d3ee]" />
            <h3 className="text-sm font-semibold text-[#e6edf7] uppercase tracking-wider">
              Kalender Performa Trading Harian
            </h3>
          </div>
          <p className="text-xs text-[#8a9ab5] mt-0.5">
            PnL Bersih {monthNames[currentMonth]} {currentYear}:{' '}
            <strong className={monthPnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
              {formatCurrency(monthPnl, currency, true)}
            </strong>{' '}
            &bull; ({profitDaysCount} Hari Cuan / {lossDaysCount} Hari Rugi)
          </p>
        </div>

        {/* Month Selector Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {selectedDate && (
            <button
              onClick={() => onSelectDate(null)}
              className="text-[11px] px-2 py-1 rounded bg-[#1e2b45] text-[#22d3ee] hover:bg-[#2a3c61] transition"
            >
              Hapus Filter Tanggal
            </button>
          )}
          <div className="flex items-center bg-[#0f172a] rounded-lg border border-[#1e2b45] p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-[#8a9ab5] hover:text-[#e6edf7] hover:bg-[#16223b] rounded transition"
              aria-label="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-[#e6edf7] tabular-nums">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 text-[#8a9ab5] hover:text-[#e6edf7] hover:bg-[#16223b] rounded transition"
              aria-label="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center text-[11px] font-semibold text-[#8a9ab5]">
        <div>SEN</div>
        <div>SEL</div>
        <div>RAB</div>
        <div>KAM</div>
        <div>JUM</div>
        <div className="text-[#4b5d78]">SAB</div>
        <div className="text-[#4b5d78]">MIN</div>
      </div>

      {/* Grid of days */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Empty cells before month start */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="aspect-square rounded-[6px] bg-[#0b1220]/40 border border-transparent opacity-30"
          />
        ))}

        {/* Days in Month */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const dStr = String(dayNum).padStart(2, '0');
          const mStr = String(currentMonth + 1).padStart(2, '0');
          const dateKey = `${currentYear}-${mStr}-${dStr}`;
          const dayData = dailyMap.get(dateKey);
          const hasTrade = dayData && dayData.tradeCount > 0;
          const isSelected = selectedDate === dateKey;

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(isSelected ? null : dateKey)}
              style={{
                backgroundColor: hasTrade ? getCellBgColor(dayData?.pnl) : '#111a2e',
              }}
              className={`aspect-square rounded-[6px] border p-1.5 flex flex-col justify-between transition-all duration-150 cursor-pointer text-left relative group ${
                isSelected
                  ? 'ring-2 ring-[#3b82f6] border-[#3b82f6] shadow-lg'
                  : hasTrade
                  ? getCellStyles(dayData?.pnl)
                  : 'bg-[#111a2e] border-[#1e2b45] hover:border-[#2a3c61]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-[11px] font-medium leading-none tabular-nums font-mono-num ${
                    hasTrade ? 'text-[#e6edf7] font-semibold' : 'text-[#8a9ab5]'
                  }`}
                >
                  {dayNum}
                </span>
                {hasTrade && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-[#0b1220]/60 text-[#8a9ab5] font-mono-num">
                    {dayData.tradeCount}T
                  </span>
                )}
              </div>

              {hasTrade ? (
                <div className="text-right w-full overflow-hidden">
                  <span
                    className={`block text-[10px] sm:text-[11px] font-bold tabular-nums font-mono-num truncate ${
                      dayData.pnl > 0
                        ? 'text-[#22c55e]'
                        : dayData.pnl < 0
                        ? 'text-[#ef4444]'
                        : 'text-[#8a9ab5]'
                    }`}
                  >
                    {formatCurrency(dayData.pnl, currency, true)}
                  </span>
                </div>
              ) : (
                <div className="h-3" />
              )}

              {/* Tooltip on hover */}
              {hasTrade && (
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 pointer-events-none bg-[#131e36] border border-[#3b82f6] rounded-lg p-2 text-xs shadow-xl min-w-[150px] whitespace-nowrap">
                  <p className="font-semibold text-[#e6edf7] text-[11px] border-b border-[#1e2b45] pb-1 mb-1">
                    {dateKey} &bull; {dayData.tradeCount} Transaksi
                  </p>
                  <p className="text-[10px] text-[#22c55e]">
                    Menang: {dayData.winCount} | Rugi: {dayData.lossCount}
                  </p>
                  <p
                    className={`text-[11px] font-bold mt-1 tabular-nums font-mono-num ${
                      dayData.pnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
                    }`}
                  >
                    Total: {formatCurrency(dayData.pnl, currency, true)}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Calendar Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[#1e2b45] text-[11px] text-[#8a9ab5]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[3px] bg-emerald-500/30 border border-emerald-500/60" />
            <span>Hari Laba (Profit)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[3px] bg-rose-500/30 border border-rose-500/60" />
            <span>Hari Rugi (Loss)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[3px] bg-[#111a2e] border border-[#1e2b45]" />
            <span>Tanpa Transaksi</span>
          </div>
        </div>

        <span className="text-[10px] text-[#4b5d78]">
          Klik tanggal untuk memfilter riwayat transaksi di bawah
        </span>
      </div>
    </div>
  );
};
