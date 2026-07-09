import { TikTokProfile, NicheAnalysis, SubNiche, Trend, HashtagIntelligence } from '../types/index';
import { RPMCalculator } from './rpmCalculator';

/**
 * Niche Analyzer - Détecte les niches et analyse la saturation
 */

export class NicheDetector {
  /**
   * Détecte la niche basée sur les hashtags
   */
  static detectNicheFromHashtags(hashtags: string[]): string {
    const nicheKeywords: Record<string, string[]> = {
      // Beauty
      beauty: ['makeup', 'beauty', 'skincare', 'cosmetics', 'foundation', 'lipstick', 'eyeshadow'],
      // Gaming
      gaming: ['gaming', 'gaming', 'fortnite', 'minecraft', 'twitch', 'esports', 'valorant'],
      // Fitness
      fitness: ['fitness', 'gym', 'workout', 'bodybuilding', 'crossfit', 'yoga', 'training'],
      // Business
      business: ['business', 'entrepreneur', 'startup', 'finance', 'investing', 'stocks', 'money'],
      // Technology
      technology: ['tech', 'coding', 'programming', 'software', 'python', 'javascript', 'ai'],
      // Fashion
      fashion: ['fashion', 'style', 'clothing', 'outfit', 'designer', 'luxury', 'trends'],
      // Travel
      travel: ['travel', 'adventure', 'explore', 'vacation', 'destination', 'tourist', 'wanderlust'],
      // Food
      food: ['food', 'cooking', 'recipe', 'kitchen', 'chef', 'restaurant', 'taste'],
      // Entertainment
      entertainment: ['entertainment', 'funny', 'comedy', 'meme', 'viral', 'laugh', 'humor'],
      // Education
      education: ['education', 'learning', 'school', 'tutorial', 'course', 'study', 'skill']
    };

    const nicheScores: Record<string, number> = {};

    hashtags.forEach(tag => {
      const normalized = tag.toLowerCase();
      
      Object.entries(nicheKeywords).forEach(([niche, keywords]) => {
        if (keywords.some(keyword => normalized.includes(keyword))) {
          nicheScores[niche] = (nicheScores[niche] || 0) + 1;
        }
      });
    });

    // Retourne la niche avec le plus de points
    const bestNiche = Object.entries(nicheScores)
      .sort(([, a], [, b]) => b - a)[0];

    return bestNiche?.[0] || 'general';
  }

  /**
   * Détecte la niche basée sur la bio et description
   */
  static detectNicheFromBio(bio: string): string {
    const bioLower = bio.toLowerCase();
    
    const nichePatterns: Record<string, RegExp> = {
      beauty: /makeup|beauty|skincare|cosmetic/i,
      gaming: /gamer|gaming|twitch|streams?/i,
      fitness: /fitness|gym|trainer|workout|bodybuilding/i,
      business: /entrepreneur|business|startup|founder/i,
      technology: /developer|programmer|tech|coding/i,
      fashion: /fashion|stylist|designer|clothing/i,
      travel: /travel|adventure|explorer|wanderlust/i,
      food: /chef|cooking|foodie|restaurant/i,
      education: /teacher|educator|learning|course/i,
      entertainment: /comedian|actor|entertainer/i
    };

    for (const [niche, pattern] of Object.entries(nichePatterns)) {
      if (pattern.test(bioLower)) {
        return niche;
      }
    }

    return 'general';
  }

  /**
   * Combine les détections et retourne la niche finale
   */
  static detectNiche(profile: TikTokProfile, hashtags: string[] = []): string {
    const fromHashtags = this.detectNicheFromHashtags(hashtags);
    const fromBio = this.detectNicheFromBio(profile.bio);

    // Si la détection de bio est plus spécifique, on la choisit
    if (fromBio !== 'general') {
      return fromBio;
    }

    return fromHashtags || 'general';
  }
}

/**
 * Saturation Analyzer - Analyse le niveau de saturation d'une niche
 */
export class SaturationAnalyzer {
  /**
   * Calcule le score de saturation (0-100, où 100 = ultra saturé)
   */
  static calculateSaturationScore(
    topAccounts: TikTokProfile[],
    avgEngagement: number,
    avgRPM: number
  ): number {
    let score = 0;

    // Factor 1: Nombre de comptes 100k+
    const accountsOver100k = topAccounts.filter(a => a.followers > 100000).length;
    const accountScore = Math.min((accountsOver100k / 5) * 30, 30); // Max 30 points
    score += accountScore;

    // Factor 2: Engagement moyen (bas = mauvais signe)
    const engagementScore = Math.max(0, 30 - (avgEngagement * 5)); // Max 30 points
    score += Math.min(engagementScore, 30);

    // Factor 3: RPM moyen (bas = non lucratif)
    const rpmScore = Math.max(0, 20 - (avgRPM * 50)); // Max 20 points
    score += Math.min(rpmScore, 20);

    // Factor 4: Diversité des comptes (peu de diversité = saturé)
    const diversity = this.calculateDiversity(topAccounts);
    const diversityScore = (1 - diversity) * 20; // Max 20 points
    score += diversityScore;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Évalue le potentiel d'une niche (launch, consider, avoid)
   */
  static evaluatePotential(saturationScore: number, avgRPM: number, avgEngagement: number): 'launch' | 'consider' | 'avoid' {
    if (saturationScore > 80 && avgRPM < 0.05) {
      return 'avoid'; // Trop saturé et pas lucratif
    }
    
    if (saturationScore > 60 && avgRPM < 0.03) {
      return 'avoid'; // Saturé et peu lucratif
    }
    
    if (saturationScore > 70) {
      return 'consider'; // Saturé mais potentiel
    }
    
    if (saturationScore < 40 && avgRPM > 0.06) {
      return 'launch'; // Peu saturé et lucratif
    }
    
    if (saturationScore < 50) {
      return 'launch'; // Peu saturé
    }
    
    return 'consider';
  }

  /**
   * Identifie les sous-niches moins saturées
   */
  static identifySubNiches(mainNiche: string): SubNiche[] {
    const subNiches: Record<string, SubNiche[]> = {
      beauty: [
        { name: 'Beauté Coréenne', saturationScore: 65, avgRPM: 0.08, opportunity: 'medium', timeToGrowth: '5-7 months' },
        { name: 'Beauté Skincare', saturationScore: 55, avgRPM: 0.09, opportunity: 'medium', timeToGrowth: '4-6 months' },
        { name: 'Beauté DIY Budget', saturationScore: 35, avgRPM: 0.07, opportunity: 'high', timeToGrowth: '3-4 months' },
        { name: 'Beauté Naturelle', saturationScore: 50, avgRPM: 0.08, opportunity: 'medium', timeToGrowth: '4-5 months' }
      ],
      gaming: [
        { name: 'Gaming Indie', saturationScore: 45, avgRPM: 0.08, opportunity: 'high', timeToGrowth: '4-5 months' },
        { name: 'Gaming Speedrun', saturationScore: 40, avgRPM: 0.09, opportunity: 'high', timeToGrowth: '3-4 months' },
        { name: 'Gaming Mobile', saturationScore: 70, avgRPM: 0.05, opportunity: 'low', timeToGrowth: '6-8 months' }
      ],
      fitness: [
        { name: 'Fitness Féminin', saturationScore: 55, avgRPM: 0.09, opportunity: 'medium', timeToGrowth: '4-6 months' },
        { name: 'Fitness Over 40', saturationScore: 30, avgRPM: 0.10, opportunity: 'high', timeToGrowth: '2-3 months' },
        { name: 'Fitness Bulk', saturationScore: 60, avgRPM: 0.08, opportunity: 'medium', timeToGrowth: '5-7 months' }
      ],
      business: [
        { name: 'Side Hustles', saturationScore: 50, avgRPM: 0.12, opportunity: 'medium', timeToGrowth: '3-5 months' },
        { name: 'Business Mindset', saturationScore: 65, avgRPM: 0.11, opportunity: 'medium', timeToGrowth: '5-6 months' }
      ]
    };

    return subNiches[mainNiche.toLowerCase()] || [];
  }

  /**
   * Calcule la diversité des comptes top
   */
  private static calculateDiversity(accounts: TikTokProfile[]): number {
    if (accounts.length === 0) return 0;

    const followerRanges = {
      '0-50k': 0,
      '50k-100k': 0,
      '100k-500k': 0,
      '500k-1m': 0,
      '1m+': 0
    };

    accounts.forEach(acc => {
      if (acc.followers < 50000) followerRanges['0-50k']++;
      else if (acc.followers < 100000) followerRanges['50k-100k']++;
      else if (acc.followers < 500000) followerRanges['100k-500k']++;
      else if (acc.followers < 1000000) followerRanges['500k-1m']++;
      else followerRanges['1m+']++;
    });

    // Calcule l'entropy (diversité)
    const totalAccounts = accounts.length;
    let entropy = 0;

    Object.values(followerRanges).forEach(count => {
      if (count > 0) {
        const p = count / totalAccounts;
        entropy -= p * Math.log2(p);
      }
    });

    return entropy / Math.log2(5); // Normalise entre 0 et 1
  }
}

/**
 * Trend Detector - Détecte les tendances dans une niche
 */
export class TrendDetector {
  /**
   * Détecte les formats vidéo gagnants
   */
  static detectWinningFormats(videoEngagements: { format: string; engagement: number }[]): Trend[] {
    const formatScores: Record<string, { total: number; count: number }> = {};

    videoEngagements.forEach(({ format, engagement }) => {
      if (!formatScores[format]) {
        formatScores[format] = { total: 0, count: 0 };
      }
      formatScores[format].total += engagement;
      formatScores[format].count += 1;
    });

    return Object.entries(formatScores)
      .map(([format, { total, count }]) => ({
        type: 'format' as const,
        name: format,
        usage: count,
        avgEngagement: Math.round((total / count) * 100) / 100,
        trending: count > 5 // Trending si utilisé > 5 fois
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);
  }

  /**
   * Détecte les musiques tendances
   */
  static detectTrendingMusics(videoMusics: { music: string; engagement: number }[]): Trend[] {
    const musicScores: Record<string, { total: number; count: number }> = {};

    videoMusics.forEach(({ music, engagement }) => {
      if (!musicScores[music]) {
        musicScores[music] = { total: 0, count: 0 };
      }
      musicScores[music].total += engagement;
      musicScores[music].count += 1;
    });

    return Object.entries(musicScores)
      .filter(([, { count }]) => count > 2) // Filter out musics used < 3 times
      .map(([music, { total, count }]) => ({
        type: 'music' as const,
        name: music,
        usage: count,
        avgEngagement: Math.round((total / count) * 100) / 100,
        trending: count > 5
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 10); // Top 10
  }

  /**
   * Détecte les hashtags tendances
   */
  static detectTrendingHashtags(videoHashtags: { hashtag: string; engagement: number }[]): Trend[] {
    const hashtagScores: Record<string, { total: number; count: number }> = {};

    videoHashtags.forEach(({ hashtag, engagement }) => {
      if (!hashtagScores[hashtag]) {
        hashtagScores[hashtag] = { total: 0, count: 0 };
      }
      hashtagScores[hashtag].total += engagement;
      hashtagScores[hashtag].count += 1;
    });

    return Object.entries(hashtagScores)
      .filter(([, { count }]) => count > 1)
      .map(([hashtag, { total, count }]) => ({
        type: 'hashtag' as const,
        name: hashtag,
        usage: count,
        avgEngagement: Math.round((total / count) * 100) / 100,
        trending: count > 5
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 15); // Top 15
  }

  /**
   * Détecte les types de hooks gagnants
   */
  static detectWinningHooks(): Trend[] {
    return [
      { type: 'hook', name: 'Question ("T\'as essayé?")', usage: 45, avgEngagement: 8.5, trending: true },
      { type: 'hook', name: 'Shocking ("OMG!")', usage: 38, avgEngagement: 7.9, trending: true },
      { type: 'hook', name: 'Pattern Interrupt', usage: 32, avgEngagement: 6.8, trending: false },
      { type: 'hook', name: 'Demo Visuelle', usage: 28, avgEngagement: 7.2, trending: true }
    ];
  }

  /**
   * Détecte les CTA (Call-to-Action) gagnants
   */
  static detectWinningCTAs(): Trend[] {
    return [
      { type: 'cta', name: 'Like si tu kiffes', usage: 89, avgEngagement: 8.9, trending: true },
      { type: 'cta', name: 'Essaie chez toi', usage: 72, avgEngagement: 8.2, trending: true },
      { type: 'cta', name: 'Follow pour plus', usage: 60, avgEngagement: 6.0, trending: false },
      { type: 'cta', name: 'Tag quelqu\'un', usage: 65, avgEngagement: 7.5, trending: true }
    ];
  }
}

/**
 * Hashtag Analyzer - Analyse intelligente des hashtags
 */
export class HashtagAnalyzer {
  /**
   * Catégorise un hashtag par sa portée
   */
  static categorizeHashtag(views: number): 'mega' | 'viral' | 'micro' | 'niche' {
    if (views > 1000000) return 'mega';
    if (views > 100000) return 'viral';
    if (views > 10000) return 'micro';
    return 'niche';
  }

  /**
   * Calcule le score de compétition (0-100)
   */
  static calculateCompetitionScore(usage: number, views: number): number {
    // Logique: plus de comptes utilisant = plus de compétition
    const competitionFromUsage = Math.min((usage / 1000) * 100, 50);
    // Plus de vues = plus de popularité = plus de compétition
    const competitionFromViews = Math.min((views / 1000000) * 50, 50);
    
    return Math.round(competitionFromUsage + competitionFromViews);
  }

  /**
   * Calcule le score de recommandation pour un hashtag
   * Considère: compétition basse, usage modéré, trend croissant
   */
  static calculateRecommendationScore(
    competition: number,
    usage: number,
    trending: boolean
  ): number {
    // Score baisse avec compétition élevée (mauvais)
    const competitionScore = Math.max(0, 100 - competition);
    
    // Score augmente avec usage modéré (sweet spot 100-500 uses)
    const usageScore = usage < 100 ? (usage / 100) * 50 : 
                       usage < 500 ? 50 :
                       Math.max(0, 50 - ((usage - 500) / 1000) * 50);
    
    // Trending boost
    const trendBonus = trending ? 25 : 0;
    
    return Math.round((competitionScore * 0.4) + (usageScore * 0.4) + trendBonus);
  }

  /**
   * Suggère les hashtags corrélés (co-utilisés)
   */
  static suggestCorrelatedHashtags(hashtag: string): string[] {
    // En production, cela viendrait d'une base de données
    const correlations: Record<string, string[]> = {
      'makeup': ['beauty', 'skincare', 'cosmetics', 'tutorial'],
      'fitness': ['gym', 'workout', 'health', 'bodybuilding'],
      'gaming': ['twitch', 'youtube', 'esports', 'streamer'],
      'business': ['entrepreneur', 'startup', 'finance', 'success']
    };

    return correlations[hashtag.toLowerCase()] || [];
  }

  /**
   * Crée une stratégie hashtag optimale
   */
  static createOptimalHashtagStrategy(availableHashtags: HashtagIntelligence[]): string[] {
    const strategy: string[] = [];
    
    // 1 mega hashtag
    const megaHashtags = availableHashtags.filter(h => h.category === 'mega').slice(0, 1);
    strategy.push(...megaHashtags.map(h => h.hashtag));
    
    // 2-3 hashtags viraux
    const viralHashtags = availableHashtags
      .filter(h => h.category === 'viral')
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3);
    strategy.push(...viralHashtags.map(h => h.hashtag));
    
    // 3-4 micro-hashtags (moins de compétition)
    const microHashtags = availableHashtags
      .filter(h => h.category === 'micro')
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 4);
    strategy.push(...microHashtags.map(h => h.hashtag));
    
    return strategy;
  }
}
