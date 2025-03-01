// prepare-netlify-deploy.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a unique folder name with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const uniqueFolderName = `stockmonitor-deploy-${timestamp}`;

// Create the folder
const deployFolderPath = path.join(__dirname, uniqueFolderName);
if (!fs.existsSync(deployFolderPath)) {
  fs.mkdirSync(deployFolderPath, { recursive: true });
}

// Run the build command
console.log('🔨 Building the application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

// Copy build files to the unique folder
console.log(`📋 Copying build files to ${uniqueFolderName}...`);
try {
  // Copy all files from dist to the unique folder
  fs.cpSync(path.join(__dirname, 'dist'), deployFolderPath, { recursive: true });
  console.log('✅ Files copied successfully!');
} catch (error) {
  console.error('❌ Failed to copy files:', error);
  process.exit(1);
}

// Create a deployment info file
const deploymentInfo = {
  name: 'StockMonitor',
  deploymentId: `SM-${timestamp}`,
  createdAt: new Date().toISOString(),
  folder: uniqueFolderName
};

// Write the deployment info to a JSON file
fs.writeFileSync(
  path.join(deployFolderPath, 'deployment-info.json'), 
  JSON.stringify(deploymentInfo, null, 2)
);

// Also create a visible HTML file that shows the deployment info
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StockMonitor Deployment Info</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    .info-card {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    h1 {
      color: #2c3e50;
    }
    .label {
      font-weight: bold;
      color: #7f8c8d;
    }
    .value {
      margin-left: 10px;
      color: #2c3e50;
    }
    .timestamp {
      font-size: 0.9em;
      color: #7f8c8d;
    }
  </style>
</head>
<body>
  <h1>StockMonitor Deployment Information</h1>
  <div class="info-card">
    <p><span class="label">Deployment ID:</span><span class="value">${deploymentInfo.deploymentId}</span></p>
    <p><span class="label">Folder:</span><span class="value">${deploymentInfo.folder}</span></p>
    <p><span class="label">Created:</span><span class="value">${new Date(deploymentInfo.createdAt).toLocaleString()}</span></p>
    <p class="timestamp">This deployment was created on ${new Date().toLocaleString()}</p>
  </div>
  <p>This file helps identify which version of the application is deployed.</p>
</body>
</html>
`;

fs.writeFileSync(path.join(deployFolderPath, 'deployment-info.html'), htmlContent);

console.log(`\n✅ Deployment preparation complete!`);
console.log(`📂 Your deployment files are in: ${uniqueFolderName}`);
console.log(`🚀 Upload this folder to Netlify for deployment`);
console.log(`🔍 Each deployment has a unique identifier: ${deploymentInfo.deploymentId}`); 