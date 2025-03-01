import { CandleData } from './marketApi';

export interface TechnicalPattern {
  type: PatternType;
  confidence: number;
  startIndex: number;
  endIndex: number;
  description: string;
}

export type PatternType =
  | 'bullish_engulfing'
  | 'bearish_engulfing'
  | 'hammer'
  | 'shooting_star'
  | 'morning_star'
  | 'evening_star'
  | 'doji'
  | 'double_top'
  | 'double_bottom'
  | 'head_and_shoulders'
  | 'inverse_head_and_shoulders'
  | 'triangle'
  | 'wedge'
  | 'channel';

export interface TechnicalAnalysisResult {
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
  atr: number[];
  obv: number[];
  patterns: TechnicalPattern[];
  support: number[];
  resistance: number[];
  pivotPoints: {
    r3: number;
    r2: number;
    r1: number;
    pivot: number;
    s1: number;
    s2: number;
    s3: number;
  };
  fibonacci: {
    levels: number[];
    retracements: number[];
    extensions: number[];
  };
}

class TechnicalAnalysisService {
  // Moving Averages
  calculateSMA(data: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        sma.push(NaN);
        continue;
      }
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  calculateEMA(data: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);

    // Initialize EMA with SMA
    const firstSMA = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    ema.push(firstSMA);

    for (let i = 1; i < data.length; i++) {
      const currentEMA = (data[i] - ema[i - 1]) * multiplier + ema[i - 1];
      ema.push(currentEMA);
    }

    return ema;
  }

  // Relative Strength Index
  calculateRSI(data: number[], period: number = 14): number[] {
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    // Calculate price changes
    for (let i = 1; i < data.length; i++) {
      const change = data[i] - data[i - 1];
      gains.push(Math.max(0, change));
      losses.push(Math.max(0, -change));
    }

    // Calculate initial averages
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    // Calculate RSI
    for (let i = period; i < data.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i - 1]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i - 1]) / period;

      const rs = avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      rsi.push(rsiValue);
    }

    return rsi;
  }

  // MACD
  calculateMACD(data: number[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9): {
    macdLine: number[];
    signalLine: number[];
    histogram: number[];
  } {
    const fastEMA = this.calculateEMA(data, fastPeriod);
    const slowEMA = this.calculateEMA(data, slowPeriod);
    const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
    const signalLine = this.calculateEMA(macdLine, signalPeriod);
    const histogram = macdLine.map((macd, i) => macd - signalLine[i]);

    return { macdLine, signalLine, histogram };
  }

  // Bollinger Bands
  calculateBollingerBands(data: number[], period = 20, stdDev = 2): {
    upper: number[];
    middle: number[];
    lower: number[];
  } {
    const middle = this.calculateSMA(data, period);
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const std = this.calculateStandardDeviation(slice);
      upper.push(middle[i] + stdDev * std);
      lower.push(middle[i] - stdDev * std);
    }

    return { upper, middle, lower };
  }

  // Average True Range
  calculateATR(candles: CandleData[], period = 14): number[] {
    const tr: number[] = [];
    const atr: number[] = [];

    // Calculate True Range
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;

      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);

      tr.push(Math.max(tr1, tr2, tr3));
    }

    // Calculate ATR
    let sum = tr.slice(0, period).reduce((a, b) => a + b, 0);
    atr.push(sum / period);

    for (let i = period; i < tr.length; i++) {
      atr.push((atr[atr.length - 1] * (period - 1) + tr[i]) / period);
    }

    return atr;
  }

  // On-Balance Volume
  calculateOBV(candles: CandleData[]): number[] {
    const obv: number[] = [0];

    for (let i = 1; i < candles.length; i++) {
      const currentClose = candles[i].close;
      const previousClose = candles[i - 1].close;
      const currentVolume = candles[i].volume;

      if (currentClose > previousClose) {
        obv.push(obv[i - 1] + currentVolume);
      } else if (currentClose < previousClose) {
        obv.push(obv[i - 1] - currentVolume);
      } else {
        obv.push(obv[i - 1]);
      }
    }

    return obv;
  }

  // Pattern Recognition
  findPatterns(candles: CandleData[]): TechnicalPattern[] {
    const patterns: TechnicalPattern[] = [];

    // Implement pattern recognition logic here
    this.findCandlestickPatterns(candles, patterns);
    this.findChartPatterns(candles, patterns);

    return patterns;
  }

  // Support and Resistance
  findSupportResistance(candles: CandleData[]): { support: number[]; resistance: number[] } {
    const support: number[] = [];
    const resistance: number[] = [];

    // Implement support and resistance detection logic here
    // This would typically involve analyzing price action and volume

    return { support, resistance };
  }

  // Pivot Points
  calculatePivotPoints(high: number, low: number, close: number): {
    r3: number;
    r2: number;
    r1: number;
    pivot: number;
    s1: number;
    s2: number;
    s3: number;
  } {
    const pivot = (high + low + close) / 3;
    const r1 = 2 * pivot - low;
    const r2 = pivot + (high - low);
    const r3 = high + 2 * (pivot - low);
    const s1 = 2 * pivot - high;
    const s2 = pivot - (high - low);
    const s3 = low - 2 * (high - pivot);

    return { r3, r2, r1, pivot, s1, s2, s3 };
  }

  // Fibonacci Levels
  calculateFibonacciLevels(high: number, low: number): {
    levels: number[];
    retracements: number[];
    extensions: number[];
  } {
    const diff = high - low;
    const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
    const retracements = levels.map(level => high - diff * level);
    const extensions = [1.272, 1.618, 2.618, 3.618, 4.236].map(level => high + diff * level);

    return {
      levels,
      retracements,
      extensions
    };
  }

  // Helper Methods
  private calculateStandardDeviation(data: number[]): number {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const squareDiffs = data.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  private findCandlestickPatterns(candles: CandleData[], patterns: TechnicalPattern[]): void {
    // Implement candlestick pattern recognition
    // Examples: Doji, Hammer, Engulfing patterns, etc.
  }

  private findChartPatterns(candles: CandleData[], patterns: TechnicalPattern[]): void {
    // Implement chart pattern recognition
    // Examples: Head and Shoulders, Double Top/Bottom, etc.
  }

  // Comprehensive Analysis
  async analyzeSymbol(candles: CandleData[]): Promise<TechnicalAnalysisResult> {
    const closePrices = candles.map(c => c.close);
    
    const sma = this.calculateSMA(closePrices, 20);
    const ema = this.calculateEMA(closePrices, 20);
    const rsi = this.calculateRSI(closePrices);
    const macd = this.calculateMACD(closePrices);
    const bollinger = this.calculateBollingerBands(closePrices);
    const atr = this.calculateATR(candles);
    const obv = this.calculateOBV(candles);
    const patterns = this.findPatterns(candles);
    const { support, resistance } = this.findSupportResistance(candles);
    
    const lastCandle = candles[candles.length - 1];
    const pivotPoints = this.calculatePivotPoints(
      lastCandle.high,
      lastCandle.low,
      lastCandle.close
    );
    
    const fibonacci = this.calculateFibonacciLevels(
      Math.max(...candles.map(c => c.high)),
      Math.min(...candles.map(c => c.low))
    );

    return {
      sma,
      ema,
      rsi,
      macd,
      bollinger,
      atr,
      obv,
      patterns,
      support,
      resistance,
      pivotPoints,
      fibonacci
    };
  }
}

export const technicalAnalysisService = new TechnicalAnalysisService(); 