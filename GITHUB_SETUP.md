# GitHub and Netlify Setup Guide

This guide will help you connect your StockMonitor project to GitHub and deploy it to Netlify while keeping it private.

## Creating a Private GitHub Repository

1. Go to [GitHub](https://github.com) and sign in to your account
2. Click the "+" icon in the top-right corner and select "New repository"
3. Enter a name for your repository (e.g., "stockmonitor")
4. Add a description (optional)
5. Select "Private" to ensure your code remains confidential
6. Click "Create repository"

## Connecting Your Local Repository to GitHub

Run the following commands in your terminal:

```bash
# Configure Git with your GitHub credentials (if not already done)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Add the GitHub repository as a remote
git remote add origin https://github.com/yourusername/stockmonitor.git

# Push your code to GitHub
git push -u origin main
```

## Deploying to Netlify

### Option 1: Continuous Deployment (Recommended)

1. Go to [Netlify](https://app.netlify.com/) and sign in
2. Click "Add new site" > "Import an existing project"
3. Select GitHub as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select your private StockMonitor repository
6. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Click "Show advanced" and add your environment variables:
   - VITE_ALPHA_VANTAGE_API_KEY
   - VITE_FINNHUB_API_KEY
   - VITE_NEWS_API_KEY
   - VITE_XAI_API_KEY
8. Click "Deploy site"

### Option 2: Manual Deployment

If you prefer not to connect your GitHub repository to Netlify:

1. Build your application locally:
   ```bash
   npm run build
   ```

2. Go to [Netlify](https://app.netlify.com/) and sign in
3. Click "Add new site" > "Deploy manually"
4. Drag and drop the `dist` folder to the upload area
5. Configure your site settings and add environment variables in the Netlify dashboard

## Keeping Your Repository Private

- Ensure your repository remains set to "Private" in GitHub settings
- Be careful when sharing your repository URL or Netlify site URL
- Do not commit sensitive information like API keys to your repository
- Use environment variables for all sensitive information

## Updating Your Deployment

When you make changes to your code:

1. Commit your changes locally:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

2. Push to GitHub:
   ```bash
   git push
   ```

3. If you've set up continuous deployment, Netlify will automatically deploy your changes
4. For manual deployment, rebuild locally and upload the new `dist` folder to Netlify 