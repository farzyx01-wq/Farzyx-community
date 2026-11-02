/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTradeStats,
  calculateRiskReward,
  calculatePositionSize,
  calculateEquityCurve,
  formatCurrency,
} from './tradingCalculations';
import { Trade } from '../types/trade';

test('calculateRiskReward returns correct ratio for LONG and SHORT', () => {
  // LONG: Entry 100, SL 90, TP 130 -> Risk = 10, Reward = 30 -> R:R = 3.0
  const longRR = calculateRiskReward('LONG', 100, 90, 130);
  assert.equal(longRR, 3.0);

  // SHORT: Entry 200, SL 210, TP 170 -> Risk = 10, Reward = 30 -> R:R = 3.0
  const shortRR = calculateRiskReward('SHORT', 200, 210, 170);
  assert.equal(shortRR, 3.0);

  // Invalid SL/TP
  assert.equal(calculateRiskReward('LONG', 100, 110, 130), 0);
  assert.equal(calculateRiskReward('SHORT', 100, 90, 130), 0);
});

test('calculatePositionSize calculates proper risk and lots', () => {
  // $10,000 balance, 1% risk ($100), Entry 2000, SL 1990 (dist 10)
  const result = calculatePositionSize(10000, 1, 2000, 1990, 1);
  assert.equal(result.riskAmount, 100);
  assert.equal(result.slDistance, 10);
  assert.equal(result.positionSize, 10);
});

test('calculateTradeStats computes win rate, profit factor, drawdown accurately', () => {
  const mockTrades: Trade[] = [
    {
      id: 't-1',
      pair: 'XAUUSD',
      market: 'Komoditas',
      position: 'LONG',
      entryDate: '2026-10-01T10:00',
      exitDate: '2026-10-01T15:00',
      entryPrice: 2650,
      exitPrice: 2675,
      targetPrice: 2680,
      stopLoss: 2640,
      lotSize: 0.5,
      pnl: 1250,
      status: 'Menang',
      riskRewardRatio: 2.5,
      setup: 'Order Block / SMC',
      psychology: 'Disiplin Tinggi',
      ruleAdherence: true,
    },
    {
      id: 't-2',
      pair: 'BTCUSDT',
      market: 'Kripto',
      position: 'SHORT',
      entryDate: '2026-10-02T11:00',
      exitDate: '2026-10-02T13:00',
      entryPrice: 68000,
      exitPrice: 68500,
      targetPrice: 67000,
      stopLoss: 68500,
      lotSize: 0.1,
      pnl: -500,
      status: 'Kalah',
      riskRewardRatio: 2.0,
      setup: 'Breakout Pullback',
      psychology: 'FOMO',
      ruleAdherence: false,
    },
    {
      id: 't-3',
      pair: 'EURUSD',
      market: 'Forex',
      position: 'LONG',
      entryDate: '2026-10-03T09:00',
      exitDate: '2026-10-03T18:00',
      entryPrice: 1.085,
      exitPrice: 1.092,
      targetPrice: 1.095,
      stopLoss: 1.082,
      lotSize: 1.0,
      pnl: 700,
      status: 'Menang',
      riskRewardRatio: 2.33,
      setup: 'Liquidity Sweep',
      psychology: 'Sabar & Tenang',
      ruleAdherence: true,
    },
    {
      id: 't-4',
      pair: 'BBRI.JK',
      market: 'Saham',
      position: 'LONG',
      entryDate: '2026-10-04T09:00',
      entryPrice: 4800,
      targetPrice: 5200,
      stopLoss: 4700,
      lotSize: 100,
      pnl: 0,
      status: 'Terbuka',
      riskRewardRatio: 4.0,
      setup: 'Trend Following',
      psychology: 'Disiplin Tinggi',
      ruleAdherence: true,
    },
  ];

  const stats = calculateTradeStats(mockTrades);
  // Total closed = 3 (2 win, 1 loss, 1 open)
  assert.equal(stats.totalTrades, 3);
  assert.equal(stats.winTrades, 2);
  assert.equal(stats.lossTrades, 1);
  assert.equal(stats.openTrades, 1);
  assert.equal(stats.winRate, 66.7);
  // Total Net = 1250 - 500 + 700 = 1450
  assert.equal(stats.totalNetPnl, 1450);
  assert.equal(stats.grossProfit, 1950);
  assert.equal(stats.grossLoss, 500);
  // Profit factor = 1950 / 500 = 3.9
  assert.equal(stats.profitFactor, 3.9);
  // Rule adherence: 2 out of 3 closed = 66.7%
  assert.equal(stats.ruleAdherenceRate, 66.7);
});

test('calculateEquityCurve handles initial balance and cumulative points', () => {
  const trades: Trade[] = [
    {
      id: 't-1',
      pair: 'XAUUSD',
      market: 'Komoditas',
      position: 'LONG',
      entryDate: '2026-10-01T10:00',
      exitDate: '2026-10-01T15:00',
      entryPrice: 2600,
      targetPrice: 2650,
      stopLoss: 2580,
      lotSize: 1,
      pnl: 500,
      status: 'Menang',
      riskRewardRatio: 2.5,
      setup: 'Order Block / SMC',
      psychology: 'Disiplin Tinggi',
      ruleAdherence: true,
    },
  ];

  const curve = calculateEquityCurve(trades, 10000);
  assert.equal(curve.length, 2);
  assert.equal(curve[0].balance, 10000);
  assert.equal(curve[1].balance, 10500);
});

test('formatCurrency formats positive and negative values correctly', () => {
  assert.equal(formatCurrency(1250, 'USD', true), '+$1,250.00');
  assert.equal(formatCurrency(-500, 'USD', true), '-$500.00');
  assert.equal(formatCurrency(-500, 'USD', false), '-$500.00');
  assert.equal(formatCurrency(0, 'USD', false), '$0.00');
});
