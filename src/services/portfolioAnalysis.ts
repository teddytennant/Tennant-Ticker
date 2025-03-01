import { CandleData } from './marketApi';

interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
}

interface PortfolioStats {
  totalValue: number;
  dailyPnL: number;
  totalPnL: number;
  dailyReturn: number;
  totalReturn: number;
  sharpeRatio: number;
  beta: number;
  alpha: number;
  volatility: number;
  drawdown: number;
  maxDrawdown: number;
  valueAtRisk: number;
  expectedShortfall: number;
  diversificationScore: number;
  sectorExposure: Map<string, number>;
  riskContribution: Map<string, number>;
  correlationMatrix: number[][];
  optimalWeights: Map<string, number>;
}

interface RiskMetrics {
  volatility: number;
  var95: number;
  var99: number;
  expectedShortfall: number;
  beta: number;
  correlations: Map<string, number>;
  downside_risk: number;
  stress_test_results: Map<string, number>;
}

interface PortfolioOptimizationResult {
  weights: Map<string, number>;
  expectedReturn: number;
  expectedRisk: number;
  sharpeRatio: number;
  diversificationRatio: number;
}

class PortfolioAnalysisService {
  private readonly RISK_FREE_RATE = 0.04; // 4% annual risk-free rate
  private readonly CONFIDENCE_LEVEL = 0.95;
  private readonly LOOKBACK_PERIOD = 252; // One trading year

  async analyzePortfolio(positions: Position[], historicalData: Map<string, CandleData[]>): Promise<PortfolioStats> {
    const returns = this.calculateReturns(positions, historicalData);
    const riskMetrics = this.calculateRiskMetrics(returns);
    const optimization = await this.optimizePortfolio(positions, historicalData);

    const stats: PortfolioStats = {
      totalValue: this.calculateTotalValue(positions),
      dailyPnL: this.calculateDailyPnL(positions),
      totalPnL: this.calculateTotalPnL(positions),
      dailyReturn: this.calculateDailyReturn(positions),
      totalReturn: this.calculateTotalReturn(positions),
      sharpeRatio: this.calculateSharpeRatio(returns),
      beta: riskMetrics.beta,
      alpha: this.calculateAlpha(returns, riskMetrics.beta),
      volatility: riskMetrics.volatility,
      drawdown: this.calculateCurrentDrawdown(returns),
      maxDrawdown: this.calculateMaxDrawdown(returns),
      valueAtRisk: riskMetrics.var95,
      expectedShortfall: riskMetrics.expectedShortfall,
      diversificationScore: this.calculateDiversificationScore(positions),
      sectorExposure: this.calculateSectorExposure(positions),
      riskContribution: this.calculateRiskContribution(positions, riskMetrics),
      correlationMatrix: this.calculateCorrelationMatrix(historicalData),
      optimalWeights: optimization.weights
    };

    return stats;
  }

  private calculateReturns(positions: Position[], historicalData: Map<string, CandleData[]>): number[] {
    const portfolioValues: number[] = [];
    const dates = new Set<number>();

    // Collect all unique dates
    for (const [symbol, candles] of historicalData.entries()) {
      candles.forEach(candle => dates.add(candle.timestamp));
    }

    // Sort dates chronologically
    const sortedDates = Array.from(dates).sort();

    // Calculate portfolio value for each date
    sortedDates.forEach(date => {
      let value = 0;
      positions.forEach(position => {
        const candles = historicalData.get(position.symbol);
        const candle = candles?.find(c => c.timestamp === date);
        if (candle) {
          value += position.quantity * candle.close;
        }
      });
      portfolioValues.push(value);
    });

    // Calculate returns
    const returns: number[] = [];
    for (let i = 1; i < portfolioValues.length; i++) {
      returns.push((portfolioValues[i] - portfolioValues[i - 1]) / portfolioValues[i - 1]);
    }

    return returns;
  }

  private calculateRiskMetrics(returns: number[]): RiskMetrics {
    const volatility = this.calculateVolatility(returns);
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const var95Index = Math.floor(returns.length * 0.05);
    const var99Index = Math.floor(returns.length * 0.01);

    const metrics: RiskMetrics = {
      volatility,
      var95: sortedReturns[var95Index],
      var99: sortedReturns[var99Index],
      expectedShortfall: this.calculateExpectedShortfall(sortedReturns, var95Index),
      beta: this.calculateBeta(returns),
      correlations: this.calculateCorrelations(returns),
      downside_risk: this.calculateDownsideRisk(returns),
      stress_test_results: this.runStressTests(returns)
    };

    return metrics;
  }

  private calculateVolatility(returns: number[]): number {
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (returns.length - 1);
    return Math.sqrt(variance * 252); // Annualized volatility
  }

  private calculateExpectedShortfall(sortedReturns: number[], varIndex: number): number {
    const varsample = sortedReturns.slice(0, varIndex);
    return varsample.reduce((a, b) => a + b, 0) / varIndex;
  }

  private calculateBeta(returns: number[]): number {
    // Implement beta calculation against market index
    return 1.0; // Placeholder
  }

  private calculateCorrelations(returns: number[]): Map<string, number> {
    // Implement correlation calculations
    return new Map();
  }

  private calculateDownsideRisk(returns: number[]): number {
    const negativeReturns = returns.filter(r => r < 0);
    return this.calculateVolatility(negativeReturns);
  }

  private runStressTests(returns: number[]): Map<string, number> {
    const scenarios = new Map<string, number>();

    // Market Crash Scenario (-20% market decline)
    scenarios.set('market_crash', this.simulateScenario(returns, -0.20));

    // High Volatility Scenario (double current volatility)
    scenarios.set('high_volatility', this.simulateScenario(returns, 0, 2));

    // Interest Rate Hike Scenario
    scenarios.set('rate_hike', this.simulateScenario(returns, -0.05));

    return scenarios;
  }

  private simulateScenario(returns: number[], shockSize: number, volatilityMultiplier: number = 1): number {
    const adjustedReturns = returns.map(r => (r + shockSize) * volatilityMultiplier);
    return this.calculateVolatility(adjustedReturns);
  }

  private async optimizePortfolio(positions: Position[], historicalData: Map<string, CandleData[]>): Promise<PortfolioOptimizationResult> {
    // Implement portfolio optimization using Modern Portfolio Theory
    const returns = this.calculateReturns(positions, historicalData);
    const riskMetrics = this.calculateRiskMetrics(returns);

    // Calculate optimal weights using quadratic programming
    const weights = new Map<string, number>();
    positions.forEach(position => {
      weights.set(position.symbol, 1 / positions.length); // Equal weight as starting point
    });

    return {
      weights,
      expectedReturn: this.calculateExpectedReturn(positions, weights),
      expectedRisk: riskMetrics.volatility,
      sharpeRatio: this.calculateSharpeRatio(returns),
      diversificationRatio: this.calculateDiversificationRatio(positions, weights)
    };
  }

  private calculateExpectedReturn(positions: Position[], weights: Map<string, number>): number {
    let expectedReturn = 0;
    positions.forEach(position => {
      const weight = weights.get(position.symbol) || 0;
      const returnRate = (position.currentPrice - position.averagePrice) / position.averagePrice;
      expectedReturn += weight * returnRate;
    });
    return expectedReturn;
  }

  private calculateSharpeRatio(returns: number[]): number {
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const excessReturn = meanReturn - this.RISK_FREE_RATE / 252; // Daily excess return
    const volatility = this.calculateVolatility(returns);
    return Math.sqrt(252) * excessReturn / volatility; // Annualized Sharpe ratio
  }

  private calculateAlpha(returns: number[], beta: number): number {
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const marketReturn = 0.10; // Placeholder for market return
    return meanReturn - (this.RISK_FREE_RATE + beta * (marketReturn - this.RISK_FREE_RATE));
  }

  private calculateCurrentDrawdown(returns: number[]): number {
    let peak = -Infinity;
    let value = 1;
    
    for (const return_ of returns) {
      value *= (1 + return_);
      peak = Math.max(peak, value);
      if (value < peak) {
        return (value - peak) / peak;
      }
    }
    
    return 0;
  }

  private calculateMaxDrawdown(returns: number[]): number {
    let peak = -Infinity;
    let maxDrawdown = 0;
    let value = 1;
    
    for (const return_ of returns) {
      value *= (1 + return_);
      peak = Math.max(peak, value);
      const drawdown = (value - peak) / peak;
      maxDrawdown = Math.min(maxDrawdown, drawdown);
    }
    
    return maxDrawdown;
  }

  private calculateDiversificationScore(positions: Position[]): number {
    // Implement diversification score calculation
    return 0.75; // Placeholder
  }

  private calculateSectorExposure(positions: Position[]): Map<string, number> {
    // Implement sector exposure calculation
    return new Map();
  }

  private calculateRiskContribution(positions: Position[], riskMetrics: RiskMetrics): Map<string, number> {
    // Implement risk contribution calculation
    return new Map();
  }

  private calculateCorrelationMatrix(historicalData: Map<string, CandleData[]>): number[][] {
    // Implement correlation matrix calculation
    return [[]];
  }

  private calculateDiversificationRatio(positions: Position[], weights: Map<string, number>): number {
    // Implement diversification ratio calculation
    return 0.8; // Placeholder
  }

  private calculateTotalValue(positions: Position[]): number {
    return positions.reduce((total, pos) => total + pos.quantity * pos.currentPrice, 0);
  }

  private calculateDailyPnL(positions: Position[]): number {
    // Implement daily P&L calculation
    return 0; // Placeholder
  }

  private calculateTotalPnL(positions: Position[]): number {
    return positions.reduce((total, pos) => 
      total + (pos.currentPrice - pos.averagePrice) * pos.quantity, 0);
  }

  private calculateDailyReturn(positions: Position[]): number {
    // Implement daily return calculation
    return 0; // Placeholder
  }

  private calculateTotalReturn(positions: Position[]): number {
    const totalCost = positions.reduce((total, pos) => 
      total + pos.averagePrice * pos.quantity, 0);
    const currentValue = this.calculateTotalValue(positions);
    return (currentValue - totalCost) / totalCost;
  }
}

export const portfolioAnalysisService = new PortfolioAnalysisService(); 