/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Edit2, 
  Trash2, 
  PlusCircle, 
  Calendar,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Trade, MarketType, PositionType, TradeStatus } from '../types/trade';
import { formatCurrency } from '../utils/tradingCalculations';

interface TradeTableProps {
  trades: Trade[];
  currency: 'USD' | 'IDR';
  selectedDate: string | null;
  onClearDateFilter: () => void;
  onSelectTradeDetail: (trade: Trade) => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (id: string) => void;
  onOpenNewTradeModal: () => void;
}

export const TradeTable: React.FC<TradeTableProps> = ({
  trades,
  currency,
  selectedDate,
  onClearDateFilter,
  onSelectTradeDetail,
  onEditTrade,
  onDeleteTrade,
  onOpenNewTradeModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<string>('SEMUA');
  const [selectedPosition, setSelectedPosition] = useState<string>('SEMUA');
  const [selectedStatus, setSelectedStatus] = useState<string>('SEMUA');
  const [sortField, setSortField] = useState<'entryDate' | 'pnl' | 'riskRewardRatio'>('entryDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtered & Sorted trades
  const filteredTrades = useMemo(() => {
    return trades
      .filter((trade) => {
        // Date filter from calendar
        if (selectedDate) {
          const tradeDate = (trade.exitDate || trade.entryDate).slice(0, 10);
          if (tradeDate !== selectedDate) return false;
        }

        // Market filter
        if (selectedMarket !== 'SEMUA' && trade.market !== selectedMarket) {
          return false;
        }

        // Position filter
        if (selectedPosition !== 'SEMUA' && trade.position !== selectedPosition) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'SEMUA' && trade.status !== selectedStatus) {
          return false;
        }

        // Text search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchPair = trade.pair.toLowerCase().includes(q);
          const matchSetup = trade.setup.toLowerCase().includes(q);
          const matchNotes = trade.notes?.toLowerCase().includes(q) || false;
          const matchTags = trade.tags?.some((t) => t.toLowerCase().includes(q)) || false;
          if (!matchPair && !matchSetup && !matchNotes && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (sortField === 'entryDate') {
          valA = new Date(a.entryDate).getTime();
          valB = new Date(b.entryDate).getTime();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [trades, selectedDate, selectedMarket, selectedPosition, selectedStatus, searchQuery, sortField, sortOrder]);

  const toggleSort = (field: 'entryDate' | 'pnl' | 'riskRewardRatio') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const marketOptions = ['SEMUA', 'Forex', 'Kripto', 'Saham', 'Komoditas'];
  const positionOptions = ['SEMUA', 'LONG', 'SHORT'];
  const statusOptions = ['SEMUA', 'Menang', 'Kalah', 'BEP', 'Terbuka'];

  return (
    <div className="bg-[#111a2e] border border-[#1e2b45] rounded-[14px] overflow-hidden">
      {/* Table Controls Header */}
      <div className="p-4 lg:p-5 border-b border-[#1e2b45] space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#22d3ee]" />
              <h3 className="text-sm font-semibold text-[#e6edf7] uppercase tracking-wider">
                Log Riwayat Jurnal Transaksi
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1e2b45] text-[#8a9ab5] font-mono-num">
                {filteredTrades.length} baris
              </span>
            </div>
            <p className="text-xs text-[#8a9ab5] mt-0.5">
              Pencatatan presisi parameter eksekusi, rasio imbalan, serta catatan psikologi
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedDate && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-[#22d3ee] text-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>Tanggal: {selectedDate}</span>
                <button
                  onClick={onClearDateFilter}
                  className="hover:text-white ml-1 p-0.5"
                  title="Hapus filter tanggal"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <button
              onClick={onOpenNewTradeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Baru</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5d78]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Pair, Setup, Catatan..."
              className="w-full bg-[#0b1220] border border-[#1e2b45] focus:border-[#3b82f6] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#e6edf7] placeholder-[#4b5d78] outline-none transition"
            />
          </div>

          {/* Market Filter */}
          <div className="flex items-center gap-1 overflow-x-auto bg-[#0b1220] p-1 rounded-lg border border-[#1e2b45]">
            <span className="text-[10px] text-[#4b5d78] px-1 font-medium">Pasar:</span>
            {marketOptions.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMarket(m)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition whitespace-nowrap ${
                  selectedMarket === m
                    ? 'bg-[#1e2b45] text-[#22d3ee] font-semibold'
                    : 'text-[#8a9ab5] hover:text-[#e6edf7]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Position Filter */}
          <div className="flex items-center gap-1 bg-[#0b1220] p-1 rounded-lg border border-[#1e2b45]">
            <span className="text-[10px] text-[#4b5d78] px-1 font-medium">Posisi:</span>
            {positionOptions.map((pos) => (
              <button
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  selectedPosition === pos
                    ? pos === 'LONG'
                      ? 'bg-emerald-500/20 text-[#22c55e] font-semibold border border-emerald-500/40'
                      : pos === 'SHORT'
                      ? 'bg-rose-500/20 text-[#ef4444] font-semibold border border-rose-500/40'
                      : 'bg-[#1e2b45] text-[#22d3ee] font-semibold'
                    : 'text-[#8a9ab5] hover:text-[#e6edf7]'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#0b1220] p-1 rounded-lg border border-[#1e2b45] overflow-x-auto">
            <span className="text-[10px] text-[#4b5d78] px-1 font-medium">Status:</span>
            {statusOptions.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition whitespace-nowrap ${
                  selectedStatus === st
                    ? 'bg-[#1e2b45] text-[#22d3ee] font-semibold'
                    : 'text-[#8a9ab5] hover:text-[#e6edf7]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#0f172a] text-[#8a9ab5] border-b border-[#1e2b45]">
              <th className="py-2.5 px-3 uppercase text-[11px] font-semibold tracking-wider">
                <button
                  onClick={() => toggleSort('entryDate')}
                  className="flex items-center gap-1 hover:text-[#e6edf7]"
                >
                  <span>Waktu & Tanggal</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-3 uppercase text-[11px] font-semibold tracking-wider">Instrumen</th>
              <th className="py-2.5 px-3 uppercase text-[11px] font-semibold tracking-wider text-center">Posisi</th>
              <th className="py-2.5 px-3 uppercase text-[11px] font-semibold tracking-wider">Setup / Strategi</th>
              <th className="py-2.5 px-3 uppercase text-[11px] font-semibold tracking-wider text-right">Vol. Lot</th>
              <th className="py-2.5 px-3 uppercase text-[11px] font-semibold tracking-wider text-right">Entry</th>
              <th className="py-2.5 px-3 uppercase text-[11px] font-semibold tracking-wider text-right">SL / TP</th>
              <th className="py-2.5 px-3 uppercase text-[11px] font-semibold tracking-wider text-right">Exit</th>
              <th className="py-2.5 px-3 uppercase text-[11px] font-semibold tracking-wider text-center">
                <button
                  onClick={() => toggleSort('riskRewardRatio')}
                  className="flex items-center gap-1 hover:text-[#e6edf7] mx-auto"
                >
                  <span>R:R</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-3 uppercase text-[11px] font-semibold tracking-wider text-right">
                <button
                  onClick={() => toggleSort('pnl')}
                  className="flex items-center gap-1 hover:text-[#e6edf7] ml-auto"
                >
                  <span>PnL Bersih</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-3 uppercase text-[11px] font-semibold tracking-wider text-center">Psikologi</th>
              <th className="py-2.5 px-3 uppercase text-[11px] font-semibold tracking-wider text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#16223b]">
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center text-[#8a9ab5]">
                  Tidak ada transaksi yang cocok dengan kriteria filter.
                </td>
              </tr>
            ) : (
              filteredTrades.map((t) => {
                const isWin = t.pnl > 0;
                const isLoss = t.pnl < 0;
                const isBEP = t.status === 'BEP';
                const isOpen = t.status === 'Terbuka';

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-[#131e36] transition-colors group cursor-pointer"
                    onClick={() => onSelectTradeDetail(t)}
                  >
                    {/* Date */}
                    <td className="py-2.5 px-3 text-[#8a9ab5] font-mono-num tabular-nums whitespace-nowrap">
                      <div>{t.entryDate.replace('T', ' ')}</div>
                      {t.exitDate && (
                        <div className="text-[10px] text-[#4b5d78]">
                          keluar: {t.exitDate.slice(11)}
                        </div>
                      )}
                    </td>

                    {/* Pair & Market */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#e6edf7] bg-[#0b1220] px-2 py-0.5 rounded border border-[#1e2b45] font-mono-num">
                          {t.pair}
                        </span>
                        <span className="text-[10px] text-[#4b5d78] hidden sm:inline">
                          {t.market}
                        </span>
                      </div>
                    </td>

                    {/* Position (LONG / SHORT) */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {t.position === 'LONG' ? (
                        <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-500/15 border border-emerald-500/30 text-[#22c55e]">
                          BUY / LONG
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-rose-500/15 border border-rose-500/30 text-[#ef4444]">
                          SELL / SHORT
                        </span>
                      )}
                    </td>

                    {/* Setup */}
                    <td className="py-2.5 px-3 text-[#e6edf7] font-medium whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{t.setup}</span>
                        {t.tags && t.tags.length > 0 && (
                          <div className="flex gap-1 mt-0.5">
                            {t.tags.slice(0, 2).map((tg) => (
                              <span key={tg} className="text-[9px] text-[#22d3ee]">
                                #{tg}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Lot Size */}
                    <td className="py-2.5 px-3 text-right text-[#e6edf7] tabular-nums font-mono-num whitespace-nowrap">
                      {t.lotSize.toFixed(2)}
                    </td>

                    {/* Entry Price */}
                    <td className="py-2.5 px-3 text-right text-[#e6edf7] font-semibold tabular-nums font-mono-num whitespace-nowrap">
                      {t.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* SL / TP */}
                    <td className="py-2.5 px-3 text-right tabular-nums font-mono-num whitespace-nowrap text-[11px]">
                      <div className="text-[#ef4444]">
                        SL: {t.stopLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[#22c55e]">
                        TP: {t.targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </td>

                    {/* Exit Price */}
                    <td className="py-2.5 px-3 text-right text-[#8a9ab5] tabular-nums font-mono-num whitespace-nowrap">
                      {t.exitPrice ? t.exitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                    </td>

                    {/* R:R Ratio */}
                    <td className="py-2.5 px-3 text-center tabular-nums font-mono-num whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-[#1e2b45] text-[#22d3ee] font-semibold text-[11px]">
                        1:{t.riskRewardRatio.toFixed(2)}
                      </span>
                    </td>

                    {/* Net Realized PnL */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      {isOpen ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          Posisi Terbuka
                        </span>
                      ) : (
                        <span
                          className={`font-bold tabular-nums font-mono-num text-[13px] ${
                            isWin
                              ? 'text-[#22c55e]'
                              : isLoss
                              ? 'text-[#ef4444]'
                              : 'text-[#8a9ab5]'
                          }`}
                        >
                          {formatCurrency(t.pnl, currency, true)}
                        </span>
                      )}
                    </td>

                    {/* Psychology / Emotions */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          t.ruleAdherence
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {t.psychology}
                      </span>
                    </td>

                    {/* Actions */}
                    <td 
                      className="py-2.5 px-3 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onSelectTradeDetail(t)}
                          className="p-1.5 rounded hover:bg-[#1e2b45] text-[#8a9ab5] hover:text-[#22d3ee] transition"
                          title="Lihat Detail Transaksi"
                          aria-label={`Lihat Detail ${t.pair}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditTrade(t)}
                          className="p-1.5 rounded hover:bg-[#1e2b45] text-[#8a9ab5] hover:text-white transition"
                          title="Edit Transaksi"
                          aria-label={`Edit ${t.pair}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTrade(t.id)}
                          className="p-1.5 rounded hover:bg-rose-500/20 text-[#8a9ab5] hover:text-[#ef4444] transition"
                          title="Hapus Transaksi"
                          aria-label={`Hapus ${t.pair}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
