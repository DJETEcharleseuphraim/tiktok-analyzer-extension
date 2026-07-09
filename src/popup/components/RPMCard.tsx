import React from 'react';
import { RPMEstimate } from '../../types/index';

interface RPMCardProps {
  rpm: RPMEstimate;
}

const RPMCard: React.FC<RPMCardProps> = ({ rpm }) => {
  const range = {
    low: Math.round(rpm.blendedRPM * 0.65 * 10000) / 10000,
    high: Math.round(rpm.blendedRPM * 1.35 * 10000) / 10000
  };

  return (
    <div className="card rpm-card">
      <div className="card-header">
        <h3>💰 RPM Estimé</h3>
        <div className="uncertainty">±{rpm.uncertainty}%</div>
      </div>

      <div className="rpm-breakdown">
        <div className="rpm-item">
          <label>Creator Fund</label>
          <span className="value">${rpm.creatorFundRPM.toFixed(3)}</span>
        </div>
        <div className="rpm-item">
          <label>Marques</label>
          <span className="value">${rpm.brandRPM.toFixed(3)}</span>
        </div>
        <div className="rpm-item highlight">
          <label>Blended RPM</label>
          <span className="value large">${rpm.blendedRPM.toFixed(3)}</span>
        </div>
      </div>

      <div className="earnings-projection">
        <h4>Projections de Revenus</h4>
        <div className="projection">
          <span>Journalier:</span>
          <span className="amount">${rpm.dailyEarnings.toFixed(2)}</span>
        </div>
        <div className="projection">
          <span>Mensuel:</span>
          <span className="amount">${rpm.monthlyEarnings.toFixed(2)}</span>
        </div>
        <div className="projection">
          <span>Annuel:</span>
          <span className="amount">${rpm.yearlyEarnings.toFixed(2)}</span>
        </div>
      </div>

      <div className="range-indicator">
        <p>Gamme: ${range.low.toFixed(3)} - ${range.high.toFixed(3)}</p>
      </div>
    </div>
  );
};

export default RPMCard;
