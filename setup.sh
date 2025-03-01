#!/bin/bash

echo "🚀 Setting up Tennant Ticker development environment..."

# Check for required tools
echo "🔍 Checking for required tools..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js to continue."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm to continue."
    exit 1
fi

# Create project structure
echo "📁 Creating project structure..."
mkdir -p src/{components,pages,services,context,types,utils}

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
VITE_FINNHUB_API_KEY=your_finnhub_api_key
VITE_NEWS_API_KEY=your_news_api_key
EOF
    echo "⚠️  Please update the API keys in the .env file"
fi

# Initialize package.json if it doesn't exist
if [ ! -f package.json ]; then
    echo "📦 Initializing package.json..."
    npm init -y
    
    # Update package.json with correct configuration
    npm pkg set name="tennant-ticker"
    npm pkg set version="1.0.0"
    npm pkg set private="true"
    npm pkg set type="module"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install react react-dom react-router-dom axios lucide-react react-hot-toast @types/react @types/react-dom @types/node

# Install dev dependencies
echo "🛠️  Installing development dependencies..."
npm install -D typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser @vitejs/plugin-react autoprefixer eslint eslint-plugin-react-hooks eslint-plugin-react-refresh postcss tailwindcss vite

# Create tsconfig.json if it doesn't exist
if [ ! -f tsconfig.json ]; then
    echo "⚙️  Creating TypeScript configuration..."
    cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF
fi

# Create vite.config.ts if it doesn't exist
if [ ! -f vite.config.ts ]; then
    echo "⚙️  Creating Vite configuration..."
    cat > vite.config.ts << EOF
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
EOF
fi

# Create postcss.config.js if it doesn't exist
if [ ! -f postcss.config.js ]; then
    echo "⚙️  Creating PostCSS configuration..."
    cat > postcss.config.js << EOF
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOF
fi

# Create tailwind.config.js if it doesn't exist
if [ ! -f tailwind.config.js ]; then
    echo "⚙️  Creating Tailwind configuration..."
    cat > tailwind.config.js << EOF
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};
EOF
fi

# Update package.json scripts
echo "📝 Updating package.json scripts..."
npm pkg set scripts.dev="vite"
npm pkg set scripts.build="tsc && vite build"
npm pkg set scripts.preview="vite preview"
npm pkg set scripts.typecheck="tsc --noEmit"

# Install dependencies again to ensure everything is properly linked
echo "🔄 Running final dependency installation..."
npm install

# Start development server
echo "🌟 Starting development server..."
npm run dev

echo "✅ Setup complete!"
echo ""
echo "🌐 Your development server should now be running."
echo "📝 Don't forget to update your API keys in the .env file"
echo "💻 You can access the application at http://localhost:5173" 