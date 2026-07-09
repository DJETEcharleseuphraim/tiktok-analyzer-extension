import { TikTokProfile, TikTokVideo, RPMEstimate } from '../types/index';

/**
 * TikTok Scraper - Extrait les données du DOM TikTok
 * Fonctionne en collaboration avec le Content Script
 */

export class TikTokScraper {
  /**
   * Scrape un profil TikTok à partir du DOM
   */
  static scrapeProfileFromDOM(): TikTokProfile | null {
    try {
      // Extract username
      const usernameElement = document.querySelector('[data-testid="user-title-input"]') as HTMLInputElement;
      const username = usernameElement?.value || window.location.pathname.replace(/\//g, '').split('@')[1];

      if (!username) return null;

      // Extract follower count
      const followerElement = document.querySelector('span[title*="Follower"]')?.parentElement;
      const followersText = followerElement?.textContent || '0';
      const followers = this.parseNumber(followersText);

      // Extract bio
      const bioElement = document.querySelector('[data-testid="user-bio"]');
      const bio = bioElement?.textContent || '';

      // Extract avatar
      const avatarElement = document.querySelector('img[alt*="avatar"]') as HTMLImageElement;
      const avatar = avatarElement?.src || '';

      // Extract verified status
      const verifiedElement = document.querySelector('[data-testid="user-verified"]');
      const verified = !!verifiedElement;

      // Try to extract user ID from page data
      const userId = this.extractUserIdFromPage();

      // Extract total views
      const viewsElement = Array.from(document.querySelectorAll('span')).find(
        span => span.textContent?.includes('View')
      )?.parentElement;
      const viewsText = viewsElement?.textContent || '0';
      const totalViews = this.parseNumber(viewsText);

      const profile: TikTokProfile = {
        username,
        userId,
        followers,
        totalViews,
        followersCount: followers,
        videoCount: 0,
        heartCount: 0,
        engagement: 0,
        verified,
        avatar,
        bio,
        niche: '',
        lastUpdated: Date.now()
      };

      return profile;
    } catch (error) {
      console.error('Error scraping profile:', error);
      return null;
    }
  }

  /**
   * Scrape les vidéos d'un profil
   */
  static async scrapeVideosFromDOM(): Promise<TikTokVideo[]> {
    try {
      const videos: TikTokVideo[] = [];
      const videoElements = document.querySelectorAll('[data-testid="video-feed"] a');

      for (const element of Array.from(videoElements).slice(0, 50)) {
        const videoLink = (element as HTMLAnchorElement).href;
        const videoId = this.extractVideoIdFromUrl(videoLink);

        if (!videoId) continue;

        const video: TikTokVideo = {
          videoId,
          videoUrl: videoLink,
          title: '',
          description: '',
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          engagement: 0,
          duration: 0,
          format: 'normal',
          hashtags: [],
          uploadDate: Date.now(),
          isViral: false,
          viralScore: 0
        };

        videos.push(video);
      }

      return videos;
    } catch (error) {
      console.error('Error scraping videos:', error);
      return [];
    }
  }

  /**
   * Parse un nombre formaté (ex: "1.2M" -> 1200000)
   */
  static parseNumber(text: string): number {
    const cleanText = text.toLowerCase().trim();
    
    if (cleanText.includes('k')) {
      return parseFloat(cleanText.replace('k', '')) * 1000;
    }
    if (cleanText.includes('m')) {
      return parseFloat(cleanText.replace('m', '')) * 1000000;
    }
    if (cleanText.includes('b')) {
      return parseFloat(cleanText.replace('b', '')) * 1000000000;
    }
    
    return parseInt(cleanText.replace(/\D/g, ''), 10) || 0;
  }

  /**
   * Extrait l'ID utilisateur de la page
   */
  static extractUserIdFromPage(): string {
    try {
      // Cherche dans le window.__UNIVERSAL_DATA_FOR_REHYDRATION__
      const scriptElement = document.querySelector('script#__UNIVERSAL_DATA_FOR_REHYDRATION__');
      if (scriptElement) {
        const data = JSON.parse(scriptElement.textContent || '{}');
        const userId = data?.__DEFAULT_SCOPE__?.['webapp.user-detail']?.userInfo?.user?.id;
        return userId || '';
      }
    } catch (error) {
      console.error('Error extracting user ID:', error);
    }
    return '';
  }

  /**
   * Extrait l'ID vidéo d'une URL TikTok
   */
  static extractVideoIdFromUrl(url: string): string {
    const match = url.match(/\/video\/(\d+)/);
    return match?.[1] || '';
  }

  /**
   * Détecte le format de la vidéo
   */
  static detectVideoFormat(description: string): 'normal' | 'greenscreen' | 'duet' | 'stitch' | 'other' {
    if (description.includes('greenscreen')) return 'greenscreen';
    if (description.includes('duet')) return 'duet';
    if (description.includes('stitch')) return 'stitch';
    return 'normal';
  }

  /**
   * Extrait les hashtags d'une description
   */
  static extractHashtags(text: string): string[] {
    const hashtags = text.match(/#\w+/g) || [];
    return hashtags.map(tag => tag.substring(1)); // Remove # prefix
  }

  /**
   * Extrait la musique d'une vidéo
   */
  static extractMusicFromPage(): string {
    try {
      const musicElement = document.querySelector('[data-testid="music-link"]');
      return musicElement?.textContent || '';
    } catch (error) {
      console.error('Error extracting music:', error);
      return '';
    }
  }

  /**
   * Scrape les commentaires pour l'analyse de sentiment
   */
  static async scrapeComments(limit: number = 50): Promise<string[]> {
    try {
      const comments: string[] = [];
      const commentElements = document.querySelectorAll('[data-testid="comment"]');

      for (const element of Array.from(commentElements).slice(0, limit)) {
        comments.push(element.textContent || '');
      }

      return comments;
    } catch (error) {
      console.error('Error scraping comments:', error);
      return [];
    }
  }
}

/**
 * API Service - Gère la communication entre les scripts
 */
export class APIService {
  static async sendMessageToBackground(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  static async sendMessageToContent(tabId: number, message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }
}

/**
 * Storage Service - Gère chrome.storage
 */
export class StorageService {
  static async setLocal(key: string, value: any): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    });
  }

  static async getLocal(key: string): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => {
        resolve(result[key]);
      });
    });
  }

  static async removeLocal(key: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, () => resolve());
    });
  }

  static async clearLocal(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => resolve());
    });
  }

  static async getSync(key: string): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(key, (result) => {
        resolve(result[key]);
      });
    });
  }

  static async setSync(key: string, value: any): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [key]: value }, () => resolve());
    });
  }
}

/**
 * Utility Functions
 */
export const calculateEngagementRate = (likes: number, comments: number, shares: number, views: number): number => {
  if (views === 0) return 0;
  return ((likes + comments + shares) / views) * 100;
};

export const calculateViralityScore = (
  views: number,
  engagement: number,
  shares: number,
  commentsSentiment: number
): number => {
  // Simple viralité score calculation
  const viewScore = Math.min(views / 1000000, 1) * 30; // Max 30 points
  const engagementScore = Math.min(engagement / 10, 1) * 40; // Max 40 points
  const shareScore = Math.min(shares / 10000, 1) * 20; // Max 20 points
  const sentimentScore = commentsSentiment * 10; // Max 10 points

  return Math.min(viewScore + engagementScore + shareScore + sentimentScore, 100);
};

export const timeToString = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months}m${days % 30}d`;
  if (days > 0) return `${days}d${hours % 24}h`;
  if (hours > 0) return `${hours}h${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};
