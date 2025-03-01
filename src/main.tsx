import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Failed to find the root element');
} else {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    console.log('React app mounted successfully');
  } catch (error) {
    console.error('Failed to render the React app:', error);
  }
}
