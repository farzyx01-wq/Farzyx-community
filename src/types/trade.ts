/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MarketType = 'Forex' | 'Kripto' | 'Saham' | 'Komoditas' | 'Indeks';

export type PositionType = 'LONG' | 'SHORT';

export type TradeStatus = 'Menang' | 'Kalah' | 'BEP' | 'Terbuka';

export type TradeSetup = 
  | 'Order Block / SMC'
  | 'Breakout Pullback'
  | 'Liquidity Sweep'
  | 'Fair Value Gap (FVG)'
  | 'Trend Following'
  | 'Support & Resistance'
  | 'Mean Reversion';

export type TradingEmotion = 
  | 'Disiplin Tinggi'
  | 'Sabar & Tenang'
  | 'FOMO'
  | 'Revenge Trading'
  | 'Cemas / Takut'
  | 'Terburu-buru'
  | 'Rencana Sempurna';

export interface Trade {
  id: string;
  pair: string;               // e.g. 'XAUUSD', 'BTCUSDT', 'EURUSD', 'BBRI.JK'
  market: MarketType;
  position: PositionType;
  entryDate: string;          // ISO string '2026-10-28T09:30'
  exitDate?: string;          // ISO string '2026-10-28T14:45'
  entryPrice: number;
  exitPrice?: number;
  targetPrice: number;        // TP
  stopLoss: number;           // SL
  lotSize: number;            // Volume / Lot
  pnl: number;                // Net Realized PnL in base currency (USD by default)
  status: TradeStatus;
  riskRewardRatio: number;    // Achieved or planned R:R (e.g. 2.5)
  setup: TradeSetup;
  psychology: TradingEmotion;
  ruleAdherence: boolean;     // Obeyed trading rules
  notes?: string;
  tags?: string[];
}

export interface TradeStats {
  totalTrades: number;
  winTrades: number;
  lossTrades: number;
  bepTrades: number;
  openTrades: number;
  winRate: number;            // Percentage 0-100
  totalNetPnl: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  avgRR: number;
  maxDrawdown: number;
  bestTrade: number;
  worstTrade: number;
  totalLotVolume: number;
  ruleAdherenceRate: number;  // Percentage 0-100
}

export interface DailyPnL {
  date: string;               // YYYY-MM-DD
  pnl: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  trades: Trade[];
}

export interface EquityPoint {
  date: string;
  tradeId?: string;
  pair?: string;
  balance: number;
  pnlChange: number;
  drawdown: number;
}
