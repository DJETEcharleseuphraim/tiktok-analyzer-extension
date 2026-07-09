import React from 'react';
import { Trend } from '../../types/index';

interface TrendsCardProps {
  trends: {
    formats: Trend[];
    hooks: Trend[];
    ctas: Trend[];
  };
}

const TrendsCard: React.FC<TrendsCardProps> = ({ trends }) => {
  return (
    <div className="card trends-card">
      <div className="card-header">
        <h3>📈 Tendances</h3>
      </div>

      <div className="trends-section">
        <h4>Formats Gagnants</h4>
        <div className="trends-list">
          {trends.formats.slice(0, 3).map((trend, i) => (
            <div key={i} className="trend-item">
              <span className="trend-name">{trend.name}</span>
              <span className="engagement">{trend.avgEngagement.toFixed(1)}% eng.</span>
              {trend.trending && <span className="trending-badge">🔥 Trending</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="trends-section">
        <h4>Meilleurs Hooks</h4>
        <div className="trends-list">
          {trends.hooks.slice(0, 3).map((hook, i) => (
            <div key={i} className="trend-item">
              <span className="trend-name">{hook.name}</span>
              <span className="engagement">{hook.avgEngagement.toFixed(1)}% eng.</span>
            </div>
          ))}
        </div>
      </div>

      <div className="trends-section">
        <h4>Meilleurs CTA</h4>
        <div className="trends-list">
          {trends.ctas.slice(0, 3).map((cta, i) => (
            <div key={i} className="trend-item">
              <span className="trend-name">{cta.name}</span>
              <span className="engagement">{cta.avgEngagement.toFixed(1)}% eng.</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendsCard;
