import React, { useState } from 'react';

interface RevenueTrackerProps {
  revenueData: any;
}

const RevenueTracker: React.FC<RevenueTrackerProps> = ({ revenueData }) => {
  const [earnings, setEarnings] = useState('');
  const [views, setViews] = useState('');

  const handleAddEntry = () => {
    if (earnings && views) {
      chrome.runtime.sendMessage(
        {
          type: 'ADD_REVENUE_ENTRY',
          earnings: parseFloat(earnings),
          views: parseFloat(views)
        },
        (response) => {
          if (response.success) {
            setEarnings('');
            setViews('');
            alert('Entrée ajoutée!');
          }
        }
      );
    }
  };

  return (
    <div className="card revenue-card">
      <div className="card-header">
        <h3>💰 Suivi Revenus</h3>
      </div>

      <div className="revenue-summary">
        <div className="summary-item">
          <label>Total ce mois</label>
          <span className="amount">${revenueData?.totalRevenue.toFixed(2) || '0.00'}</span>
        </div>
        <div className="summary-item">
          <label>Entrées</label>
          <span className="count">{revenueData?.entries.length || 0}</span>
        </div>
      </div>

      <div className="revenue-input">
        <h4>Ajouter une entrée</h4>
        <input
          type="number"
          placeholder="Revenus ($)"
          value={earnings}
          onChange={(e) => setEarnings(e.target.value)}
        />
        <input
          type="number"
          placeholder="Vues"
          value={views}
          onChange={(e) => setViews(e.target.value)}
        />
        <button className="btn-primary" onClick={handleAddEntry}>
          Ajouter
        </button>
      </div>
    </div>
  );
};

export default RevenueTracker;
