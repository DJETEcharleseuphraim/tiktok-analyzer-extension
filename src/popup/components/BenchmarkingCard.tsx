import React from 'react';

const BenchmarkingCard: React.FC = () => {
  return (
    <div className="card benchmarking-card">
      <div className="card-header">
        <h3>📊 Benchmarking vs Compétition</h3>
      </div>
      <div className="benchmarking-content">
        <p>Compare tes stats avec les comptes de ta niche:</p>
        <div className="benchmark-items">
          <div className="item">Followers: -- vs Moyenne: --</div>
          <div className="item">Engagement: -- vs Moyenne: --</div>
          <div className="item">RPM: -- vs Moyenne: --</div>
        </div>
        <button className="btn-secondary">Voir Comparaison</button>
      </div>
    </div>
  );
};

export default BenchmarkingCard;
