/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  Target, 
  Scale, 
  Award, 
  Layers, 
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { TradeStats } from '../types/trade';
import { formatCurrency } from '../utils/tradingCalculations';

interface StatsCardsProps {
  stats: TradeStats;
  currency: 'USD' | 'IDR';
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, currency }) => {
  const isNetProfit = stats.totalNetPnl >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
      {/* 1. Total Laba Bersih (Net Realized PnL) */}
      <div className="bg-[#111a2e] border border-[#1e2b45] rounded-[14px] p-5 relative overflow-hidden transition-all duration-200 hover:border-[#2a3c61] hover:bg-[#131e36] group">
        {/* Subtle highlight gradient border */}
        <div 
          className="absolute top-0 left-0 right-0 h-[2px] opacity-75"
          style={{
            background: isNetProfit 
              ? 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.8), transparent)' 
              : 'linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.8), transparent)'
          }}
        />
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[#8a9ab5] uppercase tracking-wider">
            Total Laba Bersih
          </span>
          <div className={`p-2 rounded-lg ${isNetProfit ? 'bg-emerald-500/10 text-[#22c55e]' : 'bg-rose-500/10 text-[#ef4444]'}`}>
            {isNetProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span 
            className={`text-2xl lg:text-[28px] font-bold tabular-nums tracking-tight font-mono-num ${
              isNetProfit ? 'text-[#22c55e]' : 'text-[#ef4444]'
            }`}
          >
            {formatCurrency(stats.totalNetPnl, currency, true)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-[#8a9ab5] pt-2 border-t border-[#1e2b45]">
          <div className="flex items-center gap-1">
            <span className="text-[#22d3ee] font-medium">Profit: {formatCurrency(stats.grossProfit, currency)}</span>
          </div>
          <span className="text-[#ef4444] font-medium">Loss: {formatCurrency(stats.grossLoss, currency)}</span>
        </div>
      </div>

      {/* 2. Tingkat Kemenangan (Win Rate) */}
      <div className="bg-[#111a2e] border border-[#1e2b45] rounded-[14px] p-5 relative overflow-hidden transition-all duration-200 hover:border-[#2a3c61] hover:bg-[#131e36]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[#8a9ab5] uppercase tracking-wider">
            Tingkat Kemenangan
          </span>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-[#22d3ee]">
            <Target className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl lg:text-[28px] font-bold tabular-nums tracking-tight text-[#e6edf7] font-mono-num">
            {stats.winRate}%
          </span>
          <span className="text-xs text-[#8a9ab5]">
            ({stats.winTrades}M / {stats.lossTrades}K / {stats.bepTrades}B)
          </span>
        </div>

        {/* Win Rate Progress Bar */}
        <div className="w-full bg-[#0f172a] h-1.5 rounded-full overflow-hidden mb-2 border border-[#1e2b45]">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(stats.winRate, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-[#8a9ab5] pt-2 border-t border-[#1e2b45]">
          <span>Total Selesai: <strong className="text-[#e6edf7]">{stats.totalTrades}</strong></span>
          <span className="text-[#22d3ee]">Kemenangan Terbanyak: <strong>+{formatCurrency(stats.bestTrade, currency)}</strong></span>
        </div>
      </div>

      {/* 3. Rasio Risiko / Imbalan (Avg R:R) */}
      <div className="bg-[#111a2e] border border-[#1e2b45] rounded-[14px] p-5 relative overflow-hidden transition-all duration-200 hover:border-[#2a3c61] hover:bg-[#131e36]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[#8a9ab5] uppercase tracking-wider">
            Rasio Risiko/Imbalan (R:R)
          </span>
          <div className="p-2 rounded-lg bg-blue-500/10 text-[#3b82f6]">
            <Scale className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl lg:text-[28px] font-bold tabular-nums tracking-tight text-[#e6edf7] font-mono-num">
            1 : {stats.avgRR.toFixed(2)}
          </span>
          <span className="text-xs text-[#22c55e] flex items-center font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> Optimal
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-[#8a9ab5] pt-4 border-t border-[#1e2b45]">
          <span>Maks Penurunan (DD):</span>
          <span className="text-[#ef4444] font-semibold tabular-nums font-mono-num">
            -{formatCurrency(stats.maxDrawdown, currency)}
          </span>
        </div>
      </div>

      {/* 4. Faktor Keuntungan (Profit Factor) & Disiplin */}
      <div className="bg-[#111a2e] border border-[#1e2b45] rounded-[14px] p-5 relative overflow-hidden transition-all duration-200 hover:border-[#2a3c61] hover:bg-[#131e36]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[#8a9ab5] uppercase tracking-wider">
            Faktor Keuntungan (PF)
          </span>
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl lg:text-[28px] font-bold tabular-nums tracking-tight text-[#e6edf7] font-mono-num">
            {stats.profitFactor.toFixed(2)}
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {stats.profitFactor >= 2 ? 'Sangat Sehat' : stats.profitFactor >= 1.5 ? 'Baik' : 'Perlu Evaluasi'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-[#8a9ab5] pt-4 border-t border-[#1e2b45]">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
            Kepatuhan Aturan:
          </span>
          <span className="font-semibold text-[#22d3ee] tabular-nums font-mono-num">
            {stats.ruleAdherenceRate}%
          </span>
        </div>
      </div>
    </div>
  );
};
