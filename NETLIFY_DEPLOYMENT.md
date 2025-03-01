# StockMonitor Netlify Deployment Guide

## Deployment Identification

This application has been configured with a unique deployment identification system to help track and identify specific deployments on Netlify.

### Features

1. **Unique Deployment Identifier**: Each build generates a unique identifier with timestamp that is included in the deployed application.
2. **Visual Indicator**: A subtle deployment info component is displayed in the bottom-right corner of the application, showing the build date and deployment ID.
3. **Automatic Generation**: The identifier is automatically generated during the build process.

### How It Works

1. The `netlify-deploy-setup.js` script runs before the build process (via the `prebuild` npm script).
2. It generates a unique identifier file (`netlify-deploy-identifier.txt`) in the public directory.
3. This file is included in the build and accessible in the deployed application.
4. The `DeploymentInfo` component reads this file and displays the information in the UI.

### Deployment Configuration

The Netlify deployment is configured in `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[dev]
  command = "npm run dev"
  port = 3001

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Finding Your Deployment

To identify which deployment is currently running:

1. Look at the deployment info indicator in the bottom-right corner of the application.
2. Hover over it to see the full deployment ID and timestamp.
3. You can also directly access the `/netlify-deploy-identifier.txt` file in your browser to see the raw deployment information.

### Troubleshooting

If the deployment info is not visible:
- Check that the file `/netlify-deploy-identifier.txt` exists in your deployed application
- Verify that the `DeploymentInfo` component is properly integrated in the application layout
- Check the browser console for any errors related to fetching the deployment info

## Deployment Process

1. Make your changes to the codebase
2. Commit and push to your repository
3. Deploy to Netlify using your preferred method (manual upload, Git integration, etc.)
4. The build process will automatically generate the unique identifier
5. Once deployed, you can verify the deployment by checking the deployment info indicator 