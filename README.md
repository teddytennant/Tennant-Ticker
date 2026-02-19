# TennantTicker Market Data Platform

TennantTicker is a professional-grade market data platform designed to provide investors with real-time stock information, market insights, and portfolio tracking tools.

## Features

- **Stock Monitor**: Track your favorite stocks with real-time price updates
- **Investor Insights**: View market indices, top movers, and sector performance 
- **News Feed**: Stay informed with the latest market news
- **Technical Analysis**: View RSI and volatility indicators for stocks
- **Portfolio Tracking**: Manage and track your investments

## System Requirements

- Python 3.9+ with pip
- Node.js 18+ with npm
- Internet connection for market data

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/teddytennant/Tennant-Ticker.git
cd Tennant-Ticker
```

### 2. Set up API keys

Create a `.env` file in the frontend directory:

```
VITE_NEWS_API_KEY=your_news_api_key_here
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_LOGGING=true
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WEBSOCKET_URL=ws://localhost:3001
```

To get a News API key, register at [newsapi.org](https://newsapi.org).

### 3. Start the development environment

Run the start script to launch both backend and frontend:

```bash
./start-dev.sh
```

This script will:
- Set up a Python virtual environment
- Install backend dependencies
- Start the Flask backend on port 3001
- Install frontend dependencies
- Start the React frontend on port 5173 (default Vite port)

## Manual Setup (if start script doesn't work)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
pip install -r requirements.txt
python wsgi.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Architecture

- **Backend**: Python Flask API serving market data from yfinance
- **Frontend**: React application with TypeScript and modern UI components
- **Data Sources**: 
  - yfinance for market data (no API key required)
  - News API for market news (requires API key)

## Troubleshooting

- **Backend connection issues**: Ensure the Flask server is running on port 3001
- **No stock data**: Check your internet connection and backend logs
- **News API errors**: Verify your News API key is correct in the .env file

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

TennantTicker uses several open-source libraries and APIs:
- yfinance for market data
- React and various UI components
- Flask for the backend API