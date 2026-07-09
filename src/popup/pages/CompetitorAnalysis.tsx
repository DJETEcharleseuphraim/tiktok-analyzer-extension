import React, { useState } from 'react';
import RPMCard from '../components/RPMCard';
import NicheAnalysisCard from '../components/NicheAnalysisCard';
import VideoStatsCard from '../components/VideoStatsCard';
import TrendsCard from '../components/TrendsCard';
import HashtagIntelligenceCard from '../components/HashtagIntelligenceCard';
import ComparisonCard from '../components/ComparisonCard';
import SaturationCard from '../components/SaturationCard';
import '../../styles/competitor-analysis.css';

interface CompetitorAnalysisProps {
  analysis: any;
}

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ analysis }) => {
  const [view, setView] = useState<'overview' | 'detailed' | 'comparison'>('overview');

  if (!analysis) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h2>Pas d'analyse disponible</h2>
        <p>Va sur un profil TikTok et clique sur le bouton "Analyser ce compte"</p>
      </div>
    );
  }

  return (
    <div className="competitor-analysis">
      <div className="view-selector">
        <button
          className={`view-btn ${view === 'overview' ? 'active' : ''}`}
          onClick={() => setView('overview')}
        >
          Vue d'ensemble
        </button>
        <button
          className={`view-btn ${view === 'detailed' ? 'active' : ''}`}
          onClick={() => setView('detailed')}
        >
          Détaillé
        </button>
        <button
          className={`view-btn ${view === 'comparison' ? 'active' : ''}`}
          onClick={() => setView('comparison')}
        >
          Comparaison
        </button>
      </div>

      {view === 'overview' && (
        <div className="overview-grid">
          <div className="profile-header">
            <img src={analysis.profile.avatar} alt={analysis.profile.username} className="profile-avatar" />
            <div className="profile-info">
              <h2>@{analysis.profile.username}</h2>
              {analysis.profile.verified && <span className="verified-badge">✓ Vérifié</span>}
              <p className="bio">{analysis.profile.bio}</p>
              <div className="profile-stats">
                <div className="stat"><strong>{(analysis.profile.followers / 1000000).toFixed(1)}M</strong> followers</div>
                <div className="stat"><strong>{(analysis.profile.totalViews / 1000000).toFixed(1)}M</strong> vues</div>
                <div className="stat"><strong>{analysis.analysis.avgEngagement.toFixed(2)}%</strong> engagement</div>
              </div>
            </div>
          </div>

          <RPMCard rpm={analysis.rpm} />
          <SaturationCard saturation={analysis.saturationScore} potential={analysis.potential} />
          <NicheAnalysisCard niche={analysis.niche} subNiches={analysis.subNiches} />
          <TrendsCard trends={analysis.trends} />
          <VideoStatsCard videos={analysis.analysis.topVideos} />
        </div>
      )}

      {view === 'detailed' && (
        <div className="detailed-grid">
          <HashtagIntelligenceCard videos={analysis.analysis.topVideos} />
          <ComparisonCard profile={analysis.profile} />
          <div className="recommendations-card">
            <h3>💡 Recommandations</h3>
            <p>{analysis.analysis.recommendation}</p>
            {analysis.subNiches.length > 0 && (
              <div className="subniche-list">
                <h4>Sous-niches recommandées:</h4>
                {analysis.subNiches.map((sub: any, i: number) => (
                  <div key={i} className="subniche-item">
                    <span>{sub.name}</span>
                    <span className="opportunity" data-level={sub.opportunity}>📈 {sub.opportunity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'comparison' && (
        <div className="comparison-grid">
          <div className="comparison-placeholder">
            <h3>🔀 Comparaison Multi-Comptes</h3>
            <p>Ajoute des profils à ta watch list pour les comparer</p>
            <button className="btn-primary">Ajouter à Watch List</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorAnalysis;
