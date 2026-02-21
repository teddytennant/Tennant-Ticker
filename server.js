const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Validate ticker symbol - only allow alphanumeric, dots, hyphens, carets (for indices like ^GSPC)
function isValidTickerSymbol(symbol) {
  return /^[a-zA-Z0-9.\-^]{1,20}$/.test(symbol);
}

// Validate period parameter for historical data
function isValidPeriod(period) {
  const validPeriods = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max'];
  return validPeriods.includes(period);
}

// Validate interval parameter for historical data
function isValidInterval(interval) {
  const validIntervals = ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo'];
  return validIntervals.includes(interval);
}

// Helper function to execute Python scripts
function executePythonScript(script) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', ['-c', script]);
    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${error}`));
      } else {
        try {
          resolve(JSON.parse(result));
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${result}`));
        }
      }
    });
  });
}

// Get stock quote
app.get('/api/quote/:symbol', async (req, res) => {
  const { symbol } = req.params;

  if (!isValidTickerSymbol(symbol)) {
    return res.status(400).json({ error: 'Invalid ticker symbol. Only alphanumeric characters, dots, hyphens, and carets are allowed.' });
  }

  const script = `
import yfinance as yf
import json

try:
    ticker = yf.Ticker("${symbol}")
    info = ticker.info
    quote = {
        "symbol": info.get("symbol"),
        "shortName": info.get("shortName"),
        "regularMarketPrice": info.get("regularMarketPrice"),
        "regularMarketChange": info.get("regularMarketChange"),
        "regularMarketChangePercent": info.get("regularMarketChangePercent"),
        "regularMarketVolume": info.get("regularMarketVolume"),
        "marketCap": info.get("marketCap"),
        "regularMarketOpen": info.get("regularMarketOpen"),
        "regularMarketDayHigh": info.get("regularMarketDayHigh"),
        "regularMarketDayLow": info.get("regularMarketDayLow"),
        "regularMarketPreviousClose": info.get("regularMarketPreviousClose")
    }
    print(json.dumps(quote))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;

  try {
    const data = await executePythonScript(script);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get historical data
app.get('/api/historical/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { period = '1mo', interval = '1d' } = req.query;

  if (!isValidTickerSymbol(symbol)) {
    return res.status(400).json({ error: 'Invalid ticker symbol. Only alphanumeric characters, dots, hyphens, and carets are allowed.' });
  }

  if (!isValidPeriod(period)) {
    return res.status(400).json({ error: 'Invalid period parameter.' });
  }

  if (!isValidInterval(interval)) {
    return res.status(400).json({ error: 'Invalid interval parameter.' });
  }

  const script = `
import yfinance as yf
import json
from datetime import datetime

try:
    ticker = yf.Ticker("${symbol}")
    hist = ticker.history(period="${period}", interval="${interval}")
    hist.reset_index(inplace=True)
    hist['Date'] = hist['Date'].dt.strftime('%Y-%m-%d %H:%M:%S')
    print(json.dumps(hist.to_dict('records')))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;

  try {
    const data = await executePythonScript(script);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get market indices
app.get('/api/market-indices', async (req, res) => {
  const script = `
import yfinance as yf
import json

try:
    indices = ['^GSPC', '^IXIC', '^DJI', '^RUT']
    names = ['S&P 500', 'NASDAQ', 'Dow Jones', 'Russell 2000']
    market_indices = []
    
    for symbol, name in zip(indices, names):
        ticker = yf.Ticker(symbol)
        info = ticker.info
        market_indices.append({
            "symbol": symbol,
            "name": name,
            "price": info.get("regularMarketPrice"),
            "change": info.get("regularMarketChange"),
            "changePercent": info.get("regularMarketChangePercent")
        })
    
    print(json.dumps(market_indices))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;

  try {
    const data = await executePythonScript(script);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top movers
app.get('/api/top-movers', async (req, res) => {
  const script = `
import yfinance as yf
import json

try:
    symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'JPM']
    movers = []
    
    for symbol in symbols:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        movers.append({
            "symbol": info.get("symbol"),
            "name": info.get("shortName"),
            "price": info.get("regularMarketPrice"),
            "change": info.get("regularMarketChange"),
            "changePercent": info.get("regularMarketChangePercent"),
            "volume": info.get("regularMarketVolume")
        })
    
    print(json.dumps(movers))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;

  try {
    const data = await executePythonScript(script);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 