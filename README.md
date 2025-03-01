# StockMonitor

A professional stock monitoring application for tracking market data and financial information.

## Setup

1. Clone this repository
   ```
   git clone https://github.com/yourusername/stockmonitor.git
   cd stockmonitor
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and add your API keys
   ```
   cp .env.example .env
   ```

4. Start the development server
   ```
   npm run dev
   ```

## Deployment

### Deploying to Netlify via GitHub

1. Push your changes to GitHub
   ```
   git add .
   git commit -m "Your commit message"
   git push
   ```

2. Connect your GitHub repository to Netlify:
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" > "Import an existing project"
   - Select GitHub and authorize Netlify
   - Choose your StockMonitor repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Add your environment variables in the Netlify dashboard
   - Click "Deploy site"

### Manual Deployment

If you prefer to deploy manually:

1. Build the application
   ```
   npm run build
   ```

2. Upload the `dist` directory to Netlify via the Netlify dashboard

## Environment Variables

The following environment variables are required:

- `VITE_ALPHA_VANTAGE_API_KEY`: API key for Alpha Vantage
- `VITE_FINNHUB_API_KEY`: API key for Finnhub
- `VITE_NEWS_API_KEY`: API key for News API
- `VITE_XAI_API_KEY`: API key for XAI

## Troubleshooting

If you encounter an infinite loading screen:

1. Check browser console for errors
2. Verify authentication is working
3. Clear browser cache and cookies
4. Try a different browser
5. Check Netlify deployment logs