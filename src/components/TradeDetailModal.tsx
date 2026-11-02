/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, TrendingUp, TrendingDown, Clock, ShieldCheck, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import { Trade } from '../types/trade';
import { formatCurrency } from '../utils/tradingCalculations';

interface TradeDetailModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  currency: 'USD' | 'IDR';
}

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({
  trade,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  currency,
}) => {
  if (!isOpen || !trade) return null;

  const isWin = trade.pnl > 0;
  const isLoss = trade.pnl < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#131e36] border border-[#3b82f6] rounded-[14px] w-full max-w-lg shadow-[0_12px_32px_-4px_rgba(2,6,23,0.7)] my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2b45] bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <span className="font-mono-num text-lg font-bold text-[#e6edf7] bg-[#0b1220] px-2.5 py-1 rounded border border-[#1e2b45]">
              {trade.pair}
            </span>
            {trade.position === 'LONG' ? (
              <span className="px-2 py-0.5 rounded font-bold text-xs bg-emerald-500/15 border border-emerald-500/30 text-[#22c55e]">
                BUY / LONG
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded font-bold text-xs bg-rose-500/15 border border-rose-500/30 text-[#ef4444]">
                SELL / SHORT
              </span>
            )}
            <span className="text-xs text-[#8a9ab5] font-medium">{trade.market}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#1e2b45] text-[#8a9ab5] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Main PnL Callout */}
          <div className="bg-[#0f172a] border border-[#1e2b45] rounded-lg p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#8a9ab5] uppercase tracking-wider block">
                Hasil Realisasi PnL
              </span>
              <span
                className={`text-2xl font-bold tabular-nums font-mono-num ${
                  isWin ? 'text-[#22c55e]' : isLoss ? 'text-[#ef4444]' : 'text-[#8a9ab5]'
                }`}
              >
                {formatCurrency(trade.pnl, currency, true)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#8a9ab5] block">Rasio Risiko/Imbalan</span>
              <span className="text-base font-bold text-[#22d3ee] font-mono-num">
                1 : {trade.riskRewardRatio.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Execution Grid */}
          <div className="grid grid-cols-2 gap-3 bg-[#0b1220] p-3.5 rounded-lg border border-[#1e2b45] text-xs">
            <div>
              <span className="text-[#8a9ab5] block">Harga Beli (Entry)</span>
              <span className="font-semibold text-[#e6edf7] font-mono-num">
                {trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[#8a9ab5] block">Harga Keluar (Exit)</span>
              <span className="font-semibold text-[#e6edf7] font-mono-num">
                {trade.exitPrice
                  ? trade.exitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })
                  : 'Masih Terbuka'}
              </span>
            </div>
            <div>
              <span className="text-[#ef4444] block">Stop Loss (SL)</span>
              <span className="font-semibold text-[#ef4444] font-mono-num">
                {trade.stopLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[#22c55e] block">Target Profit (TP)</span>
              <span className="font-semibold text-[#22c55e] font-mono-num">
                {trade.targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[#8a9ab5] block">Ukuran Kontrak / Lot</span>
              <span className="font-semibold text-[#e6edf7] font-mono-num">
                {trade.lotSize} Lot
              </span>
            </div>
            <div>
              <span className="text-[#8a9ab5] block">Waktu Eksekusi</span>
              <span className="text-[#8a9ab5] font-mono-num">
                {trade.entryDate.replace('T', ' ')}
              </span>
            </div>
          </div>

          {/* Setup & Psychology */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs py-1 border-b border-[#1e2b45]">
              <span className="text-[#8a9ab5]">Strategi & Setup:</span>
              <span className="font-semibold text-[#e6edf7]">{trade.setup}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-[#1e2b45]">
              <span className="text-[#8a9ab5]">Kondisi Mental:</span>
              <span className="font-semibold text-[#22d3ee]">{trade.psychology}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-[#1e2b45]">
              <span className="text-[#8a9ab5]">Kepatuhan SOP:</span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  trade.ruleAdherence ? 'text-[#22c55e]' : 'text-[#ef4444]'
                }`}
              >
                {trade.ruleAdherence ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" /> Disiplin Mematuhi SOP
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" /> Melanggar Aturan Trading
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Notes */}
          {trade.notes && (
            <div className="bg-[#0b1220] p-3 rounded-lg border border-[#1e2b45]">
              <span className="text-[11px] font-semibold text-[#8a9ab5] block mb-1">
                Catatan Analisis & Refleksi:
              </span>
              <p className="text-xs text-[#e6edf7] leading-relaxed italic">
                "{trade.notes}"
              </p>
            </div>
          )}

          {/* Tags */}
          {trade.tags && trade.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {trade.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-[10px] bg-[#1e2b45] text-[#22d3ee] font-mono-num"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1e2b45]">
            <button
              onClick={() => {
                onDelete(trade.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onEdit(trade);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0f172a] hover:bg-[#16223b] border border-[#1e2b45] text-xs font-semibold text-[#e6edf7] transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Transaksi</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
