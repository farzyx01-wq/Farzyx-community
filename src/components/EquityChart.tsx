/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EquityPoint } from '../types/trade';
import { formatCurrency } from '../utils/tradingCalculations';
import { TrendingUp, Maximize2, ShieldAlert } from 'lucide-react';

interface EquityChartProps {
  equityPoints: EquityPoint[];
  initialBalance: number;
  currency: 'USD' | 'IDR';
}

export const EquityChart: React.FC<EquityChartProps> = ({
  equityPoints,
  initialBalance,
  currency,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (equityPoints.length === 0) {
    return (
      <div className="bg-[#111a2e] border border-[#1e2b45] rounded-[14px] p-6 text-center text-[#8a9ab5]">
        Belum ada data ekuitas transaksi.
      </div>
    );
  }

  // Find min and max for chart scaling
  const balances = equityPoints.map((p) => p.balance);
  const minVal = Math.min(...balances, initialBalance * 0.95);
  const maxVal = Math.max(...balances, initialBalance * 1.05);
  const range = maxVal - minVal || 1;

  // Chart dimensions
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 25;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Coordinate mapping
  const pointsCoords = equityPoints.map((p, idx) => {
    const x = paddingX + (idx / Math.max(equityPoints.length - 1, 1)) * chartW;
    const y = height - paddingY - ((p.balance - minVal) / range) * chartH;
    return { x, y, point: p };
  });

  // SVG path definitions
  const pathD = pointsCoords.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  // Fill path closing at bottom
  const areaD = `${pathD} L ${pointsCoords[pointsCoords.length - 1].x} ${height - paddingY} L ${pointsCoords[0].x} ${height - paddingY} Z`;

  const currentEquity = equityPoints[equityPoints.length - 1].balance;
  const totalGrowth = currentEquity - initialBalance;
  const growthPercent = ((totalGrowth / initialBalance) * 100).toFixed(2);
  const activeHoverPoint = hoveredIndex !== null ? pointsCoords[hoveredIndex] : null;

  return (
    <div className="bg-[#111a2e] border border-[#1e2b45] rounded-[14px] p-5 relative overflow-hidden transition-all duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#e6edf7] uppercase tracking-wider">
              Grafik Pertumbuhan Ekuitas Kumulatif
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-[#3b82f6] border border-blue-500/30">
              REAL-TIME
            </span>
          </div>
          <p className="text-xs text-[#8a9ab5] mt-0.5">
            Modal Awal: {formatCurrency(initialBalance, currency)} &bull; Pertumbuhan:{' '}
            <strong className={totalGrowth >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
              {totalGrowth >= 0 ? '+' : ''}
              {growthPercent}% ({formatCurrency(totalGrowth, currency, true)})
            </strong>
          </p>
        </div>

        {/* Current Balance Display */}
        <div className="text-right">
          <span className="text-[11px] text-[#8a9ab5] uppercase tracking-wider block">Saldo Portofolio</span>
          <span className="text-xl font-bold text-[#e6edf7] tabular-nums font-mono-num">
            {formatCurrency(
              activeHoverPoint ? activeHoverPoint.point.balance : currentEquity,
              currency
            )}
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[8/2.6] select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="60%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = paddingY + pct * chartH;
            const val = maxVal - pct * range;
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#1e2b45"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#4b5d78"
                  className="tabular-nums font-mono-num"
                >
                  {currency === 'USD' ? `$${Math.round(val)}` : `${(val / 1000).toFixed(0)}k`}
                </text>
              </g>
            );
          })}

          {/* Initial Balance reference baseline */}
          {initialBalance >= minVal && initialBalance <= maxVal && (
            <line
              x1={paddingX}
              y1={height - paddingY - ((initialBalance - minVal) / range) * chartH}
              x2={width - paddingX}
              y2={height - paddingY - ((initialBalance - minVal) / range) * chartH}
              stroke="#4b5d78"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
          )}

          {/* Filled Area */}
          <path d={areaD} fill="url(#equityGradient)" />

          {/* Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGlow)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive hover points */}
          {pointsCoords.map((pt, idx) => (
            <g key={idx} className="cursor-pointer">
              {/* Invisible larger hit circle */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="10"
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(idx)}
              />
              {/* Visible small circle */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === idx ? '5' : '3'}
                fill={
                  hoveredIndex === idx
                    ? '#22d3ee'
                    : pt.point.pnlChange > 0
                    ? '#22c55e'
                    : pt.point.pnlChange < 0
                    ? '#ef4444'
                    : '#3b82f6'
                }
                stroke="#0b1220"
                strokeWidth="2"
                className="transition-all duration-150"
              />
            </g>
          ))}

          {/* Active Hover Crosshair Line */}
          {activeHoverPoint && (
            <g>
              <line
                x1={activeHoverPoint.x}
                y1={paddingY}
                x2={activeHoverPoint.x}
                y2={height - paddingY}
                stroke="#22d3ee"
                strokeDasharray="3 3"
                strokeWidth="1.5"
                opacity="0.8"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Box */}
        {activeHoverPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-[#131e36] border border-[#3b82f6] rounded-lg p-2.5 shadow-xl text-xs backdrop-blur-md transform -translate-x-1/2 -translate-y-full transition-all duration-100"
            style={{
              left: `${(activeHoverPoint.x / width) * 100}%`,
              top: `${(activeHoverPoint.y / height) * 100 - 8}%`,
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="font-semibold text-[#e6edf7] font-mono-num">
                {activeHoverPoint.point.pair || 'Modal Awal'}
              </span>
              <span className="text-[10px] text-[#8a9ab5]">
                {activeHoverPoint.point.date}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[#8a9ab5] text-[10px] block">Saldo</span>
                <span className="text-[#e6edf7] font-bold tabular-nums font-mono-num">
                  {formatCurrency(activeHoverPoint.point.balance, currency)}
                </span>
              </div>
              {activeHoverPoint.point.pnlChange !== 0 && (
                <div>
                  <span className="text-[#8a9ab5] text-[10px] block">PnL</span>
                  <span
                    className={`font-bold tabular-nums font-mono-num ${
                      activeHoverPoint.point.pnlChange > 0
                        ? 'text-[#22c55e]'
                        : 'text-[#ef4444]'
                    }`}
                  >
                    {formatCurrency(activeHoverPoint.point.pnlChange, currency, true)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-3 text-[11px] text-[#8a9ab5] pt-2 border-t border-[#1e2b45]">
        <span>Titik Awal: {equityPoints[0].date}</span>
        <span className="text-right">Titik Terkini: {equityPoints[equityPoints.length - 1].date}</span>
      </div>
    </div>
  );
};
