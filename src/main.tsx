import React from 'react';
import ReactDOM from 'react-dom/client';
import { Router } from 'wouter';
import App from './App.tsx';
import { I18nProvider } from './i18n/I18n';
import { AuthProvider } from './auth/AuthContext';
import { AuthGate } from './components/AuthGate';
import './index.css';
import './game.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <I18nProvider><AuthProvider><AuthGate><App /></AuthGate></AuthProvider></I18nProvider>
    </Router>
  </React.StrictMode>,
);
