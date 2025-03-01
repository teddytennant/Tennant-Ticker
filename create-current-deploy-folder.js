// create-current-deploy-folder.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a unique folder name with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const uniqueFolderName = `stockmonitor-current-${timestamp}`;

// Create the folder
const deployFolderPath = path.join(__dirname, uniqueFolderName);
if (!fs.existsSync(deployFolderPath)) {
  fs.mkdirSync(deployFolderPath, { recursive: true });
}

// Create source directories
const srcDir = path.join(deployFolderPath, 'src');
fs.mkdirSync(srcDir, { recursive: true });

const publicDir = path.join(deployFolderPath, 'public');
fs.mkdirSync(publicDir, { recursive: true });

// Copy current source code
console.log('📋 Copying current source code...');
try {
  // Copy src directory
  fs.cpSync(path.join(__dirname, 'src'), srcDir, { recursive: true });
  
  // Copy public directory
  fs.cpSync(path.join(__dirname, 'public'), publicDir, { recursive: true });
  
  // Copy configuration files
  const configFiles = [
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'tsconfig.node.json',
    'vite.config.ts',
    'index.html',
    'tailwind.config.js',
    'postcss.config.js',
    '.env',
    'netlify.toml'
  ];
  
  configFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
      fs.copyFileSync(
        path.join(__dirname, file),
        path.join(deployFolderPath, file)
      );
    }
  });
  
  console.log('✅ Files copied successfully!');
} catch (error) {
  console.error('❌ Failed to copy files:', error);
  process.exit(1);
}

// Create a deployment info file
const deploymentInfo = {
  name: 'StockMonitor',
  deploymentId: `SM-CURRENT-${timestamp}`,
  createdAt: new Date().toISOString(),
  folder: uniqueFolderName,
  type: 'source-code'
};

// Write the deployment info to a JSON file
fs.writeFileSync(
  path.join(deployFolderPath, 'deployment-info.json'), 
  JSON.stringify(deploymentInfo, null, 2)
);

// Create a README file with instructions
const readmeContent = `# StockMonitor Deployment Package

This folder contains the complete source code for the StockMonitor application as of ${new Date().toLocaleString()}.

## Deployment Instructions

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Build the application:
   \`\`\`
   npm run build
   \`\`\`

3. Deploy the \`dist\` directory to Netlify

## Deployment Information

- Deployment ID: SM-CURRENT-${timestamp}
- Created: ${new Date().toLocaleString()}
- Folder: ${uniqueFolderName}

This package contains the complete source code with all recent changes.
`;

fs.writeFileSync(path.join(deployFolderPath, 'README.md'), readmeContent);

console.log(`\n✅ Deployment package created successfully!`);
console.log(`📂 Your deployment package is: ${uniqueFolderName}`);
console.log(`🚀 This folder contains the complete source code with all your recent changes`);
console.log(`📝 Follow the instructions in the README.md file to deploy`);
console.log(`🔍 Deployment ID: SM-CURRENT-${timestamp}`); 