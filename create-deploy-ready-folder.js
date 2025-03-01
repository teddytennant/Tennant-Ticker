// create-deploy-ready-folder.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a unique folder name with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const uniqueFolderName = `stockmonitor-deploy-ready-${timestamp}`;

// Create the folder
const deployFolderPath = path.join(__dirname, uniqueFolderName);
if (!fs.existsSync(deployFolderPath)) {
  fs.mkdirSync(deployFolderPath, { recursive: true });
}

// Create assets directory
const assetsDir = path.join(deployFolderPath, 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

// Copy essential files from stockmonitor-build
console.log('📋 Creating deployment-ready folder...');
try {
  // Copy assets from stockmonitor-build
  if (fs.existsSync(path.join(__dirname, 'stockmonitor-build', 'assets'))) {
    fs.cpSync(
      path.join(__dirname, 'stockmonitor-build', 'assets'), 
      assetsDir, 
      { recursive: true }
    );
  }
  
  // Copy essential files
  const essentialFiles = [
    'index.html',
    'favicon.ico',
    '_redirects',
    '_headers'
  ];
  
  essentialFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, 'stockmonitor-build', file))) {
      fs.copyFileSync(
        path.join(__dirname, 'stockmonitor-build', file),
        path.join(deployFolderPath, file)
      );
    }
  });
  
  // Create a custom index.html if it doesn't exist
  if (!fs.existsSync(path.join(deployFolderPath, 'index.html'))) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StockMonitor</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
      text-align: center;
    }
    .container {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-top: 50px;
    }
    h1 {
      color: #2c3e50;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>StockMonitor</h1>
    <p>Deployment ID: SM-READY-${timestamp}</p>
    <p>This is a placeholder page for the StockMonitor application.</p>
  </div>
</body>
</html>
    `;
    fs.writeFileSync(path.join(deployFolderPath, 'index.html'), htmlContent);
  }
  
  // Create _redirects file if it doesn't exist
  if (!fs.existsSync(path.join(deployFolderPath, '_redirects'))) {
    fs.writeFileSync(path.join(deployFolderPath, '_redirects'), '/* /index.html 200');
  }
  
  console.log('✅ Files prepared successfully!');
} catch (error) {
  console.error('❌ Failed to prepare files:', error);
  process.exit(1);
}

// Create a deployment info file
const deploymentInfo = {
  name: 'StockMonitor',
  deploymentId: `SM-READY-${timestamp}`,
  createdAt: new Date().toISOString(),
  folder: uniqueFolderName,
  type: 'deployment-ready'
};

// Write the deployment info to a JSON file
fs.writeFileSync(
  path.join(deployFolderPath, 'deployment-info.json'), 
  JSON.stringify(deploymentInfo, null, 2)
);

// Create a visible identifier file
const identifierContent = `StockMonitor Netlify Deployment
Deployment ID: SM-READY-${timestamp}
Timestamp: ${new Date().toLocaleString()}
Folder: ${uniqueFolderName}

This is a deployment-ready package that can be directly uploaded to Netlify.
`;

fs.writeFileSync(path.join(deployFolderPath, 'deployment-identifier.txt'), identifierContent);

console.log(`\n✅ Deployment-ready folder created successfully!`);
console.log(`📂 Your deployment folder is: ${uniqueFolderName}`);
console.log(`🚀 Upload this folder directly to Netlify for immediate deployment`);
console.log(`🔍 Deployment ID: SM-READY-${timestamp}`); 