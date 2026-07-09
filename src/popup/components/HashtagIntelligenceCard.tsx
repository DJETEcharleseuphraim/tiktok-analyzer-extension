import React from 'react';
import { TikTokVideo } from '../../types/index';

interface HashtagIntelligenceCardProps {
  videos: TikTokVideo[];
}

const HashtagIntelligenceCard: React.FC<HashtagIntelligenceCardProps> = ({ videos }) => {
  const hashtagStats: Record<string, { count: number; totalEngagement: number }> = {};

  videos.forEach(video => {
    video.hashtags.forEach(tag => {
      if (!hashtagStats[tag]) {
        hashtagStats[tag] = { count: 0, totalEngagement: 0 };
      }
      hashtagStats[tag].count++;
      hashtagStats[tag].totalEngagement += video.engagement;
    });
  });

  const topHashtags = Object.entries(hashtagStats)
    .map(([tag, stats]) => ({
      tag,
      count: stats.count,
      avgEngagement: stats.totalEngagement / stats.count
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 15);

  return (
    <div className="card hashtag-card">
      <div className="card-header">
        <h3>#️⃣ Hashtag Intelligence</h3>
      </div>

      <div className="hashtag-list">
        {topHashtags.map((ht, i) => (
          <div key={i} className="hashtag-item">
            <div className="hashtag-name">#{ht.tag}</div>
            <div className="hashtag-stats">
              <span>Utilisé {ht.count}x</span>
              <span>{ht.avgEngagement.toFixed(1)}% engagement</span>
            </div>
          </div>
        ))}
      </div>

      <div className="hashtag-strategy">
        <h4>💡 Stratégie Hashtags Recommandée</h4>
        <p>1 mega hashtag + 3 viraux + 4 micro</p>
        <button className="btn-small">Voir Stratégie Complète</button>
      </div>
    </div>
  );
};

export default HashtagIntelligenceCard;
