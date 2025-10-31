import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { logBuildInfo } from './utils/buildInfo';

// Log build information in development/production for debugging
if (import.meta.env.DEV || import.meta.env.PROD) {
  logBuildInfo();
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
