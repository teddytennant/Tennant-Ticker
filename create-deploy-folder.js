// create-deploy-folder.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Create a simple identifier file inside the folder
const identifierContent = `StockMonitor Netlify Deployment
Created: ${new Date().toLocaleString()}
Folder: ${uniqueFolderName}
`;

fs.writeFileSync(path.join(deployFolderPath, 'deployment-info.txt'), identifierContent);

console.log(`✅ Created deployment folder: ${uniqueFolderName}`);
console.log(`📂 Full path: ${deployFolderPath}`);
console.log(`🚀 Use this folder to upload your build files to Netlify`); 