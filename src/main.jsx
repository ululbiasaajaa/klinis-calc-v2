import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { PatientProvider } from './context/PatientContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <PatientProvider>
          <App />
        </PatientProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
);