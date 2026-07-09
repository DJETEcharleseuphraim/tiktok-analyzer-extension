import Dexie, { Table } from 'dexie';
import { TikTokProfile, TikTokVideo, NicheAnalysis, RevenueEntry, PersonalAlert, CompetitorAlert } from '../types/index';

export class TikTokAnalyzerDB extends Dexie {
  profiles!: Table<TikTokProfile>;
  videos!: Table<TikTokVideo>;
  niches!: Table<NicheAnalysis>;
  revenues!: Table<RevenueEntry>;
  personalAlerts!: Table<PersonalAlert>;
  competitorAlerts!: Table<CompetitorAlert>;
  watchList!: Table<{ username: string; addedAt: number; lastChecked: number }>;

  constructor() {
    super('TikTokAnalyzerDB');
    this.version(1).stores({
      profiles: '++id, username, userId, lastUpdated',
      videos: '++id, videoId, username, uploadDate',
      niches: '++id, niche, lastUpdated',
      revenues: '++id, date',
      personalAlerts: '++id, createdAt, isRead',
      competitorAlerts: '++id, username, createdAt',
      watchList: 'username, addedAt'
    });
  }

  // PROFILE OPERATIONS
  async saveProfile(profile: TikTokProfile): Promise<void> {
    await this.profiles.put({
      ...profile,
      lastUpdated: Date.now()
    });
  }

  async getProfile(username: string): Promise<TikTokProfile | undefined> {
    return this.profiles.where('username').equals(username).first();
  }

  async getAllProfiles(): Promise<TikTokProfile[]> {
    return this.profiles.toArray();
  }

  async getProfileHistory(username: string, days: number = 30): Promise<TikTokProfile[]> {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.profiles
      .where('username')
      .equals(username)
      .filter(p => p.lastUpdated >= cutoffTime)
      .toArray();
  }

  // VIDEO OPERATIONS
  async saveVideos(videos: TikTokVideo[]): Promise<void> {
    await this.videos.bulkPut(videos);
  }

  async getVideosByUsername(username: string, limit: number = 50): Promise<TikTokVideo[]> {
    return this.videos
      .where('username')
      .equals(username)
      .reverse()
      .limit(limit)
      .toArray();
  }

  async getTopVideosByEngagement(username: string, limit: number = 10): Promise<TikTokVideo[]> {
    const videos = await this.getVideosByUsername(username, 100);
    return videos.sort((a, b) => b.engagement - a.engagement).slice(0, limit);
  }

  async getTopVideosByViews(username: string, limit: number = 10): Promise<TikTokVideo[]> {
    const videos = await this.getVideosByUsername(username, 100);
    return videos.sort((a, b) => b.views - a.views).slice(0, limit);
  }

  // NICHE OPERATIONS
  async saveNicheAnalysis(niche: NicheAnalysis): Promise<void> {
    await this.niches.put({
      ...niche,
      lastUpdated: Date.now()
    });
  }

  async getNicheAnalysis(nicheName: string): Promise<NicheAnalysis | undefined> {
    return this.niches.where('niche').equals(nicheName).first();
  }

  // REVENUE OPERATIONS
  async addRevenueEntry(entry: RevenueEntry): Promise<void> {
    await this.revenues.add(entry);
  }

  async getRevenueEntries(days: number = 30): Promise<RevenueEntry[]> {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.revenues.where('date').aboveOrEqual(cutoffTime).toArray();
  }

  async calculateTotalRevenue(days: number = 30): Promise<number> {
    const entries = await this.getRevenueEntries(days);
    return entries.reduce((sum, entry) => sum + entry.earnings, 0);
  }

  // ALERT OPERATIONS
  async addPersonalAlert(alert: PersonalAlert): Promise<void> {
    await this.personalAlerts.add(alert);
  }

  async getUnreadAlerts(): Promise<PersonalAlert[]> {
    return this.personalAlerts.where('isRead').equals(false).toArray();
  }

  async markAlertAsRead(id: number): Promise<void> {
    await this.personalAlerts.update(id, { isRead: true });
  }

  async addCompetitorAlert(alert: CompetitorAlert): Promise<void> {
    await this.competitorAlerts.add(alert);
  }

  async getCompetitorAlerts(username: string, days: number = 7): Promise<CompetitorAlert[]> {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.competitorAlerts
      .where('username')
      .equals(username)
      .filter(a => a.createdAt >= cutoffTime)
      .toArray();
  }

  // WATCH LIST OPERATIONS
  async addToWatchList(username: string): Promise<void> {
    await this.watchList.put({
      username,
      addedAt: Date.now(),
      lastChecked: Date.now()
    });
  }

  async getWatchList(): Promise<string[]> {
    const list = await this.watchList.toArray();
    return list.map(item => item.username);
  }

  async removeFromWatchList(username: string): Promise<void> {
    await this.watchList.delete(username);
  }

  async updateLastChecked(username: string): Promise<void> {
    await this.watchList.update(username, { lastChecked: Date.now() });
  }

  // CLEANUP
  async clearOldData(daysToKeep: number = 90): Promise<void> {
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    
    await this.profiles.where('lastUpdated').below(cutoffTime).delete();
    await this.videos.where('uploadDate').below(cutoffTime).delete();
    await this.personalAlerts.where('createdAt').below(cutoffTime).delete();
  }
}

export const db = new TikTokAnalyzerDB();
