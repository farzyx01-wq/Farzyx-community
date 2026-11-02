/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Trade } from './types/trade';
import { SEED_TRADES, INITIAL_ACCOUNT_BALANCE } from './data/seedTrades';
import {
  calculateTradeStats,
  calculateEquityCurve,
  calculateDailyPnL,
  calculateStrategyDistribution,
} from './utils/tradingCalculations';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { EquityChart } from './components/EquityChart';
import { TradingCalendar } from './components/TradingCalendar';
import { StrategyDistribution } from './components/StrategyDistribution';
import { TradeTable } from './components/TradeTable';
import { PsychologyDiscipline } from './components/PsychologyDiscipline';
import { TradeModal } from './components/TradeModal';
import { TradeDetailModal } from './components/TradeDetailModal';
import { RiskCalculatorModal } from './components/RiskCalculatorModal';

export default function App() {
  // 1. Trades State with LocalStorage Persistence
  const [trades, setTrades] = useState<Trade[]>(() => {
    try {
      const saved = localStorage.getItem('jurnal_trading_pro_trades');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Gagal memuat jurnal dari localStorage', e);
    }
    return SEED_TRADES;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jurnal_trading_pro_trades', JSON.stringify(trades));
    } catch (e) {
      console.warn('Gagal menyimpan ke localStorage', e);
    }
  }, [trades]);

  // 2. Currency State
  const [currency, setCurrency] = useState<'USD' | 'IDR'>(() => {
    return (localStorage.getItem('jurnal_trading_currency') as 'USD' | 'IDR') || 'USD';
  });

  useEffect(() => {
    localStorage.setItem('jurnal_trading_currency', currency);
  }, [currency]);

  // 3. Navigation Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jurnal' | 'psikologi'>('dashboard');

  // 4. Calendar Date Filter
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // 5. Modal States
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTradeDetail, setSelectedTradeDetail] = useState<Trade | null>(null);

  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);

  // 6. Computed Analytics
  const stats = useMemo(() => calculateTradeStats(trades), [trades]);
  const equityPoints = useMemo(
    () => calculateEquityCurve(trades, INITIAL_ACCOUNT_BALANCE),
    [trades]
  );
  const dailyMap = useMemo(() => calculateDailyPnL(trades), [trades]);
  const strategyStats = useMemo(() => calculateStrategyDistribution(trades), [trades]);

  // Trade actions
  const handleSaveTrade = (savedTrade: Trade) => {
    setTrades((prev) => {
      const index = prev.findIndex((t) => t.id === savedTrade.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = savedTrade;
        return copy;
      } else {
        return [savedTrade, ...prev];
      }
    });
  };

  const handleDeleteTrade = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus catatan transaksi ini dari jurnal?')) {
      setTrades((prev) => prev.filter((t) => t.id !== id));
      if (selectedTradeDetail?.id === id) {
        setIsDetailModalOpen(false);
      }
    }
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsTradeModalOpen(true);
  };

  const handleOpenNewTrade = () => {
    setEditingTrade(null);
    setIsTradeModalOpen(true);
  };

  const handleSelectTradeDetail = (trade: Trade) => {
    setSelectedTradeDetail(trade);
    setIsDetailModalOpen(true);
  };

  const handleResetSeedData = () => {
    if (window.confirm('Muat ulang data sampel bawaan? Catatan transaksi yang ada akan diperbarui.')) {
      setTrades(SEED_TRADES);
      setSelectedCalendarDate(null);
    }
  };

  // CSV Export functionality
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Instrumen',
      'Pasar',
      'Posisi',
      'Waktu_Entry',
      'Waktu_Exit',
      'Harga_Entry',
      'Stop_Loss',
      'Target_Profit',
      'Harga_Exit',
      'Lot',
      'PnL',
      'Status',
      'RR',
      'Strategi',
      'Psikologi',
      'Patuhi_SOP',
      'Catatan',
    ];

    const rows = trades.map((t) => [
      t.id,
      t.pair,
      t.market,
      t.position,
      t.entryDate,
      t.exitDate || '',
      t.entryPrice,
      t.stopLoss,
      t.targetPrice,
      t.exitPrice || '',
      t.lotSize,
      t.pnl,
      t.status,
      t.riskRewardRatio,
      `"${t.setup.replace(/"/g, '""')}"`,
      `"${t.psychology.replace(/"/g, '""')}"`,
      t.ruleAdherence ? 'Ya' : 'Tidak',
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jurnal_trading_pro_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#e6edf7] flex flex-col font-sans">
      {/* Top Header */}
      <Header
        totalNetPnl={stats.totalNetPnl}
        openTradesCount={stats.openTrades}
        currency={currency}
        setCurrency={setCurrency}
        onOpenNewTradeModal={handleOpenNewTrade}
        onOpenCalculatorModal={() => setIsCalculatorModalOpen(true)}
        onExportCSV={handleExportCSV}
        onResetSeedData={handleResetSeedData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Metric Cards Banner - Always Visible for Instant Situational Awareness */}
        <StatsCards stats={stats} currency={currency} />

        {/* Tab 1: Dashboard & Visual Analytics */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Row: Equity Chart (8 cols equivalent) & Strategy Distribution (4 cols equivalent) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-8">
                <EquityChart
                  equityPoints={equityPoints}
                  initialBalance={INITIAL_ACCOUNT_BALANCE}
                  currency={currency}
                />
              </div>
              <div className="lg:col-span-4">
                <StrategyDistribution strategyStats={strategyStats} currency={currency} />
              </div>
            </div>

            {/* Trading Calendar Grid */}
            <TradingCalendar
              dailyMap={dailyMap}
              currency={currency}
              selectedDate={selectedCalendarDate}
              onSelectDate={(d) => {
                setSelectedCalendarDate(d);
                if (d) {
                  // Switch to or scroll to table
                }
              }}
            />

            {/* Recent Trades Table Preview */}
            <TradeTable
              trades={trades}
              currency={currency}
              selectedDate={selectedCalendarDate}
              onClearDateFilter={() => setSelectedCalendarDate(null)}
              onSelectTradeDetail={handleSelectTradeDetail}
              onEditTrade={handleEditTrade}
              onDeleteTrade={handleDeleteTrade}
              onOpenNewTradeModal={handleOpenNewTrade}
            />
          </div>
        )}

        {/* Tab 2: Full Jurnal Transaksi */}
        {activeTab === 'jurnal' && (
          <div className="space-y-6">
            <TradeTable
              trades={trades}
              currency={currency}
              selectedDate={selectedCalendarDate}
              onClearDateFilter={() => setSelectedCalendarDate(null)}
              onSelectTradeDetail={handleSelectTradeDetail}
              onEditTrade={handleEditTrade}
              onDeleteTrade={handleDeleteTrade}
              onOpenNewTradeModal={handleOpenNewTrade}
            />
          </div>
        )}

        {/* Tab 3: Psychology & Discipline Evaluation */}
        {activeTab === 'psikologi' && (
          <div className="space-y-6">
            <PsychologyDiscipline trades={trades} currency={currency} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#1e2b45] bg-[#000e23] py-4 text-center text-xs text-[#8a9ab5]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            &copy; {new Date().getFullYear()} <strong>Jurnal Trading Pro</strong> &bull; Sistem Analisis Kuantitatif Terminal
          </p>
          <div className="flex items-center gap-4 text-[11px] text-[#4b5d78]">
            <span>Densitas Data Presisi (1px Outline)</span>
            <span>&bull;</span>
            <span>Tabular Numbers (tnum)</span>
            <span>&bull;</span>
            <span>Inter & JetBrains Mono</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        onSave={handleSaveTrade}
        tradeToEdit={editingTrade}
      />

      <TradeDetailModal
        trade={selectedTradeDetail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleEditTrade}
        onDelete={handleDeleteTrade}
        currency={currency}
      />

      <RiskCalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
        accountBalance={INITIAL_ACCOUNT_BALANCE + stats.totalNetPnl}
        currency={currency}
      />
    </div>
  );
}
