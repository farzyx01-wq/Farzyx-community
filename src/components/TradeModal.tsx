/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Check, Calculator, Sparkles } from 'lucide-react';
import { 
  Trade, 
  MarketType, 
  PositionType, 
  TradeStatus, 
  TradeSetup, 
  TradingEmotion 
} from '../types/trade';
import { calculateRiskReward } from '../utils/tradingCalculations';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Trade) => void;
  tradeToEdit?: Trade | null;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tradeToEdit,
}) => {
  const [pair, setPair] = useState('XAUUSD');
  const [market, setMarket] = useState<MarketType>('Komoditas');
  const [position, setPosition] = useState<PositionType>('LONG');
  const [entryDate, setEntryDate] = useState('');
  const [exitDate, setExitDate] = useState('');
  const [entryPrice, setEntryPrice] = useState<number | ''>('');
  const [exitPrice, setExitPrice] = useState<number | ''>('');
  const [stopLoss, setStopLoss] = useState<number | ''>('');
  const [targetPrice, setTargetPrice] = useState<number | ''>('');
  const [lotSize, setLotSize] = useState<number | ''>(0.5);
  const [pnl, setPnl] = useState<number | ''>(0);
  const [status, setStatus] = useState<TradeStatus>('Menang');
  const [setup, setSetup] = useState<TradeSetup>('Order Block / SMC');
  const [psychology, setPsychology] = useState<TradingEmotion>('Disiplin Tinggi');
  const [ruleAdherence, setRuleAdherence] = useState(true);
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Pre-fill when editing or reset for new
  useEffect(() => {
    if (tradeToEdit) {
      setPair(tradeToEdit.pair);
      setMarket(tradeToEdit.market);
      setPosition(tradeToEdit.position);
      setEntryDate(tradeToEdit.entryDate);
      setExitDate(tradeToEdit.exitDate || '');
      setEntryPrice(tradeToEdit.entryPrice);
      setExitPrice(tradeToEdit.exitPrice ?? '');
      setStopLoss(tradeToEdit.stopLoss);
      setTargetPrice(tradeToEdit.targetPrice);
      setLotSize(tradeToEdit.lotSize);
      setPnl(tradeToEdit.pnl);
      setStatus(tradeToEdit.status);
      setSetup(tradeToEdit.setup);
      setPsychology(tradeToEdit.psychology);
      setRuleAdherence(tradeToEdit.ruleAdherence);
      setNotes(tradeToEdit.notes || '');
      setTagsInput(tradeToEdit.tags?.join(', ') || '');
    } else {
      const now = new Date();
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setPair('XAUUSD');
      setMarket('Komoditas');
      setPosition('LONG');
      setEntryDate(localIso);
      setExitDate('');
      setEntryPrice('');
      setExitPrice('');
      setStopLoss('');
      setTargetPrice('');
      setLotSize(0.5);
      setPnl('');
      setStatus('Menang');
      setSetup('Order Block / SMC');
      setPsychology('Disiplin Tinggi');
      setRuleAdherence(true);
      setNotes('');
      setTagsInput('');
    }
  }, [tradeToEdit, isOpen]);

  // Live R:R computation
  const calculatedRR =
    entryPrice && stopLoss && targetPrice
      ? calculateRiskReward(position, Number(entryPrice), Number(stopLoss), Number(targetPrice))
      : 0;

  // Auto PnL suggestion if exit price is entered
  const handleAutoPnl = () => {
    if (!entryPrice || !exitPrice || !lotSize) return;
    const numEntry = Number(entryPrice);
    const numExit = Number(exitPrice);
    const numLot = Number(lotSize);

    let diff = 0;
    if (position === 'LONG') {
      diff = numExit - numEntry;
    } else {
      diff = numEntry - numExit;
    }

    // Multiply according to typical lot contract
    let multiplier = 100; // default for commodities/metals
    if (market === 'Forex') multiplier = 10000;
    if (market === 'Kripto') multiplier = 1;
    if (market === 'Saham') multiplier = 100;

    const estimatedPnl = Number((diff * numLot * (multiplier / 100)).toFixed(2));
    setPnl(estimatedPnl);
    if (estimatedPnl > 0) setStatus('Menang');
    else if (estimatedPnl < 0) setStatus('Kalah');
    else setStatus('BEP');
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pair || !entryPrice || !stopLoss || !targetPrice || !lotSize) {
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const tradeData: Trade = {
      id: tradeToEdit ? tradeToEdit.id : `tr-${Date.now()}`,
      pair: pair.toUpperCase().trim(),
      market,
      position,
      entryDate,
      exitDate: exitDate || undefined,
      entryPrice: Number(entryPrice),
      exitPrice: exitPrice !== '' ? Number(exitPrice) : undefined,
      stopLoss: Number(stopLoss),
      targetPrice: Number(targetPrice),
      lotSize: Number(lotSize),
      pnl: status === 'Terbuka' ? 0 : Number(pnl || 0),
      status,
      riskRewardRatio: calculatedRR || 2.0,
      setup,
      psychology,
      ruleAdherence,
      notes,
      tags,
    };

    onSave(tradeData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#131e36] border border-[#3b82f6] rounded-[14px] w-full max-w-2xl shadow-[0_12px_32px_-4px_rgba(2,6,23,0.7)] my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2b45] bg-[#0f172a]">
          <div>
            <h2 className="text-base font-bold text-[#e6edf7]">
              {tradeToEdit ? 'Edit Transaksi Jurnal' : 'Tambah Transaksi Baru'}
            </h2>
            <p className="text-xs text-[#8a9ab5]">
              Formulir pencatatan metrik, risiko, dan psikologi trading
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#1e2b45] text-[#8a9ab5] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Row 1: Pair, Market, Position */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8a9ab5] mb-1">
                Instrumen / Pair *
              </label>
              <input
                type="text"
                required
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                placeholder="misal: XAUUSD, BTCUSDT"
                className="w-full bg-[#0b1220] border border-[#1e2b45] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] rounded-lg px-3 py-2 text-xs text-[#e6edf7] font-semibold font-mono-num outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8a9ab5] mb-1">
                Kategori Pasar *
              </label>
              <select
                value={market}
                onChange={(e) => setMarket(e.target.value as MarketType)}
                className="w-full bg-[#0b1220] border border-[#1e2b45] focus:border-[#3b82f6] rounded-lg px-3 py-2 text-xs text-[#e6edf7] outline-none"
              >
                <option value="Forex">Forex</option>
                <option value="Kripto">Kripto</option>
                <option value="Saham">Saham</option>
                <option value="Komoditas">Komoditas</option>
                <option value="Indeks">Indeks</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8a9ab5] mb-1">
                Arah Posisi *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPosition('LONG')}
                  className={`py-2 rounded-lg text-xs font-bold border transition ${
                    position === 'LONG'
                      ? 'bg-emerald-500/20 border-[#22c55e] text-[#22c55e]'
                      : 'bg-[#0b1220] border-[#1e2b45] text-[#8a9ab5] hover:text-[#e6edf7]'
                  }`}
                >
                  BELI (LONG)
                </button>
                <button
                  type="button"
                  onClick={() => setPosition('SHORT')}
                  className={`py-2 rounded-lg text-xs font-bold border transition ${
                    position === 'SHORT'
                      ? 'bg-rose-500/20 border-[#ef4444] text-[#ef4444]'
                      : 'bg-[#0b1220] border-[#1e2b45] text-[#8a9ab5] hover:text-[#e6edf7]'
                  }`}
                >
                  JUAL (SHORT)
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Price Execution (Entry, SL, TP, Exit) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0b1220] p-3 rounded-lg border border-[#1e2b45]">
            <div>
              <label className="block text-xs font-medium text-[#8a9ab5] mb-1">
                Harga Masuk (Entry) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full bg-[#111a2e] border border-[#1e2b45] focus:border-[#3b82f6] rounded-lg px-2.5 py-1.5 text-xs text-[#e6edf7] font-semibold tabular-nums font-mono-num outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#ef4444] mb-1">
                Stop Loss (SL) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full bg-[#111a2e] border border-rose-500/40 focus:border-[#ef4444] rounded-lg px-2.5 py-1.5 text-xs text-[#ef4444] font-semibold tabular-nums font-mono-num outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#22c55e] mb-1">
                Target Profit (TP) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full bg-[#111a2e] border border-emerald-500/40 focus:border-[#22c55e] rounded-lg px-2.5 py-1.5 text-xs text-[#22c55e] font-semibold tabular-nums font-mono-num outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8a9ab5] mb-1">
                Harga Keluar (Exit)
              </label>
              <input
                type="number"
                step="any"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Kosongkan jika aktif"
                className="w-full bg-[#111a2e] border border-[#1e2b45] focus:border-[#3b82f6] rounded-lg px-2.5 py-1.5 text-xs text-[#e6edf7] tabular-nums font-mono-num outline-none"
              />
            </div>
          </div>

          {/* R:R indicator Banner */}
          {calculatedRR > 0 && (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs">
              <span className="text-[#8a9ab5]">Kalkulasi R:R Rencana:</span>
              <span className="font-bold text-[#22d3ee] font-mono-num">
                1 : {calculatedRR.toFixed(2)} (Risk-to-Reward)
              </span>
            </div>
          )}

          {/* Row 3: Lot Size, Status, PnL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8a9ab5] mb-1">
                Volume / Lot *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#0b1220] border border-[#1e2b45] focus:border-[#3b82f6] rounded-lg px-3 py-2 text-xs text-[#e6edf7] tabular-nums font-mono-num outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8a9ab5] mb-1">
                Status Transaksi *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TradeStatus)}
                className="w-full bg-[#0b1220] border border-[#1e2b45] focus:border-[#3b82f6] rounded-lg px-3 py-2 text-xs text-[#e6edf7] outline-none"
              >
                <option value="Menang">Menang (Profit)</option>
                <option value="Kalah">Kalah (Loss)</option>
                <option value="BEP">BEP (Impas)</option>
                <option value="Terbuka">Posisi Terbuka (Running)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-[#8a9ab5]">
                  PnL Bersih ($)
                </label>
                {exitPrice && (
                  <button
                    type="button"
                    onClick={handleAutoPnl}
                    className="text-[10px] text-[#22d3ee] hover:underline flex items-center gap-0.5"
                  >
                    <Calculator className="w-2.5 h-2.5" /> Hitung PnL
                  </button>
                )}
              </div>
              <input
                type="number"
                step="any"
                disabled={status === 'Terbuka'}
                value={status === 'Terbuka' ? 0 : pnl}
                onChange={(e) => setPnl(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Contoh: 850 atau -300"
                className={`w-full bg-[#0b1220] border border-[#1e2b45] focus:border-[#3b82f6] rounded-lg px-3 py-2 text-xs font-bold tabular-nums font-mono-num outline-none ${
                  Number(pnl) > 0 ? 'text-[#22c55e]' : Number(pnl) < 0 ? 'text-[#ef4444]' : 'text-[#8a9ab5]'
                }`}
              />
            </div>
          </div>

          {/* Row 4: Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8a9ab5] mb-1">
                Waktu Buka Posisi (Entry) *
              </label>
              <input
                type="datetime-local"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#1e2b45] focus:border-[#3b82f6] rounded-lg px-3 py-2 text-xs text-[#e6edf7] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8a9ab5] mb-1">
                Waktu Tutup Posisi (Exit)
              </label>
              <input
                type="datetime-local"
                value={exitDate}
                onChange={(e) => setExitDate(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#1e2b45] focus:border-[#3b82f6] rounded-lg px-3 py-2 text-xs text-[#e6edf7] outline-none"
              />
            </div>
          </div>

          {/* Row 5: Setup & Psychology */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8a9ab5] mb-1">
                Strategi & Setup *
              </label>
              <select
                value={setup}
                onChange={(e) => setSetup(e.target.value as TradeSetup)}
                className="w-full bg-[#0b1220] border border-[#1e2b45] focus:border-[#3b82f6] rounded-lg px-3 py-2 text-xs text-[#e6edf7] outline-none"
              >
                <option value="Order Block / SMC">Order Block / SMC</option>
                <option value="Breakout Pullback">Breakout Pullback</option>
                <option value="Liquidity Sweep">Liquidity Sweep</option>
                <option value="Fair Value Gap (FVG)">Fair Value Gap (FVG)</option>
                <option value="Trend Following">Trend Following</option>
                <option value="Support & Resistance">Support & Resistance</option>
                <option value="Mean Reversion">Mean Reversion</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8a9ab5] mb-1">
                Kondisi Mental & Psikologi *
              </label>
              <select
                value={psychology}
                onChange={(e) => setPsychology(e.target.value as TradingEmotion)}
                className="w-full bg-[#0b1220] border border-[#1e2b45] focus:border-[#3b82f6] rounded-lg px-3 py-2 text-xs text-[#e6edf7] outline-none"
              >
                <option value="Disiplin Tinggi">Disiplin Tinggi</option>
                <option value="Sabar & Tenang">Sabar & Tenang</option>
                <option value="Rencana Sempurna">Rencana Sempurna</option>
                <option value="FOMO">FOMO (Takut Ketinggalan)</option>
                <option value="Revenge Trading">Revenge Trading (Balas Dendam)</option>
                <option value="Cemas / Takut">Cemas / Takut</option>
                <option value="Terburu-buru">Terburu-buru</option>
              </select>
            </div>
          </div>

          {/* Rule adherence checkbox */}
          <div className="flex items-center gap-2.5 bg-[#0b1220] p-3 rounded-lg border border-[#1e2b45]">
            <input
              type="checkbox"
              id="ruleAdherence"
              checked={ruleAdherence}
              onChange={(e) => setRuleAdherence(e.target.checked)}
              className="w-4 h-4 rounded bg-[#0b1220] border-[#1e2b45] text-[#3b82f6] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="ruleAdherence" className="text-xs text-[#e6edf7] cursor-pointer">
              <strong>Mematuhi Seluruh SOP Trading:</strong> Disiplin memasang SL, tidak overtrade, dan mematuhi batas risiko.
            </label>
          </div>

          {/* Notes & Tags */}
          <div>
            <label className="block text-xs font-medium text-[#8a9ab5] mb-1">
              Catatan Evaluasi / Refleksi
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jelaskan alasan entri, konfirmasi timeframe, serta evaluasi psikologis..."
              className="w-full bg-[#0b1220] border border-[#1e2b45] focus:border-[#3b82f6] rounded-lg p-2.5 text-xs text-[#e6edf7] placeholder-[#4b5d78] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8a9ab5] mb-1">
              Tagar (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="misal: Gold, LondonSession, SMC"
              className="w-full bg-[#0b1220] border border-[#1e2b45] focus:border-[#3b82f6] rounded-lg px-3 py-2 text-xs text-[#e6edf7] outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2b45]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#0f172a] hover:bg-[#16223b] border border-[#1e2b45] text-[#e6edf7] text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#3b82f6] hover:bg-blue-600 active:scale-98 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Jurnal Transaksi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
