/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trade, TradeStats, DailyPnL, EquityPoint, TradeSetup, TradingEmotion } from '../types/trade';

export function calculateTradeStats(trades: Trade[]): TradeStats {
  const closedTrades = trades.filter((t) => t.status !== 'Terbuka');
  const totalTrades = closedTrades.length;

  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      winTrades: 0,
      lossTrades: 0,
      bepTrades: 0,
      openTrades: trades.filter((t) => t.status === 'Terbuka').length,
      winRate: 0,
      totalNetPnl: 0,
      grossProfit: 0,
      grossLoss: 0,
      profitFactor: 0,
      avgRR: 0,
      maxDrawdown: 0,
      bestTrade: 0,
      worstTrade: 0,
      totalLotVolume: 0,
      ruleAdherenceRate: 0,
    };
  }

  let winTrades = 0;
  let lossTrades = 0;
  let bepTrades = 0;
  let totalNetPnl = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let totalRR = 0;
  let bestTrade = -Infinity;
  let worstTrade = Infinity;
  let totalLotVolume = 0;
  let ruleFollowedCount = 0;

  for (const t of closedTrades) {
    totalNetPnl += t.pnl;
    totalLotVolume += t.lotSize;
    if (t.ruleAdherence) ruleFollowedCount++;

    if (t.pnl > 0) {
      winTrades++;
      grossProfit += t.pnl;
    } else if (t.pnl < 0) {
      lossTrades++;
      grossLoss += Math.abs(t.pnl);
    } else {
      bepTrades++;
    }

    if (t.pnl > bestTrade) bestTrade = t.pnl;
    if (t.pnl < worstTrade) worstTrade = t.pnl;
    totalRR += t.riskRewardRatio || 0;
  }

  const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 99.99 : 0);
  const avgRR = totalTrades > 0 ? totalRR / totalTrades : 0;
  const ruleAdherenceRate = totalTrades > 0 ? (ruleFollowedCount / totalTrades) * 100 : 0;

  // Calculate Max Drawdown based on equity curve
  let peak = 0;
  let runningBalance = 0;
  let maxDrawdown = 0;

  // Sort trades chronologically
  const sortedTrades = [...closedTrades].sort(
    (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  );

  for (const t of sortedTrades) {
    runningBalance += t.pnl;
    if (runningBalance > peak) {
      peak = runningBalance;
    }
    const currentDrawdown = peak - runningBalance;
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown;
    }
  }

  return {
    totalTrades,
    winTrades,
    lossTrades,
    bepTrades,
    openTrades: trades.filter((t) => t.status === 'Terbuka').length,
    winRate: Number(winRate.toFixed(1)),
    totalNetPnl: Number(totalNetPnl.toFixed(2)),
    grossProfit: Number(grossProfit.toFixed(2)),
    grossLoss: Number(grossLoss.toFixed(2)),
    profitFactor: Number(profitFactor.toFixed(2)),
    avgRR: Number(avgRR.toFixed(2)),
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    bestTrade: bestTrade === -Infinity ? 0 : Number(bestTrade.toFixed(2)),
    worstTrade: worstTrade === Infinity ? 0 : Number(worstTrade.toFixed(2)),
    totalLotVolume: Number(totalLotVolume.toFixed(2)),
    ruleAdherenceRate: Number(ruleAdherenceRate.toFixed(1)),
  };
}

export function calculateEquityCurve(
  trades: Trade[],
  initialBalance: number = 10000
): EquityPoint[] {
  const closedTrades = trades
    .filter((t) => t.status !== 'Terbuka')
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());

  if (closedTrades.length === 0) {
    return [
      {
        date: new Date().toISOString().slice(0, 10),
        balance: initialBalance,
        pnlChange: 0,
        drawdown: 0,
      },
    ];
  }

  const points: EquityPoint[] = [
    {
      date: closedTrades[0].entryDate.slice(0, 10),
      balance: initialBalance,
      pnlChange: 0,
      drawdown: 0,
    },
  ];

  let currentBalance = initialBalance;
  let peak = initialBalance;

  for (const trade of closedTrades) {
    currentBalance += trade.pnl;
    if (currentBalance > peak) {
      peak = currentBalance;
    }
    const drawdown = peak > 0 ? ((peak - currentBalance) / peak) * 100 : 0;

    points.push({
      date: (trade.exitDate || trade.entryDate).slice(0, 10),
      tradeId: trade.id,
      pair: trade.pair,
      balance: Number(currentBalance.toFixed(2)),
      pnlChange: trade.pnl,
      drawdown: Number(drawdown.toFixed(2)),
    });
  }

  return points;
}

export function calculateDailyPnL(trades: Trade[]): Map<string, DailyPnL> {
  const dailyMap = new Map<string, DailyPnL>();

  const closedTrades = trades.filter((t) => t.status !== 'Terbuka');

  for (const trade of closedTrades) {
    const dateKey = (trade.exitDate || trade.entryDate).slice(0, 10);
    const existing = dailyMap.get(dateKey) || {
      date: dateKey,
      pnl: 0,
      tradeCount: 0,
      winCount: 0,
      lossCount: 0,
      trades: [],
    };

    existing.pnl += trade.pnl;
    existing.tradeCount += 1;
    if (trade.pnl > 0) existing.winCount += 1;
    if (trade.pnl < 0) existing.lossCount += 1;
    existing.trades.push(trade);

    dailyMap.set(dateKey, existing);
  }

  return dailyMap;
}

export interface SetupStat {
  setup: TradeSetup;
  count: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  netPnl: number;
}

export function calculateStrategyDistribution(trades: Trade[]): SetupStat[] {
  const closedTrades = trades.filter((t) => t.status !== 'Terbuka');
  const setupMap = new Map<
    TradeSetup,
    { count: number; winCount: number; lossCount: number; netPnl: number }
  >();

  for (const t of closedTrades) {
    const existing = setupMap.get(t.setup) || {
      count: 0,
      winCount: 0,
      lossCount: 0,
      netPnl: 0,
    };
    existing.count += 1;
    existing.netPnl += t.pnl;
    if (t.pnl > 0) existing.winCount += 1;
    if (t.pnl < 0) existing.lossCount += 1;
    setupMap.set(t.setup, existing);
  }

  const results: SetupStat[] = [];
  for (const [setup, stat] of setupMap.entries()) {
    const winRate = stat.count > 0 ? (stat.winCount / stat.count) * 100 : 0;
    results.push({
      setup,
      count: stat.count,
      winCount: stat.winCount,
      lossCount: stat.lossCount,
      winRate: Number(winRate.toFixed(1)),
      netPnl: Number(stat.netPnl.toFixed(2)),
    });
  }

  return results.sort((a, b) => b.netPnl - a.netPnl);
}

export interface EmotionStat {
  emotion: TradingEmotion;
  count: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  netPnl: number;
  ruleFollowedPercent: number;
}

export function calculatePsychologyBreakdown(trades: Trade[]): EmotionStat[] {
  const closedTrades = trades.filter((t) => t.status !== 'Terbuka');
  const emotionMap = new Map<
    TradingEmotion,
    { count: number; winCount: number; lossCount: number; netPnl: number; ruleFollowed: number }
  >();

  for (const t of closedTrades) {
    const existing = emotionMap.get(t.psychology) || {
      count: 0,
      winCount: 0,
      lossCount: 0,
      netPnl: 0,
      ruleFollowed: 0,
    };
    existing.count += 1;
    existing.netPnl += t.pnl;
    if (t.pnl > 0) existing.winCount += 1;
    if (t.pnl < 0) existing.lossCount += 1;
    if (t.ruleAdherence) existing.ruleFollowed += 1;
    emotionMap.set(t.psychology, existing);
  }

  const results: EmotionStat[] = [];
  for (const [emotion, stat] of emotionMap.entries()) {
    const winRate = stat.count > 0 ? (stat.winCount / stat.count) * 100 : 0;
    const ruleFollowedPercent = stat.count > 0 ? (stat.ruleFollowed / stat.count) * 100 : 0;
    results.push({
      emotion,
      count: stat.count,
      winCount: stat.winCount,
      lossCount: stat.lossCount,
      winRate: Number(winRate.toFixed(1)),
      netPnl: Number(stat.netPnl.toFixed(2)),
      ruleFollowedPercent: Number(ruleFollowedPercent.toFixed(1)),
    });
  }

  return results.sort((a, b) => b.netPnl - a.netPnl);
}

export function calculateRiskReward(
  position: 'LONG' | 'SHORT',
  entryPrice: number,
  stopLoss: number,
  targetPrice: number
): number {
  if (entryPrice <= 0 || stopLoss <= 0 || targetPrice <= 0) return 0;

  if (position === 'LONG') {
    const risk = entryPrice - stopLoss;
    const reward = targetPrice - entryPrice;
    if (risk <= 0 || reward <= 0) return 0;
    return Number((reward / risk).toFixed(2));
  } else {
    const risk = stopLoss - entryPrice;
    const reward = entryPrice - targetPrice;
    if (risk <= 0 || reward <= 0) return 0;
    return Number((reward / risk).toFixed(2));
  }
}

export function calculatePositionSize(
  accountBalance: number,
  riskPercentage: number,
  entryPrice: number,
  stopLoss: number,
  instrumentMultiplier: number = 1
): {
  riskAmount: number;
  positionSize: number;
  slDistance: number;
} {
  const riskAmount = (accountBalance * riskPercentage) / 100;
  const slDistance = Math.abs(entryPrice - stopLoss);

  if (slDistance === 0) {
    return { riskAmount, positionSize: 0, slDistance: 0 };
  }

  // Position Size = Risk Amount / (SL distance * contract multiplier)
  const positionSize = riskAmount / (slDistance * instrumentMultiplier);

  return {
    riskAmount: Number(riskAmount.toFixed(2)),
    positionSize: Number(positionSize.toFixed(2)),
    slDistance: Number(slDistance.toFixed(4)),
  };
}

export function formatCurrency(
  amount: number,
  currency: 'USD' | 'IDR' = 'USD',
  showPlusSign: boolean = false
): string {
  const isNegative = amount < 0;
  const sign = isNegative ? '-' : (showPlusSign && amount > 0 ? '+' : '');
  const absAmount = Math.abs(amount);
  if (currency === 'USD') {
    return `${sign}$${absAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } else {
    // 1 USD approx 16,000 IDR for converter demo
    const idrAmount = absAmount * 16000;
    return `${sign}Rp${idrAmount.toLocaleString('id-ID', {
      maximumFractionDigits: 0,
    })}`;
  }
}
