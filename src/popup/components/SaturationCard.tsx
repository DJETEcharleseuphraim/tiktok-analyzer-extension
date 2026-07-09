import React from 'react';

interface SaturationCardProps {
  saturation: number;
  potential: 'launch' | 'consider' | 'avoid';
}

const SaturationCard: React.FC<SaturationCardProps> = ({ saturation, potential }) => {
  const getColor = () => {
    if (saturation < 40) return '#10b981'; // green
    if (saturation < 70) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const getRecommendation = () => {
    switch (potential) {
      case 'launch':
        return '✅ LANCEZ! Excellente opportunité';
      case 'consider':
        return '🟡 À CONSIDÉRER. Potentiel moyen';
      case 'avoid':
        return '❌ À ÉVITER. Trop saturé';
    }
  };

  return (
    <div className="card saturation-card">
      <div className="card-header">
        <h3>📊 Saturation Niche</h3>
      </div>

      <div className="saturation-gauge">
        <div className="gauge-bar">
          <div
            className="gauge-fill"
            style={{
              width: `${saturation}%`,
              backgroundColor: getColor()
            }}
          />
        </div>
        <div className="gauge-label">{saturation}/100</div>
      </div>

      <div className="saturation-levels">
        <div className="level low">Peu saturé</div>
        <div className="level medium">Moyen</div>
        <div className="level high">Très saturé</div>
      </div>

      <div className="recommendation" data-type={potential}>
        {getRecommendation()}
      </div>

      <div className="saturation-insights">
        <p>Une saturation élevée signifie:</p>
        <ul>
          <li>Plus de concurrence</li>
          <li>RPM potentiellement plus bas</li>
          <li>Moins de croissance rapide</li>
        </ul>
      </div>
    </div>
  );
};

export default SaturationCard;
