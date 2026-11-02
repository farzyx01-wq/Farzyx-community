/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Flame, 
  Smile, 
  ShieldCheck, 
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { Trade, TradingEmotion } from '../types/trade';
import { calculatePsychologyBreakdown, formatCurrency } from '../utils/tradingCalculations';

interface PsychologyDisciplineProps {
  trades: Trade[];
  currency: 'USD' | 'IDR';
}

export const PsychologyDiscipline: React.FC<PsychologyDisciplineProps> = ({
  trades,
  currency,
}) => {
  const emotionStats = calculatePsychologyBreakdown(trades);

  // Calculate disciplined vs undisciplined PnL
  const disciplinedTrades = trades.filter((t) => t.ruleAdherence && t.status !== 'Terbuka');
  const undisciplinedTrades = trades.filter((t) => !t.ruleAdherence && t.status !== 'Terbuka');

  const disciplinedPnl = disciplinedTrades.reduce((acc, t) => acc + t.pnl, 0);
  const undisciplinedPnl = undisciplinedTrades.reduce((acc, t) => acc + t.pnl, 0);

  const rulesList = [
    {
      title: 'Patuhi Stop Loss (Tanpa Menggeser SL)',
      desc: 'Jangan pernah memperlebar atau menghapus stop loss saat harga mendekat.',
      status: 'Wajib',
    },
    {
      title: 'Batasi Risiko Maksimal 1-2% Per Posisi',
      desc: 'Gunakan kalkulator ukuran lot sebelum membuka entri posisi baru.',
      status: 'Kritis',
    },
    {
      title: 'Hindari Revenge Trading Pasca-Loss',
      desc: 'Jika mengalami 2 loss beruntun, hentikan sesi trading dan evaluasi grafik.',
      status: 'Disiplin',
    },
    {
      title: 'Konfirmasi Multi-Timeframe (HTF ke LTF)',
      desc: 'Hanya masuk posisi yang searah dengan likuiditas dan tren kerangka waktu tinggi.',
      status: 'Teknikal',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Discipline Comparison Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Disciplined PnL Card */}
        <div className="bg-[#111a2e] border border-emerald-500/30 rounded-[14px] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#22c55e]" />
              <h4 className="text-sm font-semibold text-[#e6edf7]">
                Performa Trade Disiplin (Patuhi SOP)
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-[#22c55e] border border-emerald-500/30">
              {disciplinedTrades.length} Transaksi
            </span>
          </div>

          <p className="text-2xl font-bold text-[#22c55e] tabular-nums font-mono-num mb-1">
            {formatCurrency(disciplinedPnl, currency, true)}
          </p>
          <p className="text-xs text-[#8a9ab5]">
            Bukti nyata bahwa konsistensi aturan trading menghasilkan akumulasi laba yang terukur dan stabil.
          </p>
        </div>

        {/* Undisciplined / FOMO PnL Card */}
        <div className="bg-[#111a2e] border border-rose-500/30 rounded-[14px] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
              <h4 className="text-sm font-semibold text-[#e6edf7]">
                Dampak Biaya Emosi (Pelanggaran Aturan)
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-[#ef4444] border border-rose-500/30">
              {undisciplinedTrades.length} Pelanggaran
            </span>
          </div>

          <p className="text-2xl font-bold text-[#ef4444] tabular-nums font-mono-num mb-1">
            {formatCurrency(undisciplinedPnl, currency, true)}
          </p>
          <p className="text-xs text-[#8a9ab5]">
            Kerugian yang dialami akibat FOMO, balas dendam, atau masuk posisi tanpa konfirmasi SOP matang.
          </p>
        </div>
      </div>

      {/* Emotion Matrix Table */}
      <div className="bg-[#111a2e] border border-[#1e2b45] rounded-[14px] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#22d3ee]" />
              <h3 className="text-sm font-semibold text-[#e6edf7] uppercase tracking-wider">
                Matriks Korelasi Psikologi & Tingkat Kemenangan
              </h3>
            </div>
            <p className="text-xs text-[#8a9ab5] mt-0.5">
              Identifikasi kondisi emosional yang memberikan profitabilitas tertinggi bagi Anda
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0f172a] text-[#8a9ab5] border-b border-[#1e2b45]">
                <th className="py-2.5 px-3 uppercase text-[11px] font-semibold">Kondisi Emosional</th>
                <th className="py-2.5 px-3 uppercase text-[11px] font-semibold text-center">Frekuensi</th>
                <th className="py-2.5 px-3 uppercase text-[11px] font-semibold text-center">Win Rate</th>
                <th className="py-2.5 px-3 uppercase text-[11px] font-semibold text-center">Kepatuhan SOP</th>
                <th className="py-2.5 px-3 uppercase text-[11px] font-semibold text-right">PnL Bersih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16223b]">
              {emotionStats.map((item) => (
                <tr key={item.emotion} className="hover:bg-[#131e36] transition">
                  <td className="py-3 px-3 font-medium text-[#e6edf7] flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.netPnl >= 0 ? 'bg-[#22c55e]' : 'bg-[#ef4444]'
                      }`}
                    />
                    {item.emotion}
                  </td>
                  <td className="py-3 px-3 text-center text-[#8a9ab5] tabular-nums font-mono-num">
                    {item.count} trade
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`font-semibold tabular-nums font-mono-num ${
                        item.winRate >= 60
                          ? 'text-[#22c55e]'
                          : item.winRate >= 40
                          ? 'text-[#22d3ee]'
                          : 'text-[#ef4444]'
                      }`}
                    >
                      {item.winRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-[#8a9ab5] tabular-nums font-mono-num">
                    {item.ruleFollowedPercent}%
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-bold tabular-nums font-mono-num ${
                      item.netPnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
                    }`}
                  >
                    {formatCurrency(item.netPnl, currency, true)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rules Discipline Checklist */}
      <div className="bg-[#111a2e] border border-[#1e2b45] rounded-[14px] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-[#e6edf7] uppercase tracking-wider">
            SOP & Rukun Disiplin Trading Profesional
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rulesList.map((rule, idx) => (
            <div
              key={idx}
              className="bg-[#0f172a] border border-[#1e2b45] rounded-lg p-3 flex items-start gap-3"
            >
              <div className="mt-0.5 p-1 rounded bg-blue-500/10 text-[#3b82f6]">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-xs font-semibold text-[#e6edf7]">{rule.title}</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e2b45] text-[#22d3ee] font-mono-num">
                    {rule.status}
                  </span>
                </div>
                <p className="text-[11px] text-[#8a9ab5] leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
