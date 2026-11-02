/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SetupStat } from '../utils/tradingCalculations';
import { formatCurrency } from '../utils/tradingCalculations';
import { PieChart, Sparkles } from 'lucide-react';

interface StrategyDistributionProps {
  strategyStats: SetupStat[];
  currency: 'USD' | 'IDR';
}

export const StrategyDistribution: React.FC<StrategyDistributionProps> = ({
  strategyStats,
  currency,
}) => {
  return (
    <div className="bg-[#111a2e] border border-[#1e2b45] rounded-[14px] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#22d3ee]" />
            <h3 className="text-sm font-semibold text-[#e6edf7] uppercase tracking-wider">
              Distribusi Setup & Performa Strategi
            </h3>
          </div>
          <p className="text-xs text-[#8a9ab5] mt-0.5">
            Analisis keandalan edge trading berdasarkan rasio kemenangan & PnL
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {strategyStats.map((item) => {
          const isProfitable = item.netPnl >= 0;
          return (
            <div
              key={item.setup}
              className="bg-[#0f172a] border border-[#1e2b45] hover:border-[#2a3c61] rounded-lg p-3 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-[#e6edf7]">{item.setup}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1b2b41] text-[#8a9ab5] font-mono-num">
                    {item.count} trade
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#8a9ab5]">
                    Win Rate:{' '}
                    <strong className="text-[#22d3ee] font-mono-num tabular-nums">
                      {item.winRate}%
                    </strong>
                  </span>
                  <span
                    className={`text-xs font-bold tabular-nums font-mono-num ${
                      isProfitable ? 'text-[#22c55e]' : 'text-[#ef4444]'
                    }`}
                  >
                    {formatCurrency(item.netPnl, currency, true)}
                  </span>
                </div>
              </div>

              {/* Progress bars: Visualizing win rate vs loss */}
              <div className="w-full bg-[#0b1220] h-2 rounded-full overflow-hidden flex border border-[#1e2b45]">
                <div
                  className="bg-[#22c55e] h-full"
                  style={{ width: `${item.winRate}%` }}
                  title={`Menang: ${item.winCount}`}
                />
                <div
                  className="bg-[#ef4444] h-full"
                  style={{ width: `${100 - item.winRate}%` }}
                  title={`Kalah: ${item.lossCount}`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#8a9ab5] mt-1.5">
                <span className="text-[#22c55e]">{item.winCount} Menang</span>
                <span className="text-[#ef4444]">{item.lossCount} Kalah</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
