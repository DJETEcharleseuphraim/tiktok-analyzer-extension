import React from 'react';
import { TikTokProfile } from '../../types/index';

interface ComparisonCardProps {
  profile: TikTokProfile;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ profile }) => {
  const handleAddToWatchList = () => {
    chrome.runtime.sendMessage(
      { type: 'SAVE_TO_WATCHLIST', username: profile.username },
      (response) => {
        if (response.success) {
          alert(`${profile.username} added to watch list!`);
        }
      }
    );
  };

  return (
    <div className="card comparison-card">
      <div className="card-header">
        <h3>🔀 Comparateur</h3>
      </div>

      <div className="comparison-actions">
        <button className="btn-primary" onClick={handleAddToWatchList}>
          ➕ Ajouter à Watch List
        </button>
        <button className="btn-secondary">
          📊 Comparer avec Mes Stats
        </button>
      </div>

      <div className="comparison-info">
        <p>Suis ce compte pour:</p>
        <ul>
          <li>Alerte sur nouvelles vidéos</li>
          <li>Suivi des changements de stratégie</li>
          <li>Benchmark automatique</li>
          <li>Analyse de croissance</li>
        </ul>
      </div>
    </div>
  );
};

export default ComparisonCard;
