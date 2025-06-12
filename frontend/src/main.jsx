import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#333',
          color: '#fff',
        },
        success: {
          duration: 3000,
          theme: {
            primary: '#4aed88',
          },
        },
        error: {
          duration: 4000,
          theme: {
            primary: '#ff4b4b',
          },
        },
      }}
    />
    <App />
  </React.StrictMode>
);
