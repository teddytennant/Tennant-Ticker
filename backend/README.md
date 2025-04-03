# Tennant Ticker Backend

This is the Python-based backend for the Tennant Ticker application, providing market data via yfinance.

## Setup

1. Create a Python virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Running the server

Start the development server:

```bash
python wsgi.py
```

The API will be available at http://localhost:3001/api/

## API Endpoints

- `/api/quote/{symbol}` - Get real-time quote data for a stock symbol
- `/api/historical/{symbol}` - Get historical price data
- `/api/market-indices` - Get data for major market indices
- `/api/top-movers` - Get a list of top market movers
- `/api/sector-performance` - Get performance data by sector

## Production Deployment

For production deployment, use Gunicorn:

```bash
gunicorn -w 4 -b 0.0.0.0:3001 wsgi:app
``` 