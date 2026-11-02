/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  PlusCircle, 
  Download, 
  Calculator, 
  RotateCcw,
  Globe,
  SlidersHorizontal,
  ChevronDown,
  Clock
} from 'lucide-react';
import { formatCurrency } from '../utils/tradingCalculations';

interface HeaderProps {
  totalNetPnl: number;
  openTradesCount: number;
  currency: 'USD' | 'IDR';
  setCurrency: (c: 'USD' | 'IDR') => void;
  onOpenNewTradeModal: () => void;
  onOpenCalculatorModal: () => void;
  onExportCSV: () => void;
  onResetSeedData: () => void;
  activeTab: 'dashboard' | 'jurnal' | 'psikologi';
  setActiveTab: (tab: 'dashboard' | 'jurnal' | 'psikologi') => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalNetPnl,
  openTradesCount,
  currency,
  setCurrency,
  onOpenNewTradeModal,
  onOpenCalculatorModal,
  onExportCSV,
  onResetSeedData,
  activeTab,
  setActiveTab,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Jakarta',
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#0b1220]/95 backdrop-blur-md border-b border-[#1e2b45]">
      {/* Top utility ticker bar */}
      <div className="hidden sm:flex items-center justify-between px-4 lg:px-8 py-1.5 text-[11px] font-medium text-[#8a9ab5] border-b border-[#16223b] bg-[#000e23]/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[#e6edf7] font-semibold tracking-wide">TERMINAL AKTIF</span>
          </div>
          <span className="text-[#4b5d78]">|</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#22d3ee]" />
            <span className="tabular-nums text-[#e6edf7]">{time || '09:00:00 WIB'}</span>
          </div>
          <span className="text-[#4b5d78]">|</span>
          <div className="flex items-center gap-2">
            <span className="text-[#8a9ab5]">Sesi Pasar:</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
              TOKYO (BUKA)
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-semibold border border-blue-500/30">
              LONDON (PRA-PASAR)
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#1e2b45] text-[#8a9ab5] text-[10px]">
              NEW YORK (TUTUP)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0f172a] px-2.5 py-0.5 rounded border border-[#1e2b45]">
            <span className="text-[#8a9ab5]">Posisi Aktif:</span>
            <span className="tabular-nums font-semibold text-[#22d3ee]">{openTradesCount} Posisi</span>
          </div>
          <div className="flex items-center gap-2 bg-[#0f172a] px-2.5 py-0.5 rounded border border-[#1e2b45]">
            <span className="text-[#8a9ab5]">Laba Berjalan:</span>
            <span className={`tabular-nums font-semibold ${totalNetPnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              {formatCurrency(totalNetPnl, currency, true)}
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/40">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg lg:text-xl font-bold tracking-tight text-[#e6edf7]">
                  Jurnal Trading Pro
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  INSTITUSIONAL
                </span>
              </div>
              <p className="text-xs text-[#8a9ab5]">
                Analisis Kuantitatif & Manajemen Resiko Presisi
              </p>
            </div>
          </div>

          {/* Mobile CTA */}
          <button
            onClick={onOpenNewTradeModal}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3b82f6] hover:bg-blue-600 active:scale-95 text-white text-xs font-semibold shadow-sm transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>

        {/* Tab navigation */}
        <nav className="flex items-center gap-1 bg-[#0f172a] p-1 rounded-lg border border-[#1e2b45] self-start md:self-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-[#1b2b41] text-[#22d3ee] shadow-sm border border-[#2a3c61]'
                : 'text-[#8a9ab5] hover:text-[#e6edf7] hover:bg-[#16223b]'
            }`}
          >
            Dashboard & Analitik
          </button>
          <button
            onClick={() => setActiveTab('jurnal')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'jurnal'
                ? 'bg-[#1b2b41] text-[#22d3ee] shadow-sm border border-[#2a3c61]'
                : 'text-[#8a9ab5] hover:text-[#e6edf7] hover:bg-[#16223b]'
            }`}
          >
            Jurnal Transaksi
          </button>
          <button
            onClick={() => setActiveTab('psikologi')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'psikologi'
                ? 'bg-[#1b2b41] text-[#22d3ee] shadow-sm border border-[#2a3c61]'
                : 'text-[#8a9ab5] hover:text-[#e6edf7] hover:bg-[#16223b]'
            }`}
          >
            Evaluasi Disiplin & Psikologi
          </button>
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Currency Toggle */}
          <div className="flex items-center bg-[#0f172a] p-0.5 rounded-lg border border-[#1e2b45]">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2 py-1 rounded text-xs font-medium transition ${
                currency === 'USD'
                  ? 'bg-[#1e2b45] text-[#22d3ee]'
                  : 'text-[#8a9ab5] hover:text-[#e6edf7]'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency('IDR')}
              className={`px-2 py-1 rounded text-xs font-medium transition ${
                currency === 'IDR'
                  ? 'bg-[#1e2b45] text-[#22d3ee]'
                  : 'text-[#8a9ab5] hover:text-[#e6edf7]'
              }`}
            >
              IDR (Rp)
            </button>
          </div>

          {/* Calculator Tool */}
          <button
            onClick={onOpenCalculatorModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0f172a] hover:bg-[#16223b] active:scale-98 border border-[#1e2b45] hover:border-[#3b82f6] text-[#e6edf7] text-xs font-medium transition"
            title="Kalkulator Resiko & Ukuran Lot"
          >
            <Calculator className="w-3.5 h-3.5 text-[#22d3ee]" />
            <span className="hidden xl:inline">Kalkulator Resiko</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0f172a] hover:bg-[#16223b] active:scale-98 border border-[#1e2b45] hover:border-[#3b82f6] text-[#e6edf7] text-xs font-medium transition"
            title="Ekspor Jurnal ke CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#8a9ab5]" />
            <span className="hidden lg:inline">Ekspor CSV</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetSeedData}
            className="p-2 rounded-lg bg-[#0f172a] hover:bg-[#16223b] active:scale-98 border border-[#1e2b45] text-[#8a9ab5] hover:text-[#e6edf7] transition"
            title="Muat Ulang Data Sampel Jurnal"
            aria-label="Muat Ulang Data Sampel Jurnal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Primary CTA: Tambah Transaksi */}
          <button
            onClick={onOpenNewTradeModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#3b82f6] hover:bg-blue-600 active:scale-98 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Transaksi Baru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
