import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'
import './styles/hide-labels.css'
import './styles/search-fix.css'

// Track if React app has been rendered
window.__REACT_APP_RENDERED = window.__REACT_APP_RENDERED || false;

// Add a timestamp to detect reloads
console.log(`Main.tsx execution - ${new Date().toISOString()}`);

// Function to show error UI when React fails to render
const showErrorUI = (error: Error) => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background-color: #111827; color: white; padding: 0 20px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
        <h1 style="color: #3b82f6; margin-bottom: 20px;">Tennant Ticker</h1>
        <p style="margin-bottom: 20px; max-width: 600px; line-height: 1.6;">
          We've encountered an error while starting the application.
        </p>
        <p style="margin-bottom: 30px; max-width: 600px; line-height: 1.6; color: #9ca3af; font-size: 14px;">
          Error details: ${error.message}
        </p>
        <button 
          style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;"
          onclick="window.location.reload()">
          Refresh Page
        </button>
      </div>
    `;
  }
};

// Initialize the app with ultra-safe error handling
try {
  // Check if we've already rendered - this helps prevent double renders
  if (window.__REACT_APP_RENDERED) {
    console.warn('Previous React app render detected - preventing duplicate render');
    
    // Mark as loaded to prevent fallback
    if (typeof window.markAppLoaded === 'function') {
      window.markAppLoaded();
    }
    
    throw new Error('Duplicate render prevented');
  }
  
  // Make sure we have a root element
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Failed to find the root element');
  }
  
  // Mark as rendered early to prevent race conditions
  window.__REACT_APP_RENDERED = true;
  console.log('Starting React app render...');
  
  // Create root and render app
  const root = ReactDOM.createRoot(rootElement);
  
  // Render App directly without StrictMode
  root.render(<App />);
  
  console.log('React app mounted successfully');
  
  // Mark app as fully loaded
  if (typeof window.markAppLoaded === 'function') {
    window.markAppLoaded();
  }
  
} catch (error) {
  if (!(error instanceof Error && error.message === 'Duplicate render prevented')) {
    console.error('Failed to render the React app:', error);
    showErrorUI(error instanceof Error ? error : new Error('Unknown error occurred'));
  }
}
