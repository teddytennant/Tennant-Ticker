// create-simple-deploy.js
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

// Create necessary subdirectories
const srcDir = path.join(deployFolderPath, 'src');
fs.mkdirSync(srcDir, { recursive: true });

const publicDir = path.join(deployFolderPath, 'public');
fs.mkdirSync(publicDir, { recursive: true });

// Essential directories to copy
const directoriesToCopy = [
  { src: 'src/components', dest: 'src/components' },
  { src: 'src/pages', dest: 'src/pages' },
  { src: 'src/lib', dest: 'src/lib' },
  { src: 'src/services', dest: 'src/services' },
  { src: 'src/styles', dest: 'src/styles' },
  { src: 'src/contexts', dest: 'src/contexts' },
  { src: 'src/context', dest: 'src/context' },
  { src: 'src/config', dest: 'src/config' },
  { src: 'src/utils', dest: 'src/utils' },
  { src: 'src/types', dest: 'src/types' },
  { src: 'public', dest: 'public' }
];

// Essential files to copy
const filesToCopy = [
  { src: 'src/index.css', dest: 'src/index.css' },
  { src: 'src/App.tsx', dest: 'src/App.tsx' },
  { src: 'src/main.tsx', dest: 'src/main.tsx' },
  { src: 'src/vite-env.d.ts', dest: 'src/vite-env.d.ts' },
  { src: 'package.json', dest: 'package.json' },
  { src: 'tsconfig.json', dest: 'tsconfig.json' },
  { src: 'tsconfig.node.json', dest: 'tsconfig.node.json' },
  { src: 'vite.config.ts', dest: 'vite.config.ts' },
  { src: 'index.html', dest: 'index.html' },
  { src: 'tailwind.config.js', dest: 'tailwind.config.js' },
  { src: 'postcss.config.js', dest: 'postcss.config.js' },
  { src: '.env', dest: '.env' },
  { src: 'netlify.toml', dest: 'netlify.toml' }
];

// Copy directories
console.log('📋 Copying essential directories...');
for (const dir of directoriesToCopy) {
  const srcPath = path.join(__dirname, dir.src);
  const destPath = path.join(deployFolderPath, dir.dest);
  
  if (fs.existsSync(srcPath)) {
    try {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.cpSync(srcPath, destPath, { recursive: true });
      console.log(`✅ Copied ${dir.src}`);
    } catch (error) {
      console.error(`❌ Failed to copy ${dir.src}:`, error.message);
    }
  } else {
    console.log(`⚠️ Directory not found: ${dir.src}`);
  }
}

// Copy files
console.log('\n📋 Copying essential files...');
for (const file of filesToCopy) {
  const srcPath = path.join(__dirname, file.src);
  const destPath = path.join(deployFolderPath, file.dest);
  
  if (fs.existsSync(srcPath)) {
    try {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ Copied ${file.src}`);
    } catch (error) {
      console.error(`❌ Failed to copy ${file.src}:`, error.message);
    }
  } else {
    console.log(`⚠️ File not found: ${file.src}`);
  }
}

// Create a deployment info file
const deploymentInfo = {
  name: 'StockMonitor',
  deploymentId: `SM-${timestamp}`,
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

This folder contains the essential source code for the StockMonitor application as of ${new Date().toLocaleString()}.

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

- Deployment ID: SM-${timestamp}
- Created: ${new Date().toLocaleString()}
- Folder: ${uniqueFolderName}

This package contains your current source code with all recent changes.
`;

fs.writeFileSync(path.join(deployFolderPath, 'README.md'), readmeContent);

console.log(`\n✅ Deployment package created successfully!`);
console.log(`📂 Your deployment package is: ${uniqueFolderName}`);
console.log(`🚀 This folder contains your current source code with all recent changes`);
console.log(`📝 Follow the instructions in the README.md file to deploy`);
console.log(`🔍 Deployment ID: SM-${timestamp}`); 