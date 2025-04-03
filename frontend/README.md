# Tennant Ticker Frontend

This is the React-based frontend for the Tennant Ticker application.

## Setup

1. Install dependencies:

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

## Building for Production

Build the application for production:
se
```bash
npm run build
```

## API Connection

The frontend connects to the Python backend at `http://localhost:3001/api/` by default. You can modify this in `src/services/yfinanceApi.ts` if needed.

## Important Notes

- Ensure the backend server is running before using the frontend.
- The backend provides market data via yfinance and must be accessible for the application to function properly. 