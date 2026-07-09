import React from 'react';

const OptimizationRecommendations: React.FC = () => {
  return (
    <div className="card optimization-card">
      <div className="card-header">
        <h3>💡 Optimisations</h3>
      </div>
      <div className="optimizations">
        <div className="optimization-item">
          <span className="icon">🎯</span>
          <span>Utilise plus de hashtags tendances</span>
          <span className="impact">+15%</span>
        </div>
        <div className="optimization-item">
          <span className="icon">🎬</span>
          <span>Teste le format "Stitch"</span>
          <span className="impact">+22%</span>
        </div>
        <div className="optimization-item">
          <span className="icon">⏰</span>
          <span>Post à 20h au lieu de 18h</span>
          <span className="impact">+18%</span>
        </div>
      </div>
    </div>
  );
};

export default OptimizationRecommendations;
