import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a unique folder name with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const uniqueFolderName = `stockmonitor-netlify-${timestamp}`;

// Create the folder
const deployFolderPath = path.join(__dirname, uniqueFolderName);
if (!fs.existsSync(deployFolderPath)) {
  fs.mkdirSync(deployFolderPath, { recursive: true });
}

// Source directory (existing build)
const sourcePath = path.join(__dirname, 'stockmonitor-build');

// Copy build files to the unique folder
console.log(`📋 Copying build files to ${uniqueFolderName}...`);
try {
  // Copy all files from stockmonitor-build to the unique folder
  fs.cpSync(sourcePath, deployFolderPath, { recursive: true });
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

// Create a simple identifier file inside the folder
const identifierContent = `StockMonitor Netlify Deployment
Deployment ID: SM-DEPLOY-${timestamp}
Timestamp: ${new Date().toLocaleString()}
Folder: ${uniqueFolderName}

This file serves as a unique identifier for this specific Netlify deployment.
You can use this file to verify which version of the application is currently deployed.
`;

fs.writeFileSync(path.join(deployFolderPath, 'netlify-deploy-identifier.txt'), identifierContent);

console.log(`\n✅ Deployment folder created successfully!`);
console.log(`📂 Your deployment folder is: ${uniqueFolderName}`);
console.log(`🚀 Upload this folder to Netlify for deployment`);
console.log(`🔍 Deployment ID: SM-DEPLOY-${timestamp}`); 