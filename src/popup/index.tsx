import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import '../styles/global.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') || document.createElement('div')
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
