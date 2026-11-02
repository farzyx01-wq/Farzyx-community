/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Calculator, ShieldCheck, ArrowRight } from 'lucide-react';
import { calculatePositionSize, formatCurrency } from '../utils/tradingCalculations';

interface RiskCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountBalance: number;
  currency: 'USD' | 'IDR';
}

export const RiskCalculatorModal: React.FC<RiskCalculatorModalProps> = ({
  isOpen,
  onClose,
  accountBalance: defaultBalance,
  currency,
}) => {
  const [balance, setBalance] = useState<number>(defaultBalance || 10000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [entryPrice, setEntryPrice] = useState<number>(2740);
  const [stopLoss, setStopLoss] = useState<number>(2732);
  const [instrumentMultiplier, setInstrumentMultiplier] = useState<number>(100); // 100 for Gold, 100000 for standard forex, 1 for crypto

  if (!isOpen) return null;

  const result = calculatePositionSize(
    balance,
    riskPercent,
    entryPrice,
    stopLoss,
    instrumentMultiplier / 100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#131e36] border border-[#3b82f6] rounded-[14px] w-full max-w-lg shadow-[0_12px_32px_-4px_rgba(2,6,23,0.7)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2b45] bg-[#0f172a]">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#22d3ee]" />
            <div>
              <h2 className="text-base font-bold text-[#e6edf7]">
                Kalkulator Resiko & Ukuran Posisi
              </h2>
              <p className="text-xs text-[#8a9ab5]">
                Kalkulasi presisi ukuran lot untuk melindungi modal trading
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#1e2b45] text-[#8a9ab5] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8a9ab5] mb-1">
                Saldo Akun ({currency})
              </label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(Number(e.target.value))}
                className="w-full bg-[#0b1220] border border-[#1e2b45] focus:border-[#3b82f6] rounded-lg px-3 py-2 text-xs text-[#e6edf7] font-semibold font-mono-num outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8a9ab5] mb-1">
                Toleransi Risiko (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(Number(e.target.value))}
                  className="w-full bg-[#0b1220] border border-[#1e2b45] focus:border-[#3b82f6] rounded-lg px-3 py-2 text-xs text-[#e6edf7] font-semibold font-mono-num outline-none"
                />
                <div className="flex gap-1">
                  {[1, 2].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setRiskPercent(p)}
                      className={`px-2 py-1.5 rounded text-[11px] font-bold border ${
                        riskPercent === p
                          ? 'bg-blue-500/20 text-[#22d3ee] border-[#3b82f6]'
                          : 'bg-[#0b1220] text-[#8a9ab5] border-[#1e2b45]'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8a9ab5] mb-1">
                Harga Masuk (Entry)
              </label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="w-full bg-[#0b1220] border border-[#1e2b45] focus:border-[#3b82f6] rounded-lg px-3 py-2 text-xs text-[#e6edf7] font-mono-num outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#ef4444] mb-1">
                Stop Loss (SL)
              </label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(Number(e.target.value))}
                className="w-full bg-[#0b1220] border border-rose-500/40 focus:border-[#ef4444] rounded-lg px-3 py-2 text-xs text-[#ef4444] font-mono-num outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8a9ab5] mb-1">
              Tipe Instrumen (Preset Pengali Nilai Titik)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setInstrumentMultiplier(100)}
                className={`py-1.5 rounded-lg text-xs font-semibold border ${
                  instrumentMultiplier === 100
                    ? 'bg-blue-500/20 border-[#3b82f6] text-[#22d3ee]'
                    : 'bg-[#0b1220] border-[#1e2b45] text-[#8a9ab5]'
                }`}
              >
                Emas (XAUUSD)
              </button>
              <button
                type="button"
                onClick={() => setInstrumentMultiplier(1000)}
                className={`py-1.5 rounded-lg text-xs font-semibold border ${
                  instrumentMultiplier === 1000
                    ? 'bg-blue-500/20 border-[#3b82f6] text-[#22d3ee]'
                    : 'bg-[#0b1220] border-[#1e2b45] text-[#8a9ab5]'
                }`}
              >
                Forex Standar
              </button>
              <button
                type="button"
                onClick={() => setInstrumentMultiplier(100)}
                className={`py-1.5 rounded-lg text-xs font-semibold border ${
                  instrumentMultiplier === 100
                    ? 'bg-blue-500/20 border-[#3b82f6] text-[#22d3ee]'
                    : 'bg-[#0b1220] border-[#1e2b45] text-[#8a9ab5]'
                }`}
              >
                Kripto / Saham
              </button>
            </div>
          </div>

          {/* Results Output Box */}
          <div className="bg-[#0b1220] border border-cyan-500/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1e2b45] pb-2">
              <span className="text-xs text-[#8a9ab5]">Batas Risiko Maksimal:</span>
              <span className="text-sm font-bold text-[#ef4444] tabular-nums font-mono-num">
                {formatCurrency(result.riskAmount, currency)} ({riskPercent}%)
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-[#1e2b45] pb-2">
              <span className="text-xs text-[#8a9ab5]">Jarak Stop Loss:</span>
              <span className="text-sm font-bold text-[#e6edf7] tabular-nums font-mono-num">
                {result.slDistance} Poin
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs text-[#22d3ee] font-semibold uppercase tracking-wider block">
                  Ukuran Lot Rekomendasi
                </span>
                <span className="text-[11px] text-[#8a9ab5]">
                  Sesuai toleransi risiko {riskPercent}%
                </span>
              </div>
              <span className="text-2xl font-extrabold text-[#22d3ee] tabular-nums font-mono-num">
                {result.positionSize} Lot
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-[#1e2b45]">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-bold transition"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
