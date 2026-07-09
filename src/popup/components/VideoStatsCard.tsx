import React from 'react';
import { TikTokVideo } from '../../types/index';

interface VideoStatsCardProps {
  videos: TikTokVideo[];
}

const VideoStatsCard: React.FC<VideoStatsCardProps> = ({ videos }) => {
  if (!videos || videos.length === 0) {
    return <div className="card"><p>Aucune vidéo disponible</p></div>;
  }

  const stats = {
    avgViews: videos.reduce((sum, v) => sum + v.views, 0) / videos.length,
    avgLikes: videos.reduce((sum, v) => sum + v.likes, 0) / videos.length,
    avgComments: videos.reduce((sum, v) => sum + v.comments, 0) / videos.length,
    totalVideos: videos.length,
    topVideo: videos.sort((a, b) => b.views - a.views)[0]
  };

  return (
    <div className="card video-stats-card">
      <div className="card-header">
        <h3>📹 Stats Vidéos</h3>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <label>Vues Moyennes</label>
          <span className="value">{(stats.avgViews / 1000).toFixed(0)}K</span>
        </div>
        <div className="stat-item">
          <label>Likes Moyens</label>
          <span className="value">{(stats.avgLikes / 1000).toFixed(0)}K</span>
        </div>
        <div className="stat-item">
          <label>Commentaires Moyens</label>
          <span className="value">{stats.avgComments.toFixed(0)}</span>
        </div>
        <div className="stat-item">
          <label>Total Vidéos</label>
          <span className="value">{stats.totalVideos}</span>
        </div>
      </div>

      {stats.topVideo && (
        <div className="top-video">
          <h4>🎯 Vidéo Top</h4>
          <div className="top-video-info">
            <p className="title">{stats.topVideo.title}</p>
            <div className="metrics">
              <span>👀 {(stats.topVideo.views / 1000000).toFixed(1)}M vues</span>
              <span>❤️ {(stats.topVideo.likes / 1000).toFixed(0)}K likes</span>
              <span>💬 {stats.topVideo.comments} commentaires</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoStatsCard;
