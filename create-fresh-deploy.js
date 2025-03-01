import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a unique folder name with timestamp and random string
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const randomString = Math.random().toString(36).substring(2, 8);
const uniqueFolderName = `stockmonitor-fresh-${timestamp}-${randomString}`;

// Create the folder
const deployFolderPath = path.join(__dirname, uniqueFolderName);
if (!fs.existsSync(deployFolderPath)) {
  fs.mkdirSync(deployFolderPath, { recursive: true });
}

// Files and directories to exclude
const excludeList = [
  'node_modules',
  '.git',
  '.DS_Store',
  'stockmonitor-build',
  'dist',
  'stockmonitor-deploy-',
  'stockmonitor-netlify-',
  'stockmonitor-current-',
  'stockmonitor-deploy-ready-',
  'stockmonitor-fresh-'
];

// Function to check if a path should be excluded
const shouldExclude = (itemPath) => {
  const relativePath = path.relative(__dirname, itemPath);
  return excludeList.some(exclude => 
    relativePath === exclude || 
    relativePath.startsWith(exclude + '/') || 
    relativePath.startsWith(exclude + '\\')
  );
};

// Function to copy directory recursively
const copyDirRecursive = (src, dest) => {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  // Process each entry
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    // Skip if should be excluded
    if (shouldExclude(srcPath)) {
      continue;
    }
    
    // Copy based on entry type
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

// Copy current directory to deployment folder
console.log(`📋 Creating fresh deployment folder: ${uniqueFolderName}`);
try {
  copyDirRecursive(__dirname, deployFolderPath);
  console.log('✅ Files copied successfully!');
} catch (error) {
  console.error('❌ Failed to copy files:', error);
  process.exit(1);
}

// Create a deployment info file
const deploymentInfo = {
  name: 'StockMonitor',
  deploymentId: `SM-FRESH-${timestamp}-${randomString}`,
  createdAt: new Date().toISOString(),
  folder: uniqueFolderName,
  type: 'fresh-copy'
};

// Write the deployment info to a JSON file
fs.writeFileSync(
  path.join(deployFolderPath, 'deployment-info.json'), 
  JSON.stringify(deploymentInfo, null, 2)
);

// Create a visible identifier file
const identifierContent = `StockMonitor Fresh Deployment
Deployment ID: SM-FRESH-${timestamp}-${randomString}
Timestamp: ${new Date().toLocaleString()}
Folder: ${uniqueFolderName}

This is a fresh copy of your current working directory.
It contains all your latest code and changes.
`;

fs.writeFileSync(path.join(deployFolderPath, 'fresh-deployment-identifier.txt'), identifierContent);

// Create a README file with instructions
const readmeContent = `# StockMonitor Fresh Deployment

This folder contains a complete copy of your current working directory as of ${new Date().toLocaleString()}.

## What's Included

- All your current source code
- All configuration files
- All assets and resources

## What's Excluded

- node_modules (to keep the size manageable)
- .git directory
- Previous deployment folders
- Build directories

## Deployment Instructions

1. To deploy this to Netlify:

   a) If you want to deploy the source code:
      - Install dependencies: \`npm install\`
      - Build the application: \`npm run build\`
      - Deploy the \`dist\` directory

   b) If you want to deploy directly:
      - Upload this entire folder to Netlify

## Deployment Information

- Deployment ID: SM-FRESH-${timestamp}-${randomString}
- Created: ${new Date().toLocaleString()}
- Folder: ${uniqueFolderName}

This package contains your complete current codebase with all recent changes.
`;

fs.writeFileSync(path.join(deployFolderPath, 'README-FRESH.md'), readmeContent);

console.log(`\n✅ Fresh deployment folder created successfully!`);
console.log(`📂 Your deployment folder is: ${uniqueFolderName}`);
console.log(`🚀 This folder contains a complete copy of your current working directory`);
console.log(`📝 See README-FRESH.md for deployment instructions`);
console.log(`🔍 Deployment ID: SM-FRESH-${timestamp}-${randomString}`); 