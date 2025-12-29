// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ScoreProvider } from './context/ScoreContext'; // Importar el provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ScoreProvider> {/* Envolvemos TODA la app aquí */}
      <App />
    </ScoreProvider>
  </React.StrictMode>
);