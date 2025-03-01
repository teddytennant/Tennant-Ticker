import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { retryWhen, delay, take } from 'rxjs/operators';

const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY;

const BASE_URL = 'https://www.alphavantage.co/query';
const FINNHUB_WS_URL = 'wss://ws.finnhub.io';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

interface MarketDataState {
  realTimeData: Map<string, RealTimeQuote>;
  historicalData: Map<string, HistoricalData>;
  technicalIndicators: Map<string, TechnicalIndicators>;
  fundamentalData: Map<string, FundamentalData>;
  marketNews: NewsItem[];
  errors: Error[];
}

export interface RealTimeQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
}

export interface HistoricalData {
  symbol: string;
  timeframe: string;
  data: CandleData[];
  lastUpdated: number;
}

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
}

export interface TechnicalIndicators {
  symbol: string;
  sma: number[];
  ema: number[];
  rsi: number[];
  macd: {
    macdLine: number[];
    signalLine: number[];
    histogram: number[];
  };
  bollinger: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
}

export interface FundamentalData {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  marketCap: number;
  peRatio: number;
  eps: number;
  beta: number;
  dividendYield: number;
  profitMargin: number;
  revenueGrowth: number;
  debtToEquity: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  timestamp: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  relevance: number;
  symbols: string[];
}

class MarketDataService {
  private socket: Socket | null = null;
  private state = new BehaviorSubject<MarketDataState>({
    realTimeData: new Map(),
    historicalData: new Map(),
    technicalIndicators: new Map(),
    fundamentalData: new Map(),
    marketNews: [],
    errors: []
  });

  private subscriptions: Set<string> = new Set();
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  constructor() {
    this.initializeWebSocket();
    this.startPeriodicDataRefresh();
  }

  private initializeWebSocket() {
    try {
      this.socket = io(FINNHUB_WS_URL, {
        transports: ['websocket'],
        query: { token: FINNHUB_API_KEY }
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.resubscribeSymbols();
      });

      this.socket.on('trade', (data: any) => {
        this.handleTradeData(data);
      });

      this.socket.on('error', (error: Error) => {
        console.error('WebSocket error:', error);
        this.handleError(error);
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        this.handleDisconnect();
      });
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.handleError(error as Error);
    }
  }

  private handleTradeData(data: any) {
    const currentState = this.state.value;
    const updatedRealTimeData = new Map(currentState.realTimeData);

    try {
      const quote: RealTimeQuote = {
        symbol: data.s,
        price: data.p,
        change: data.p - (currentState.realTimeData.get(data.s)?.price ?? data.p),
        changePercent: ((data.p - (currentState.realTimeData.get(data.s)?.price ?? data.p)) / data.p) * 100,
        volume: data.v,
        timestamp: data.t,
        bid: data.b,
        ask: data.a,
        bidSize: data.bs,
        askSize: data.as
      };

      updatedRealTimeData.set(data.s, quote);
      this.state.next({
        ...currentState,
        realTimeData: updatedRealTimeData
      });
    } catch (error) {
      console.error('Error processing trade data:', error);
      this.handleError(error as Error);
    }
  }

  private async startPeriodicDataRefresh() {
    setInterval(async () => {
      const symbols = Array.from(this.subscriptions);
      for (const symbol of symbols) {
        await this.refreshHistoricalData(symbol);
        await this.refreshTechnicalIndicators(symbol);
        await this.refreshFundamentalData(symbol);
      }
      await this.refreshMarketNews();
    }, CACHE_DURATION);
  }

  private async refreshHistoricalData(symbol: string) {
    try {
      const response = await this.fetchWithRetry(() =>
        axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/2023-01-01/${new Date().toISOString().split('T')[0]}`, {
          headers: { Authorization: `Bearer ${POLYGON_API_KEY}` }
        })
      );

      const historicalData: HistoricalData = {
        symbol,
        timeframe: '1D',
        data: response.data.results.map((candle: any) => ({
          timestamp: candle.t,
          open: candle.o,
          high: candle.h,
          low: candle.l,
          close: candle.c,
          volume: candle.v,
          vwap: candle.vw
        })),
        lastUpdated: Date.now()
      };

      const currentState = this.state.value;
      const updatedHistoricalData = new Map(currentState.historicalData);
      updatedHistoricalData.set(symbol, historicalData);

      this.state.next({
        ...currentState,
        historicalData: updatedHistoricalData
      });
    } catch (error) {
      console.error(`Failed to refresh historical data for ${symbol}:`, error);
      this.handleError(error as Error);
    }
  }

  private async refreshTechnicalIndicators(symbol: string) {
    try {
      const [sma, ema, rsi, macd, bollinger] = await Promise.all([
        this.fetchSMA(symbol),
        this.fetchEMA(symbol),
        this.fetchRSI(symbol),
        this.fetchMACD(symbol),
        this.fetchBollinger(symbol)
      ]);

      const technicalIndicators: TechnicalIndicators = {
        symbol,
        sma,
        ema,
        rsi,
        macd,
        bollinger
      };

      const currentState = this.state.value;
      const updatedTechnicalIndicators = new Map(currentState.technicalIndicators);
      updatedTechnicalIndicators.set(symbol, technicalIndicators);

      this.state.next({
        ...currentState,
        technicalIndicators: updatedTechnicalIndicators
      });
    } catch (error) {
      console.error(`Failed to refresh technical indicators for ${symbol}:`, error);
      this.handleError(error as Error);
    }
  }

  private async fetchWithRetry<T>(fn: () => Promise<T>, retries = RETRY_ATTEMPTS): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return this.fetchWithRetry(fn, retries - 1);
    }
  }

  // Public API methods
  public subscribe(symbol: string) {
    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.add(symbol);
      this.socket?.emit('subscribe', { symbol });
      this.refreshHistoricalData(symbol);
      this.refreshTechnicalIndicators(symbol);
      this.refreshFundamentalData(symbol);
    }
  }

  public unsubscribe(symbol: string) {
    if (this.subscriptions.has(symbol)) {
      this.subscriptions.delete(symbol);
      this.socket?.emit('unsubscribe', { symbol });
    }
  }

  public getState() {
    return this.state.asObservable();
  }

  public getRealTimeQuote(symbol: string): RealTimeQuote | undefined {
    return this.state.value.realTimeData.get(symbol);
  }

  public getHistoricalData(symbol: string): HistoricalData | undefined {
    return this.state.value.historicalData.get(symbol);
  }

  public getTechnicalIndicators(symbol: string): TechnicalIndicators | undefined {
    return this.state.value.technicalIndicators.get(symbol);
  }

  public getFundamentalData(symbol: string): FundamentalData | undefined {
    return this.state.value.fundamentalData.get(symbol);
  }

  public getMarketNews(): NewsItem[] {
    return this.state.value.marketNews;
  }

  private handleError(error: Error) {
    const currentState = this.state.value;
    this.state.next({
      ...currentState,
      errors: [...currentState.errors, error]
    });
  }

  private handleDisconnect() {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      setTimeout(() => this.initializeWebSocket(), RETRY_DELAY * this.reconnectAttempts);
    }
  }

  private resubscribeSymbols() {
    this.subscriptions.forEach(symbol => {
      this.socket?.emit('subscribe', { symbol });
    });
    this.reconnectAttempts = 0;
  }

  // Additional private methods for technical indicators
  private async fetchSMA(symbol: string): Promise<number[]> {
    // Implementation for Simple Moving Average
    return [];
  }

  private async fetchEMA(symbol: string): Promise<number[]> {
    // Implementation for Exponential Moving Average
    return [];
  }

  private async fetchRSI(symbol: string): Promise<number[]> {
    // Implementation for Relative Strength Index
    return [];
  }

  private async fetchMACD(symbol: string): Promise<{
    macdLine: number[];
    signalLine: number[];
    histogram: number[];
  }> {
    // Implementation for MACD
    return {
      macdLine: [],
      signalLine: [],
      histogram: []
    };
  }

  private async fetchBollinger(symbol: string): Promise<{
    upper: number[];
    middle: number[];
    lower: number[];
  }> {
    // Implementation for Bollinger Bands
    return {
      upper: [],
      middle: [],
      lower: []
    };
  }

  private async refreshFundamentalData(symbol: string) {
    // Implementation for fundamental data refresh
  }

  private async refreshMarketNews() {
    // Implementation for market news refresh
  }
}

export const marketDataService = new MarketDataService(); 