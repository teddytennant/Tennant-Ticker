// netlify-deploy-setup.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a unique deployment ID
const timestamp = new Date().toISOString();
const deploymentId = `SM-DEPLOY-${timestamp.replace(/[:.]/g, '-')}`;
const buildVersion = new Date().getTime();

// Create the content for the identifier file
const content = `StockMonitor Netlify Deployment
Deployment ID: ${deploymentId}
Timestamp: ${new Date().toLocaleString()}
Build Version: ${buildVersion}

This file serves as a unique identifier for this specific Netlify deployment.
You can use this file to verify which version of the application is currently deployed.`;

// Ensure the public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write the identifier file
const filePath = path.join(publicDir, 'netlify-deploy-identifier.txt');
fs.writeFileSync(filePath, content);

console.log('✅ Deployment identifier file created successfully!');
console.log(`📝 Deployment ID: ${deploymentId}`); 