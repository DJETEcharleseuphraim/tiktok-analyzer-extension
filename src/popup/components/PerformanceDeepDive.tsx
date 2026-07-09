import React from 'react';

const PerformanceDeepDive: React.FC = () => {
  return (
    <div className="card performance-card">
      <div className="card-header">
        <h3>📊 Performance Deep Dive</h3>
      </div>
      <div className="performance-content">
        <p>Analyse détaillée de tes vidéos:</p>
        <ul>
          <li>Meilleure heure de post</li>
          <li>Meilleur jour de la semaine</li>
          <li>Format le plus efficace</li>
          <li>Hashtags les plus performants</li>
          <li>Musiques gagnantes</li>
        </ul>
        <button className="btn-secondary">Voir Analyse Complète</button>
      </div>
    </div>
  );
};

export default PerformanceDeepDive;
