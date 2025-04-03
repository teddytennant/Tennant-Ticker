import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { PageHeader } from '../components/PageHeader';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';
import { Sparkles, TrendingUp, ShieldAlert, PieChart as PieChartIcon, Info, ArrowRight } from 'lucide-react'; // Import more icons
import { SimpleErrorBoundary } from '@/components/ui/error-boundary'; // Use path alias
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Use path alias
import { Button } from '@/components/ui/button'; // Import Button

// Define types
type RiskTolerance = 'low' | 'medium' | 'high';
type InvestmentHorizon = 'short' | 'medium' | 'long';
type MarketCap = 'small' | 'medium' | 'large';

interface StockRecommendation {
  ticker: string;
  analysis: string;
  potentialUpside?: string;
  riskLevel?: string;
  sector?: string;
  marketCap?: string;
  allocation?: string;
}

interface EtfRecommendation {
  name: string;
  ticker: string;
  allocation: string;
}

interface RecommendationData {
  stocks: StockRecommendation[];
  etfs: EtfRecommendation[];
  rawText: string; // Keep raw text as fallback
  introText: string; // The introductory sentence
}

// Hardcoded recommendation data to ensure stability
const RECOMMENDATION_DATA = {
  low: {
    short: `Based on your conservative risk profile with a short investment horizon, here are some recommendations:

Stock Recommendation 1

Ticker: PG

Analysis: Procter & Gamble is a consumer staples giant with strong brand portfolio and consistent cash flow. Their household products provide stability during economic uncertainty, and their 3.5% dividend yield offers income potential.

- Potential Upside: 8-10%
- Risk Level: Low
- Sector: Consumer Staples
- Market Cap: Large
- Allocation: 15%

Stock Recommendation 2

Ticker: VZ

Analysis: Verizon Communications offers telecom infrastructure stability with a strong 6.8% dividend yield. The company's infrastructure investments in 5G position it as a reliable income generator with modest growth potential.

- Potential Upside: 7-9%
- Risk Level: Low
- Sector: Communication Services
- Market Cap: Large
- Allocation: 12%

Stock Recommendation 3

Ticker: KO

Analysis: Coca-Cola remains a defensive consumer staples play with strong global brand recognition and distribution. Their 3.1% dividend yield and pricing power make them resilient during economic downturns.

- Potential Upside: 6-8%
- Risk Level: Low
- Sector: Consumer Staples
- Market Cap: Large
- Allocation: 10%

Specific ETF Recommendations:
- SPDR Portfolio S&P 500 High Dividend ETF (SPYD): 15%
- Vanguard Short-Term Corporate Bond ETF (VCSH): 20%
- iShares Core U.S. Aggregate Bond ETF (AGG): 15%
- Vanguard Dividend Appreciation ETF (VIG): 10%`,

    medium: `Based on your conservative risk profile with a medium investment horizon, here are some recommendations:

Stock Recommendation 1

Ticker: MSFT

Analysis: Microsoft offers a stable growth profile with diverse revenue streams across cloud (Azure), software (Office 365), and enterprise services. Their 33% cloud revenue growth and 1% dividend yield provide a balance of growth and stability.

- Potential Upside: 12-15%
- Risk Level: Low
- Sector: Technology
- Market Cap: Large
- Allocation: 15%

Stock Recommendation 2

Ticker: JNJ

Analysis: Johnson & Johnson's diverse healthcare business spans pharmaceuticals, medical devices, and consumer health. Their 3.2% dividend has increased for 61 consecutive years, making them an exceptional dividend aristocrat.

- Potential Upside: 10-12%
- Risk Level: Low
- Sector: Healthcare
- Market Cap: Large
- Allocation: 12%

Stock Recommendation 3

Ticker: HD

Analysis: Home Depot benefits from the strong housing market and renovation trends. Their 2.5% dividend yield, dominant market position, and e-commerce growth make them a stable retail investment with moderate growth potential.

- Potential Upside: 11-13%
- Risk Level: Low-Medium
- Sector: Consumer Discretionary
- Market Cap: Large
- Allocation: 10%

Specific ETF Recommendations:
- Vanguard Dividend Appreciation ETF (VIG): 15%
- iShares Core S&P 500 ETF (IVV): 20%
- Schwab U.S. Dividend Equity ETF (SCHD): 15%
- Vanguard Total Bond Market ETF (BND): 10%`,

    long: `Based on your conservative risk profile with a long investment horizon, here are some recommendations:

Stock Recommendation 1

Ticker: BRK.B

Analysis: Berkshire Hathaway's diverse business holdings and Warren Buffett's value investing approach provide stability and consistent returns over time. Their significant cash reserves enable them to capitalize on market opportunities.

- Potential Upside: 15-20%
- Risk Level: Low
- Sector: Diversified
- Market Cap: Large
- Allocation: 15%

Stock Recommendation 2

Ticker: COST

Analysis: Costco's membership model provides recurring revenue and customer loyalty. Their 0.8% dividend yield, consistent same-store sales growth, and e-commerce expansion create a reliable long-term investment with steady growth.

- Potential Upside: 12-16%
- Risk Level: Low
- Sector: Consumer Staples
- Market Cap: Large
- Allocation: 12%

Stock Recommendation 3

Ticker: UNH

Analysis: UnitedHealth Group combines health insurance with healthcare technology and services through Optum. Their 1.5% dividend yield and dominant market position in a growing healthcare sector offers long-term growth potential.

- Potential Upside: 14-18%
- Risk Level: Low-Medium
- Sector: Healthcare
- Market Cap: Large
- Allocation: 10%

Specific ETF Recommendations:
- Vanguard S&P 500 ETF (VOO): 25%
- iShares Core Dividend Growth ETF (DGRO): 15% 
- Vanguard Real Estate ETF (VNQ): 10%
- Vanguard Total Stock Market ETF (VTI): 15%`
  },
  medium: {
    short: `Based on your moderate risk profile with a short investment horizon, here are some recommendations:

Stock Recommendation 1

Ticker: AAPL

Analysis: Apple combines significant cash reserves with consistent product innovation and services growth. Their ecosystem strategy and share repurchase program provide stability, while their 0.5% dividend yield offers modest income.

- Potential Upside: 12-15%
- Risk Level: Medium
- Sector: Technology
- Market Cap: Large
- Allocation: 12%

Stock Recommendation 2

Ticker: ABBV

Analysis: AbbVie pharmaceutical's strong drug pipeline and 4.2% dividend yield offer a balance of income and growth potential. Their immunology and oncology portfolios provide stability in healthcare markets.

- Potential Upside: 10-13%
- Risk Level: Medium
- Sector: Healthcare
- Market Cap: Large
- Allocation: 10%

Stock Recommendation 3

Ticker: WM

Analysis: Waste Management's essential services create recession resistance with growth opportunities in recycling and sustainable waste solutions. Their 1.6% dividend yield and consistent cash flow make them a reliable infrastructure play.

- Potential Upside: 9-12%
- Risk Level: Medium-Low
- Sector: Industrials
- Market Cap: Large
- Allocation: 8%

Specific ETF Recommendations:
- iShares Core S&P Mid-Cap ETF (IJH): 15%
- Vanguard Growth ETF (VUG): 15%
- Invesco S&P 500 Equal Weight ETF (RSP): 10%
- First Trust Cloud Computing ETF (SKYY): 8%`,

    medium: `Based on your moderate risk profile with a medium investment horizon, here are some recommendations:

Stock Recommendation 1

Ticker: GOOGL

Analysis: Alphabet's dominant position in search, digital advertising, and emerging AI capabilities provides multiple growth avenues. Their significant cash reserves, YouTube growth, and cloud business expansion present strong medium-term potential.

- Potential Upside: 18-22%
- Risk Level: Medium
- Sector: Technology
- Market Cap: Large
- Allocation: 12%

Stock Recommendation 2

Ticker: V

Analysis: Visa's position in global payment processing benefits from the continued shift to digital payments. Their high margins, network effect advantages, and fintech partnerships create consistent growth opportunities.

- Potential Upside: 15-20%
- Risk Level: Medium
- Sector: Financial Services
- Market Cap: Large
- Allocation: 10%

Stock Recommendation 3

Ticker: ADBE

Analysis: Adobe's creative software dominance and subscription-based model generate reliable recurring revenue. Their expansion into digital experience platforms and document services provides multiple growth avenues.

- Potential Upside: 16-21%
- Risk Level: Medium
- Sector: Technology
- Market Cap: Large
- Allocation: 8%

Specific ETF Recommendations:
- iShares U.S. Technology ETF (IYW): 15%
- Vanguard Information Technology ETF (VGT): 12%
- Schwab U.S. Large-Cap Growth ETF (SCHG): 10%
- Global X Autonomous & Electric Vehicles ETF (DRIV): 6%`,

    long: `Based on your moderate risk profile with a long investment horizon, here are some recommendations:

Stock Recommendation 1

Ticker: AMZN

Analysis: Amazon's diverse business spanning e-commerce, cloud services (AWS), digital advertising, and emerging healthcare initiatives provides multiple growth vectors. Their infrastructure investments and logistics network create significant competitive advantages.

- Potential Upside: 20-25%
- Risk Level: Medium
- Sector: Technology/Consumer
- Market Cap: Large
- Allocation: 13%

Stock Recommendation 2

Ticker: MA

Analysis: Mastercard's global payments network benefits from ongoing digitalization of finance. Their expansion into open banking, account-to-account payments, and blockchain infrastructure creates substantial long-term growth potential.

- Potential Upside: 18-23%
- Risk Level: Medium
- Sector: Financial Services
- Market Cap: Large
- Allocation: 10%

Stock Recommendation 3

Ticker: ISRG

Analysis: Intuitive Surgical's robotic surgery platforms enjoy high switching costs and recurring revenue from instruments and accessories. Their expanding procedure types and international growth provide long-term potential in healthcare automation.

- Potential Upside: 22-28%
- Risk Level: Medium
- Sector: Healthcare
- Market Cap: Large
- Allocation: 8%

Specific ETF Recommendations:
- ARK Innovation ETF (ARKK): 10%
- iShares Exponential Technologies ETF (XT): 12%
- Global X Robotics & Artificial Intelligence ETF (BOTZ): 8%
- Invesco QQQ Trust (QQQ): 15%`
  },
  high: {
    short: `Based on your aggressive risk profile with a short investment horizon, here are some recommendations:

Stock Recommendation 1

Ticker: NVDA

Analysis: NVIDIA leads in GPU technology crucial for AI, gaming, and data centers. The company's innovation in AI and compute acceleration positions it for substantial growth as these technologies expand.

- Potential Upside: 25%
- Risk Level: High
- Sector: Technology
- Market Cap: Large
- Allocation: 12%

Stock Recommendation 2

Ticker: TSLA

Analysis: Tesla is pioneering electric vehicles and renewable energy solutions. The company's technology leadership, manufacturing scale, and brand strength support its disruptive potential.

- Potential Upside: 30%
- Risk Level: High
- Sector: Consumer
- Market Cap: Large
- Allocation: 10%

Stock Recommendation 3

Ticker: AMD

Analysis: Advanced Micro Devices continues gaining market share in high-performance computing with innovative CPU and GPU architectures. Their data center growth and design wins create substantial upside potential.

- Potential Upside: 28%
- Risk Level: High
- Sector: Technology
- Market Cap: Large
- Allocation: 8%

Alternative Strategies: Consider using options strategies to manage volatility while maintaining exposure.

Specific ETF Recommendations:
- Direxion Daily Semiconductor Bull 3X Shares (SOXL): 8% (leveraged ETF)
- ProShares Ultra Technology (ROM): 10% (leveraged ETF)
- VanEck Semiconductor ETF (SMH): 15%
- First Trust NASDAQ Cybersecurity ETF (CIBR): 12%`,

    medium: `Based on your aggressive risk profile with a medium investment horizon, here are some recommendations:

Stock Recommendation 1

Ticker: CRSP

Analysis: CRISPR Therapeutics is advancing gene-editing therapies with transformative potential across multiple diseases. Their hemoglobinopathy treatments and CAR-T cell therapy pipeline offer significant upside potential.

- Potential Upside: 45-60%
- Risk Level: High
- Sector: Biotechnology
- Market Cap: Mid
- Allocation: 8%

Stock Recommendation 2

Ticker: ENPH

Analysis: Enphase Energy's microinverter technology and energy storage solutions are transforming residential solar. Their software ecosystem and international expansion create substantial growth potential in renewable energy.

- Potential Upside: 35-45%
- Risk Level: High
- Sector: Energy/Technology
- Market Cap: Mid
- Allocation: 8%

Stock Recommendation 3

Ticker: NET

Analysis: Cloudflare's integrated edge computing platform provides security, performance and developer services. Their zero-trust security approach and serverless computing offerings enable substantial recurring revenue growth.

- Potential Upside: 40-50%
- Risk Level: High
- Sector: Technology
- Market Cap: Mid
- Allocation: 7%

Specific ETF Recommendations:
- ARK Genomic Revolution ETF (ARKG): 12%
- Global X Lithium & Battery Tech ETF (LIT): 10%
- Invesco Solar ETF (TAN): 10%
- KraneShares Electric Vehicles & Future Mobility ETF (KARS): 8%`,

    long: `Based on your aggressive risk profile with a long investment horizon, here are some recommendations:

Stock Recommendation 1

Ticker: SHOP

Analysis: Shopify is transforming e-commerce with its platform for businesses of all sizes. Their expanding ecosystem, international growth, and fulfillment network investments create substantial long-term potential in digital commerce.

- Potential Upside: 50-70%
- Risk Level: High
- Sector: Technology
- Market Cap: Mid-Large
- Allocation: 9%

Stock Recommendation 2

Ticker: PLTR

Analysis: Palantir Technologies provides data analytics platforms for government and commercial applications. Their AI integration capabilities, expanding commercial customer base, and sticky contracts offer significant growth potential.

- Potential Upside: 45-65%
- Risk Level: High
- Sector: Software
- Market Cap: Mid
- Allocation: 8%

Stock Recommendation 3

Ticker: DNA

Analysis: Ginkgo Bioworks is pioneering synthetic biology with applications across pharmaceuticals, agriculture, and materials. Their cell programming platform and growing partnerships with major companies create substantial upside potential.

- Potential Upside: 60-80%
- Risk Level: Very High
- Sector: Biotechnology
- Market Cap: Small-Mid
- Allocation: 6%

Specific ETF Recommendations:
- ARK Space Exploration & Innovation ETF (ARKX): 10%
- Global X Blockchain ETF (BKCH): 8%
- Defiance Quantum ETF (QTUM): 8% 
- SPDR S&P Kensho New Economies Composite ETF (KOMP): 12%

Suggested Portfolio Allocation:
- Disruptive Technology Stocks: 35-45%
- Emerging Biotech/Healthcare: 15-20%
- Clean Energy/EV Ecosystem: 15-20%
- Space/Quantum Computing: 10-15%
- Small allocation to digital assets via ETFs: 5-10%`
  }
};

// Helper function to parse recommendation text
const parseRecommendationText = (text: string): RecommendationData => {
  const lines = text.trim().split('\n').filter(line => line.trim() !== '');
  const stocks: StockRecommendation[] = [];
  const etfs: EtfRecommendation[] = [];
  let currentStock: Partial<StockRecommendation> | null = null;
  let readingEtfs = false;
  let introText = '';

  if (lines.length > 0 && lines[0].startsWith('Based on your')) {
    introText = lines.shift() || ''; // Take the first line as intro
  }

  lines.forEach(line => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('Stock Recommendation')) {
      if (currentStock && currentStock.ticker) stocks.push(currentStock as StockRecommendation);
      currentStock = { ticker: '', analysis: '' }; // Initialize with required fields
      readingEtfs = false;
    } else if (trimmedLine.startsWith('Specific ETF Recommendations:')) {
      if (currentStock && currentStock.ticker) stocks.push(currentStock as StockRecommendation);
      currentStock = null;
      readingEtfs = true;
    } else if (readingEtfs && trimmedLine.startsWith('- ')) {
       const etfMatch = trimmedLine.match(/- (.*?) \((.*?)\): (\d+%)/);
       if (etfMatch) {
         etfs.push({ name: etfMatch[1].trim(), ticker: etfMatch[2].trim(), allocation: etfMatch[3].trim() });
       } else {
         const simpleEtfMatch = trimmedLine.match(/- (.*?): (\d+%)/);
         if (simpleEtfMatch) {
            const nameParts = simpleEtfMatch[1].split('(');
            const name = nameParts[0].trim();
            const ticker = nameParts.length > 1 ? nameParts[1].replace(')', '').trim() : name;
            etfs.push({ name, ticker, allocation: simpleEtfMatch[2].trim() });
         }
       }
    } else if (currentStock) {
      if (trimmedLine.startsWith('Ticker:')) {
        currentStock.ticker = trimmedLine.substring('Ticker:'.length).trim();
      } else if (trimmedLine.startsWith('Analysis:')) {
        currentStock.analysis = trimmedLine.substring('Analysis:'.length).trim();
      } else if (trimmedLine.startsWith('- Potential Upside:')) {
        currentStock.potentialUpside = trimmedLine.substring('- Potential Upside:'.length).trim();
      } else if (trimmedLine.startsWith('- Risk Level:')) {
        currentStock.riskLevel = trimmedLine.substring('- Risk Level:'.length).trim();
      } else if (trimmedLine.startsWith('- Sector:')) {
        currentStock.sector = trimmedLine.substring('- Sector:'.length).trim();
      } else if (trimmedLine.startsWith('- Market Cap:')) {
        currentStock.marketCap = trimmedLine.substring('- Market Cap:'.length).trim();
      } else if (trimmedLine.startsWith('- Allocation:')) {
        currentStock.allocation = trimmedLine.substring('- Allocation:'.length).trim();
      } else if (currentStock.analysis && !trimmedLine.startsWith('- ') && !trimmedLine.startsWith('Ticker:')) {
        currentStock.analysis += ' ' + trimmedLine;
      }
    }
  });

  if (currentStock && currentStock.ticker) {
      stocks.push(currentStock as StockRecommendation);
  }

  if (stocks.length === 0 && etfs.length === 0 && introText === '') {
    console.warn("Parsing failed, returning raw text");
    return { stocks: [], etfs: [], rawText: text, introText: '' };
  }

  return { stocks, etfs, rawText: '', introText };
};


// Create a safe version of the component that handles errors
const SafeRecommendationsPage: React.FC = () => {
  try {
    const { settings, updateStockRecommendationPreferences } = useSettings();
    
    // State management
    const [selectedRiskTolerance, setSelectedRiskTolerance] = useState<RiskTolerance | null>(
      settings?.stockRecommendations?.riskTolerance || null
    );
    const [selectedHorizon, setSelectedHorizon] = useState<InvestmentHorizon | null>(
      settings?.stockRecommendations?.investmentHorizon || null
    );
    const [selectedMarketCaps, setSelectedMarketCaps] = useState<MarketCap[]>(
      settings?.stockRecommendations?.marketCaps || []
    );
    const [selectedSectors, setSelectedSectors] = useState<string[]>(
      settings?.stockRecommendations?.sectors || []
    );
    const [showRecommendations, setShowRecommendations] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [parsedRecommendations, setParsedRecommendations] = useState<RecommendationData | null>(null); // State for parsed data

    // Function to fetch and parse recommendations
    const fetchAndParseRecommendations = useCallback((risk: RiskTolerance, horizon: InvestmentHorizon) => {
      setLoading(true);
      setError(null);
      setParsedRecommendations(null); // Clear previous recommendations

      // Simulate API call delay
      setTimeout(() => {
        try {
          let recommendationText = RECOMMENDATION_DATA.medium.medium; // Default fallback
          if (RECOMMENDATION_DATA[risk] && RECOMMENDATION_DATA[risk][horizon]) {
            recommendationText = RECOMMENDATION_DATA[risk][horizon];
          } else {
            console.warn(`Recommendation data not found for ${risk}/${horizon}, using fallback.`);
          }
          
          const parsedData = parseRecommendationText(recommendationText);
          setParsedRecommendations(parsedData);
          setShowRecommendations(true);
        } catch (parseError) {
          console.error('Error parsing recommendation text:', parseError);
          setError('Failed to process recommendations. Please try again.');
          // Provide raw text as fallback if parsing fails but text exists
          setParsedRecommendations({ stocks: [], etfs: [], rawText: RECOMMENDATION_DATA[risk]?.[horizon] || '', introText: '' });
          setShowRecommendations(true);
        } finally {
          setLoading(false);
        }
      }, 500);
    }, []); // Empty dependency array as it uses constants and state setters

    // Effect to auto-show recommendations if user has preferences saved
    useEffect(() => {
      if (settings?.stockRecommendations?.riskTolerance &&
          settings?.stockRecommendations?.investmentHorizon) {
        // If preferences exist, fetch and parse recommendations immediately
        fetchAndParseRecommendations(
          settings.stockRecommendations.riskTolerance,
          settings.stockRecommendations.investmentHorizon
        );
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings, fetchAndParseRecommendations]); // Include fetchAndParseRecommendations
    
    // Options for selections
    const riskToleranceOptions: { value: RiskTolerance; label: string; description: string }[] = [
      { value: 'low', label: 'Conservative', description: 'Focus on stability and income with lower volatility' },
      { value: 'medium', label: 'Moderate', description: 'Balance between growth and stability' },
      { value: 'high', label: 'Aggressive', description: 'Focus on high growth potential with higher volatility' },
    ];

    const horizonOptions: { value: InvestmentHorizon; label: string; description: string }[] = [
      { value: 'short', label: 'Short-term', description: 'Less than 1 year' },
      { value: 'medium', label: 'Medium-term', description: '1-5 years' },
      { value: 'long', label: 'Long-term', description: 'More than 5 years' },
    ];

    const marketCapOptions: { value: MarketCap; label: string; description: string }[] = [
      { value: 'small', label: 'Small Cap', description: 'Companies with market cap under $2 billion' },
      { value: 'medium', label: 'Mid Cap', description: 'Companies with market cap between $2-10 billion' },
      { value: 'large', label: 'Large Cap', description: 'Companies with market cap over $10 billion' },
    ];

    const sectorOptions: { value: string; label: string }[] = [
      { value: 'Technology', label: 'Technology' },
      { value: 'Healthcare', label: 'Healthcare' },
      { value: 'Financial', label: 'Financial Services' },
      { value: 'Consumer', label: 'Consumer Goods' },
      { value: 'Energy', label: 'Energy' },
      { value: 'Industrial', label: 'Industrial' },
    ];

    // Handlers
    const handleRiskToleranceSelect = (riskTolerance: RiskTolerance) => {
      setSelectedRiskTolerance(riskTolerance);
      setError(null);
      setShowRecommendations(false); // Hide old recommendations
      setParsedRecommendations(null);
    };

    const handleHorizonSelect = (horizon: InvestmentHorizon) => {
      setSelectedHorizon(horizon);
      setError(null);
      setShowRecommendations(false); // Hide old recommendations
      setParsedRecommendations(null);
    };

    const toggleMarketCap = (marketCap: MarketCap) => {
      setSelectedMarketCaps(prev => 
        prev.includes(marketCap) 
          ? prev.filter(cap => cap !== marketCap) 
          : [...prev, marketCap]
      );
    };

    const toggleSector = (sector: string) => {
      setSelectedSectors(prev => 
        prev.includes(sector) 
          ? prev.filter(s => s !== sector) 
          : [...prev, sector]
      );
    };

    const handleGetRecommendations = () => {
      if (!selectedRiskTolerance || !selectedHorizon) {
        setError('Please select your risk tolerance and investment horizon.');
        return;
      }
      fetchAndParseRecommendations(selectedRiskTolerance, selectedHorizon);
    };

    const resetSelections = () => {
      setSelectedRiskTolerance(null);
      setSelectedHorizon(null);
      setSelectedMarketCaps([]);
      setSelectedSectors([]);
      setShowRecommendations(false);
      setParsedRecommendations(null);
      setError(null);
    };
    
    const savePreferences = () => {
      if (!selectedRiskTolerance || !selectedHorizon) {
        setError('Please select your risk tolerance and investment horizon before saving.');
        return;
      }
      
      try {
        updateStockRecommendationPreferences({
          riskTolerance: selectedRiskTolerance,
          investmentHorizon: selectedHorizon,
          marketCaps: selectedMarketCaps,
          sectors: selectedSectors
        });
        toast.success('Investment preferences saved');
      } catch (err) {
        console.error('Error saving preferences:', err);
        toast.error('Could not save preferences');
      }
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader 
          title="Stock Recommendations" 
          description="Get personalized stock recommendations based on your investment profile" 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Investment Profile Section */}
          <div className="lg:col-span-4">
            <Card> {/* Using Card component */}
              <CardHeader>
                <CardTitle>Your Investment Profile</CardTitle>
                <CardDescription>Select preferences for personalized recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Risk Tolerance Selection */}
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">
                    Risk Tolerance
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {riskToleranceOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleRiskToleranceSelect(option.value)}
                        className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          selectedRiskTolerance === option.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {selectedRiskTolerance && (
                    <p className="text-sm text-gray-400 mt-2">
                      {riskToleranceOptions.find(o => o.value === selectedRiskTolerance)?.description}
                    </p>
                  )}
                </div>
                
                {/* Investment Horizon Selection */}
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">
                    Investment Time Horizon
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {horizonOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleHorizonSelect(option.value)}
                        className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          selectedHorizon === option.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {selectedHorizon && (
                    <p className="text-sm text-gray-400 mt-2">
                      {horizonOptions.find(o => o.value === selectedHorizon)?.description}
                    </p>
                  )}
                </div>
                
                {/* Market Cap Preferences */}
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">
                    Market Cap Preferences (Optional)
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {marketCapOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => toggleMarketCap(option.value)}
                        className={`py-2 px-4 rounded-md text-sm font-medium text-left flex flex-col transition-colors ${
                          selectedMarketCaps.includes(option.value)
                            ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-transparent'
                        }`}
                      >
                        <span>{option.label}</span>
                        <span className="text-xs opacity-70 mt-1">{option.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Sector Preferences */}
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">
                    Sector Preferences (Optional)
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {sectorOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => toggleSector(option.value)}
                        className={`py-2 px-3 rounded-md text-sm font-medium text-left transition-colors ${
                          selectedSectors.includes(option.value)
                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-transparent'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Get Recommendations Button */}
                <button
                  onClick={handleGetRecommendations}
                  disabled={!selectedRiskTolerance || !selectedHorizon || loading}
                  className={`w-full py-2.5 px-4 rounded-md text-white font-medium flex items-center justify-center gap-2 ${
                    !selectedRiskTolerance || !selectedHorizon || loading
                      ? 'bg-gray-700 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 transition-colors'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : 'Get Recommendations'}
                </button>
                
                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button 
                    onClick={resetSelections}
                    className="px-3 py-1.5 bg-gray-700 text-gray-300 text-sm rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Reset
                  </button>
                  
                  <button
                    onClick={savePreferences}
                    disabled={!selectedRiskTolerance || !selectedHorizon}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      !selectedRiskTolerance || !selectedHorizon
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600/80 text-white hover:bg-blue-700'
                    }`}
                  >
                    Save Preferences
                  </button>
                </div>
                
                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-3 bg-red-900/30 border border-red-800/50 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Recommendations Section or Placeholder */}
          <div className="lg:col-span-8">
            {showRecommendations ? (
              // Display Recommendations or Loading state
              loading ? (
                <Card> {/* Loading Card */}
                  <CardHeader>
                    <CardTitle>Loading Recommendations...</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center h-64">
                     <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                  </CardContent>
                </Card>
              ) : parsedRecommendations ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Stock Recommendations</CardTitle>
                    <CardDescription>{parsedRecommendations.introText || 'Based on your investment profile'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Render Parsed Stocks */}
                    {parsedRecommendations.stocks.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Stock Picks</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Restore the mapping */}
                          {parsedRecommendations.stocks.map((stock, index) => {
                            // console.log('Rendering stock:', stock); 
                            const riskLevel = (stock as StockRecommendation).riskLevel?.toLowerCase();
                            let riskColor = 'text-gray-400'; // Default
                            if (riskLevel?.includes('low')) riskColor = 'text-green-400';
                            else if (riskLevel?.includes('medium')) riskColor = 'text-yellow-400';
                            else if (riskLevel?.includes('high') || riskLevel?.includes('very high')) riskColor = 'text-red-400'; // Include very high

                            return (
                              <Card key={index} className="bg-gradient-to-br from-gray-800/70 to-gray-900/60 border border-gray-700/60 hover:border-blue-600/70 transition-all duration-300 flex flex-col shadow-md hover:shadow-blue-900/30">
                                <CardHeader className="pb-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      {/* @ts-ignore */}
                                      {(stock as StockRecommendation).ticker && <CardTitle className="text-xl font-bold text-blue-300 tracking-wide">{(stock as StockRecommendation).ticker}</CardTitle>}
                                      {(stock as StockRecommendation).sector && <CardDescription className="text-xs pt-1 text-gray-400">{(stock as StockRecommendation).sector} - {(stock as StockRecommendation).marketCap}</CardDescription>}
                                    </div>
                                    {/* Risk Badge */}
                                    {(stock as StockRecommendation).riskLevel && 
                                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border ${riskColor.replace('text-', 'border-').replace('400', '500/40')} ${riskColor.replace('text-', 'bg-').replace('400', '900/30')}`}>
                                        <ShieldAlert className={`w-3 h-3 ${riskColor}`} />
                                        <span className={riskColor}>{(stock as StockRecommendation).riskLevel}</span>
                                      </div>
                                    }
                                  </div>
                                </CardHeader>
                                <CardContent className="text-sm space-y-4 flex-grow flex flex-col justify-between">
                                  <p className="text-gray-300 leading-relaxed mb-3">{(stock as StockRecommendation).analysis}</p>
                                  
                                  {/* Key Metrics */}
                                  <div className="space-y-2 text-xs border-t border-gray-700/50 pt-3">
                                    {(stock as StockRecommendation).potentialUpside && 
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium text-gray-400 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-green-400" /> Potential Upside:</span> 
                                        <span className="text-gray-200 font-medium">{(stock as StockRecommendation).potentialUpside}</span>
                                      </div>
                                    }
                                    {(stock as StockRecommendation).allocation && 
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium text-gray-400 flex items-center gap-1.5"><PieChartIcon className="w-3.5 h-3.5 text-purple-400" /> Allocation:</span> 
                                        <span className="text-gray-200 font-medium">{(stock as StockRecommendation).allocation}</span>
                                      </div>
                                    }
                                  </div>
                                  
                                  {/* View Details Button */}
                                  <div className="pt-3 mt-auto"> 
                                    <Link to={`/stock/${(stock as StockRecommendation).ticker}`}>
                                      <Button variant="outline" size="sm" className="w-full text-blue-300 border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-200 hover:border-blue-500/50">
                                        View Details <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                      </Button>
                                    </Link>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                          {/* Remove the temporary placeholder */}
                        </div>
                      </div>
                    )}

                    {/* Render Parsed ETFs */}
                    {parsedRecommendations.etfs.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4 mt-6 pt-6 border-t border-gray-700/50">ETF Recommendations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {parsedRecommendations.etfs.map((etf, index) => (
                            <Card key={index} className="bg-gradient-to-br from-gray-800/70 to-gray-900/60 border border-gray-700/60 hover:border-purple-600/70 transition-all duration-300 flex flex-col shadow-md hover:shadow-purple-900/30">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-semibold text-purple-300">{etf.name} ({etf.ticker})</CardTitle>
                              </CardHeader>
                              <CardContent className="text-sm flex-grow flex items-center">
                                <div className="flex items-center gap-1.5">
                                  <PieChartIcon className="w-4 h-4 text-purple-400" />
                                  <span className="font-medium text-gray-400">Allocation:</span> 
                                  <span className="text-gray-200 font-semibold">{etf.allocation}</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Fallback for Raw Text if parsing failed */}
                    {parsedRecommendations.rawText && (
                       <div>
                         <h3 className="text-lg font-semibold text-red-400 mb-2">Could not fully parse recommendations</h3>
                         <p className="text-sm text-gray-400 mb-4">Displaying raw data:</p>
                         <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300 bg-gray-900/50 p-4 rounded-md">
                           {parsedRecommendations.rawText}
                         </pre>
                       </div>
                    )}

                    {/* Note */}
                    <div className="text-xs text-gray-500 pt-4 border-t border-gray-700/50">
                      <span className="font-medium">Disclaimer:</span> These recommendations are for informational purposes only and do not constitute financial advice. Consult with a qualified financial advisor before making investment decisions.
                    </div>
                  </CardContent>
                </Card>
              ) : (
                 <Card>
                   <CardHeader>
                     <CardTitle>No Recommendations Available</CardTitle>
                   </CardHeader>
                   <CardContent>
                     <p className="text-gray-400">Please select your profile and click "Get Recommendations".</p>
                   </CardContent>
                 </Card>
              )
            ) : (
              // Placeholder when recommendations are not shown
              <Card className="h-full flex flex-col items-center justify-center text-center bg-gray-800/50 border-gray-700/80">
                <CardHeader className="pb-4">
                  <div className="p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mx-auto mb-4 shadow-inner">
                     <Sparkles className="w-10 h-10 text-blue-300" />
                  </div>
                  <CardTitle className="text-xl">Get Personalized Recommendations</CardTitle>
                  <CardDescription>
                    Select your risk tolerance and investment horizon on the left panel to view tailored stock and ETF suggestions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Optionally refine by market cap and sector preferences for more specific results.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering StockRecommendationsPage:', error);
    // Keep the existing catch block for component-level errors
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader 
          title="Stock Recommendations" 
          description="Get personalized stock recommendations based on your investment profile" 
        />
        <div className="mt-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700 shadow-lg">
          <div className="text-center">
            <h3 className="text-xl font-medium text-red-400 mb-2">Unable to display recommendations</h3>
            <p className="text-gray-300 mb-4">We're experiencing technical difficulties. Please try again later.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }
};

// Wrap the entire component in an error boundary for extra protection
const StockRecommendationsPage: React.FC = () => {
  return (
    <SimpleErrorBoundary
      fallback={
        <div className="container mx-auto px-4 py-8">
          <PageHeader 
            title="Stock Recommendations" 
            description="Get personalized stock recommendations based on your investment profile" 
          />
          <div className="mt-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700 shadow-lg">
            <div className="text-center">
              <h3 className="text-xl font-medium text-red-400 mb-2">Unable to display recommendations</h3>
              <p className="text-gray-300 mb-4">We're experiencing technical difficulties. Please try again later.</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      }
    >
      <SafeRecommendationsPage />
    </SimpleErrorBoundary>
  );
};

export default StockRecommendationsPage;
