import { BehaviorSubject } from 'rxjs';
import { CandleData } from './marketApi';
import { technicalAnalysisService } from './technicalAnalysis';

export interface ChartOptions {
  theme: 'light' | 'dark';
  timeframe: Timeframe;
  chartType: ChartType;
  indicators: Indicator[];
  overlays: Overlay[];
  annotations: Annotation[];
  grid: GridOptions;
  crosshair: CrosshairOptions;
  tooltip: TooltipOptions;
  volume: VolumeOptions;
  priceScale: PriceScaleOptions;
  timeScale: TimeScaleOptions;
}

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

export type ChartType = 'candlestick' | 'line' | 'area' | 'bar' | 'heikinashi' | 'renko';

export interface Indicator {
  id: string;
  type: IndicatorType;
  params: Record<string, any>;
  visible: boolean;
  color: string;
  lineWidth: number;
  opacity: number;
}

export type IndicatorType =
  | 'sma'
  | 'ema'
  | 'wma'
  | 'rsi'
  | 'macd'
  | 'bollinger'
  | 'atr'
  | 'stochastic'
  | 'ichimoku'
  | 'volume';

export interface Overlay {
  id: string;
  type: OverlayType;
  data: any[];
  visible: boolean;
  style: OverlayStyle;
}

export type OverlayType =
  | 'trendline'
  | 'fibonacci'
  | 'pitchfork'
  | 'rectangle'
  | 'ellipse'
  | 'text'
  | 'horizontalLine'
  | 'verticalLine';

export interface OverlayStyle {
  color: string;
  lineWidth: number;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  fillColor?: string;
  fillOpacity?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
}

export interface Annotation {
  id: string;
  type: 'text' | 'label' | 'marker';
  position: {
    time: number;
    price: number;
  };
  content: string;
  style: AnnotationStyle;
}

export interface AnnotationStyle {
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  padding: number;
  borderRadius: number;
  borderColor?: string;
  borderWidth?: number;
}

export interface GridOptions {
  visible: boolean;
  color: string;
  opacity: number;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface CrosshairOptions {
  visible: boolean;
  color: string;
  width: number;
  style: 'solid' | 'dashed';
  labelBackgroundColor: string;
  labelTextColor: string;
}

export interface TooltipOptions {
  visible: boolean;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  padding: number;
  borderRadius: number;
}

export interface VolumeOptions {
  visible: boolean;
  height: number;
  upColor: string;
  downColor: string;
  opacity: number;
}

export interface PriceScaleOptions {
  position: 'left' | 'right';
  mode: 'normal' | 'logarithmic' | 'percentage';
  autoScale: boolean;
  invertScale: boolean;
  alignLabels: boolean;
  scaleMargins: {
    top: number;
    bottom: number;
  };
}

export interface TimeScaleOptions {
  visible: boolean;
  timeVisible: boolean;
  secondsVisible: boolean;
  borderColor: string;
  rightOffset: number;
  barSpacing: number;
  minBarSpacing: number;
}

export interface ChartData {
  symbol: string;
  timeframe: Timeframe;
  candles: CandleData[];
  indicators: Map<string, number[]>;
  overlays: Overlay[];
  annotations: Annotation[];
}

interface ChartState {
  data: Map<string, ChartData>;
  activeSymbol: string | null;
  options: ChartOptions;
  loading: boolean;
  error: string | null;
}

class ChartService {
  private state = new BehaviorSubject<ChartState>({
    data: new Map(),
    activeSymbol: null,
    options: this.getDefaultOptions(),
    loading: false,
    error: null
  });

  private subscriptions: Map<string, any> = new Map();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme() {
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)');
    this.updateTheme(darkMode.matches ? 'dark' : 'light');
    darkMode.addEventListener('change', e => this.updateTheme(e.matches ? 'dark' : 'light'));
  }

  private updateTheme(theme: 'light' | 'dark') {
    const currentOptions = this.state.value.options;
    this.updateOptions({
      ...currentOptions,
      theme,
      grid: {
        ...currentOptions.grid,
        color: theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
      },
      crosshair: {
        ...currentOptions.crosshair,
        color: theme === 'dark' ? '#666666' : '#999999',
        labelBackgroundColor: theme === 'dark' ? '#000000' : '#ffffff'
      },
      tooltip: {
        ...currentOptions.tooltip,
        backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
        textColor: theme === 'dark' ? '#ffffff' : '#000000'
      }
    });
  }

  private getDefaultOptions(): ChartOptions {
    return {
      theme: 'light',
      timeframe: '1d',
      chartType: 'candlestick',
      indicators: [],
      overlays: [],
      annotations: [],
      grid: {
        visible: true,
        color: '#e0e0e0',
        opacity: 0.1,
        style: 'solid'
      },
      crosshair: {
        visible: true,
        color: '#999999',
        width: 1,
        style: 'dashed',
        labelBackgroundColor: '#ffffff',
        labelTextColor: '#333333'
      },
      tooltip: {
        visible: true,
        backgroundColor: '#ffffff',
        textColor: '#333333',
        fontSize: 12,
        fontFamily: 'system-ui',
        padding: 8,
        borderRadius: 4
      },
      volume: {
        visible: true,
        height: 0.2,
        upColor: '#26a69a',
        downColor: '#ef5350',
        opacity: 0.8
      },
      priceScale: {
        position: 'right',
        mode: 'normal',
        autoScale: true,
        invertScale: false,
        alignLabels: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.2
        }
      },
      timeScale: {
        visible: true,
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#2B2B43',
        rightOffset: 12,
        barSpacing: 6,
        minBarSpacing: 0.5
      }
    };
  }

  // Public API
  async loadChartData(symbol: string, timeframe: Timeframe): Promise<void> {
    try {
      this.setLoading(true);
      this.setError(null);

      // Fetch historical data
      const candles = await this.fetchHistoricalData(symbol, timeframe);
      
      // Calculate indicators
      const indicators = await this.calculateIndicators(candles);

      // Update chart data
      const chartData: ChartData = {
        symbol,
        timeframe,
        candles,
        indicators,
        overlays: [],
        annotations: []
      };

      const currentData = this.state.value.data;
      currentData.set(symbol, chartData);

      this.setState({
        data: currentData,
        activeSymbol: symbol
      });
    } catch (error) {
      console.error('Error loading chart data:', error);
      this.setError('Failed to load chart data');
    } finally {
      this.setLoading(false);
    }
  }

  private async fetchHistoricalData(symbol: string, timeframe: Timeframe): Promise<CandleData[]> {
    // This should be implemented to fetch data from your market data service
    return [];
  }

  private async calculateIndicators(candles: CandleData[]): Promise<Map<string, number[]>> {
    const indicators = new Map<string, number[]>();
    const analysis = await technicalAnalysisService.analyzeSymbol(candles);

    // Store calculated indicators
    indicators.set('sma', analysis.sma);
    indicators.set('ema', analysis.ema);
    indicators.set('rsi', analysis.rsi);
    indicators.set('macd_line', analysis.macd.macdLine);
    indicators.set('macd_signal', analysis.macd.signalLine);
    indicators.set('macd_histogram', analysis.macd.histogram);
    indicators.set('bollinger_upper', analysis.bollinger.upper);
    indicators.set('bollinger_middle', analysis.bollinger.middle);
    indicators.set('bollinger_lower', analysis.bollinger.lower);

    return indicators;
  }

  addIndicator(indicator: Indicator): void {
    const currentOptions = this.state.value.options;
    this.updateOptions({
      ...currentOptions,
      indicators: [...currentOptions.indicators, indicator]
    });
  }

  removeIndicator(indicatorId: string): void {
    const currentOptions = this.state.value.options;
    this.updateOptions({
      ...currentOptions,
      indicators: currentOptions.indicators.filter(i => i.id !== indicatorId)
    });
  }

  addOverlay(overlay: Overlay): void {
    const currentOptions = this.state.value.options;
    this.updateOptions({
      ...currentOptions,
      overlays: [...currentOptions.overlays, overlay]
    });
  }

  removeOverlay(overlayId: string): void {
    const currentOptions = this.state.value.options;
    this.updateOptions({
      ...currentOptions,
      overlays: currentOptions.overlays.filter(o => o.id !== overlayId)
    });
  }

  addAnnotation(annotation: Annotation): void {
    const currentOptions = this.state.value.options;
    this.updateOptions({
      ...currentOptions,
      annotations: [...currentOptions.annotations, annotation]
    });
  }

  removeAnnotation(annotationId: string): void {
    const currentOptions = this.state.value.options;
    this.updateOptions({
      ...currentOptions,
      annotations: currentOptions.annotations.filter(a => a.id !== annotationId)
    });
  }

  updateOptions(options: Partial<ChartOptions>): void {
    this.setState({
      options: {
        ...this.state.value.options,
        ...options
      }
    });
  }

  // State management
  private setState(partialState: Partial<ChartState>) {
    this.state.next({
      ...this.state.value,
      ...partialState
    });
  }

  private setLoading(loading: boolean) {
    this.setState({ loading });
  }

  private setError(error: string | null) {
    this.setState({ error });
  }

  getState() {
    return this.state.asObservable();
  }

  // Cleanup
  destroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions.clear();
  }
}

export const chartService = new ChartService(); 