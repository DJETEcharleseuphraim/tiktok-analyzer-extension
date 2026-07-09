import React from 'react';
import { SubNiche } from '../../types/index';

interface NicheAnalysisCardProps {
  niche: string;
  subNiches: SubNiche[];
}

const NicheAnalysisCard: React.FC<NicheAnalysisCardProps> = ({ niche, subNiches }) => {
  return (
    <div className="card niche-card">
      <div className="card-header">
        <h3>🎯 Analyse de Niche</h3>
      </div>

      <div className="niche-main">
        <div className="niche-badge">{niche}</div>
        <p className="niche-description">Niche détectée basée sur les hashtags et la bio</p>
      </div>

      {subNiches.length > 0 && (
        <div className="subniche-section">
          <h4>Sous-Niches Moins Saturées</h4>
          <div className="subniche-list">
            {subNiches.map((sub, index) => (
              <div key={index} className="subniche-item">
                <div className="subniche-name">{sub.name}</div>
                <div className="subniche-details">
                  <span className="saturation">Saturation: {sub.saturationScore}%</span>
                  <span className="rpm">RPM: ${sub.avgRPM.toFixed(3)}</span>
                  <span className={`opportunity ${sub.opportunity}`}>🎯 {sub.opportunity}</span>
                </div>
                <div className="time-to-growth">⏱️ {sub.timeToGrowth}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NicheAnalysisCard;
