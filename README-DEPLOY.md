# StockMonitor Netlify Deployment Guide

## Quick Deployment with Unique Folder

This project includes a script that creates a uniquely named folder for each deployment, making it easy to identify and manage different deployments on Netlify.

### How to Use

1. Run the deployment preparation script:

```bash
npm run prepare-deploy
```

2. This will:
   - Build your application
   - Create a uniquely named folder (e.g., `stockmonitor-deploy-2023-05-15T12-34-56-789Z`)
   - Copy all build files to this folder
   - Add deployment identification files

3. Upload the generated folder to Netlify:
   - Go to Netlify dashboard
   - Drag and drop the generated folder
   - Or use the Netlify CLI to deploy it

### Benefits

- Each deployment gets a unique folder name with timestamp
- Easy to identify which version is deployed
- Includes deployment information files for reference
- Prevents confusion between different deployments

### Deployment Information

Each deployment folder includes:

- `deployment-info.json` - Machine-readable deployment metadata
- `deployment-info.html` - Human-readable deployment information page

You can access the deployment info page after deployment by visiting:
`https://your-site-name.netlify.app/deployment-info.html`

### Troubleshooting

If you encounter any issues:

1. Make sure you have Node.js installed
2. Verify that all dependencies are installed (`npm install`)
3. Check that the build process completes successfully
4. Ensure you have proper permissions to create folders in the project directory

For more detailed information about Netlify deployments, see the [Netlify documentation](https://docs.netlify.com/). 