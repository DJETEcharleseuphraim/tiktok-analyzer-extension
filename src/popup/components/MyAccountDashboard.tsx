import React, { useState, useEffect } from 'react';

const MyAccountDashboard: React.FC = () => {
  const [accountSetup, setAccountSetup] = useState(false);
  const [username, setUsername] = useState('');

  const handleSetupAccount = () => {
    if (username) {
      chrome.runtime.sendMessage(
        {
          type: 'SET_SETTINGS',
          settings: { myUsername: username, autoLogin: true }
        },
        (response) => {
          if (response.success) {
            setAccountSetup(true);
          }
        }
      );
    }
  };

  if (!accountSetup) {
    return (
      <div className="card dashboard-card">
        <div className="card-header">
          <h3>👤 Mon Compte</h3>
        </div>
        <div className="setup-form">
          <label>Ton username TikTok (@)</label>
          <input
            type="text"
            placeholder="exemple_user"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button className="btn-primary" onClick={handleSetupAccount}>
            Configurer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card dashboard-card">
      <div className="card-header">
        <h3>👤 Mon Dashboard</h3>
      </div>
      <div className="dashboard-stats">
        <div className="stat">
          <label>Followers</label>
          <span className="value">--</span>
        </div>
        <div className="stat">
          <label>Vues Totales</label>
          <span className="value">--</span>
        </div>
        <div className="stat">
          <label>Engagement</label>
          <span className="value">--</span>
        </div>
        <div className="stat">
          <label>Croissance/Jour</label>
          <span className="value">--</span>
        </div>
      </div>
    </div>
  );
};

export default MyAccountDashboard;
