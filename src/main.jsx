import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './app/AppContext.jsx';
import { App } from './app/App.jsx';
import './shared/styles/theme.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
