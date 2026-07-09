import React, { useState, useEffect } from 'react';
import CompetitorAnalysis from './pages/CompetitorAnalysis';
import MyAccount from './pages/MyAccount';
import '../styles/app.css';

type Tab = 'competitors' | 'myaccount';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('competitors');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Récupère l'analyse du background
    chrome.runtime.sendMessage({ type: 'GET_ANALYSIS' }, (response) => {
      if (response?.analysis) {
        setAnalysis(response.analysis);
      }
    });
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>🎬 TikTok Analyzer Pro</h1>
          <p className="subtitle">Analyse Complète • Competitor Research • Self Analytics</p>
        </div>
      </header>

      <nav className="app-tabs">
        <button
          className={`tab-button ${activeTab === 'competitors' ? 'active' : ''}`}
          onClick={() => setActiveTab('competitors')}
        >
          <span className="icon">🔍</span>
          <span className="label">Concurrents</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'myaccount' ? 'active' : ''}`}
          onClick={() => setActiveTab('myaccount')}
        >
          <span className="icon">📊</span>
          <span className="label">Mon Compte</span>
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'competitors' && <CompetitorAnalysis analysis={analysis} />}
        {activeTab === 'myaccount' && <MyAccount />}
      </main>
    </div>
  );
};

export default App;
