import React from 'react';

const ContentStrategyAdvisor: React.FC = () => {
  return (
    <div className="card strategy-card">
      <div className="card-header">
        <h3>🎯 Stratégie Contenu</h3>
      </div>
      <div className="strategy-content">
        <div className="strategy-item">
          <h4>📈 Croissance Recommandée</h4>
          <p>Post 5-7 vidéos par semaine</p>
        </div>
        <div className="strategy-item">
          <h4>🎬 Format Recommandé</h4>
          <p>Court-métrage 15-30 sec</p>
        </div>
        <div className="strategy-item">
          <h4>⏰ Meilleur Moment</h4>
          <p>19h-21h (heures de pointe)</p>
        </div>
      </div>
    </div>
  );
};

export default ContentStrategyAdvisor;
