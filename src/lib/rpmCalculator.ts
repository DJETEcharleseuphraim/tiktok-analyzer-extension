import { RPMEstimate, TikTokProfile } from '../types/index';

/**
 * RPM Calculator - Calcule les estimations de revenus TikTok
 * Basé sur Creator Fund + Brand Partnerships
 */

export class RPMCalculator {
  // Base RPM rates par source
  private static readonly BASE_RPM = {
    creatorFund: {
      min: 0.02,
      max: 0.04,
      average: 0.03
    },
    brandPartnerships: {
      min: 0.05,
      max: 0.15,
      average: 0.10
    }
  };

  // Multiplicateurs par niche
  private static readonly NICHE_MULTIPLIERS: Record<string, number> = {
    // High-value niches
    finance: 1.8,
    business: 1.7,
    cryptocurrency: 1.9,
    stocks: 1.8,
    investing: 1.7,
    forex: 1.8,
    realestate: 1.6,
    
    // Medium-value niches
    technology: 1.4,
    softwaredev: 1.5,
    health: 1.3,
    fitness: 1.2,
    beauty: 1.1,
    fashion: 1.1,
    lifestyle: 1.0,
    education: 1.3,
    
    // Lower-value niches
    entertainment: 0.8,
    gaming: 0.9,
    dance: 0.7,
    comedy: 0.8,
    travel: 0.9,
    food: 0.85,
    music: 0.8,
    sports: 0.9,
    
    // Default
    default: 1.0
  };

  // Multiplicateurs géographiques
  private static readonly GEO_MULTIPLIERS: Record<string, number> = {
    // Tier 1 - High value
    US: 1.8,
    UK: 1.7,
    CA: 1.6,
    AU: 1.5,
    DE: 1.4,
    CH: 1.4,
    NL: 1.4,
    SE: 1.3,
    
    // Tier 2 - Medium value
    FR: 1.1,
    IT: 1.1,
    ES: 1.0,
    BR: 1.0,
    MX: 0.9,
    JP: 1.2,
    KR: 1.2,
    IN: 0.7,
    CN: 0.8,
    
    // Default
    default: 0.8
  };

  /**
   * Calcule l'estimation RPM complète pour un profil
   */
  static calculateRPM(profile: TikTokProfile, niche?: string): RPMEstimate {
    // Détecte la niche si non fournie
    const detectedNiche = niche || profile.niche || 'default';
    const nicheMultiplier = this.getNicheMultiplier(detectedNiche);
    const geoMultiplier = this.getGeoMultiplier(profile.country || 'default');
    
    // Calcule engagement bonus
    const engagementBonus = this.calculateEngagementBonus(profile.engagement);
    
    // Calcule les RPM finales
    const creatorFundRPM = this.BASE_RPM.creatorFund.average 
      * nicheMultiplier 
      * geoMultiplier 
      * engagementBonus;
    
    const brandRPM = this.BASE_RPM.brandPartnerships.average 
      * nicheMultiplier 
      * geoMultiplier 
      * engagementBonus;

    // Blended RPM (70% Creator Fund, 30% Brands - moyenne)
    const blendedRPM = (creatorFundRPM * 0.7) + (brandRPM * 0.3);

    // Calcule les revenus
    const dailyEarnings = (profile.totalViews / 1000) * blendedRPM;
    const monthlyEarnings = dailyEarnings * 30;
    const yearlyEarnings = dailyEarnings * 365;

    return {
      creatorFundRPM: Math.round(creatorFundRPM * 10000) / 10000,
      brandRPM: Math.round(brandRPM * 10000) / 10000,
      blendedRPM: Math.round(blendedRPM * 10000) / 10000,
      dailyEarnings: Math.round(dailyEarnings * 100) / 100,
      monthlyEarnings: Math.round(monthlyEarnings * 100) / 100,
      yearlyEarnings: Math.round(yearlyEarnings * 100) / 100,
      uncertainty: 35, // ±35% uncertainty range
      niches: [detectedNiche],
      geographies: [profile.country || 'Unknown']
    };
  }

  /**
   * Calcule l'estimation RPM basée sur les vues journalières
   */
  static calculateDailyRPM(dailyViews: number, niche: string = 'default', country: string = 'US'): number {
    const nicheMultiplier = this.getNicheMultiplier(niche);
    const geoMultiplier = this.getGeoMultiplier(country);
    
    const baseRPM = this.BASE_RPM.creatorFund.average;
    const adjustedRPM = baseRPM * nicheMultiplier * geoMultiplier;
    
    return (dailyViews / 1000) * adjustedRPM;
  }

  /**
   * Calcule le bonus d'engagement
   * Engagement plus élevé = RPM plus élevé
   */
  private static calculateEngagementBonus(engagement: number): number {
    // 0% engagement = 0.8x multiplier
    // 3% engagement = 1.0x multiplier (baseline)
    // 6% engagement = 1.2x multiplier
    // 10%+ engagement = 1.5x multiplier
    
    if (engagement < 1) return 0.8;
    if (engagement < 3) return 0.9 + (engagement / 10);
    if (engagement < 6) return 1.0 + (engagement / 30);
    if (engagement < 10) return 1.15 + (engagement / 50);
    return 1.5;
  }

  /**
   * Récupère le multiplicateur de niche
   */
  private static getNicheMultiplier(niche: string): number {
    const normalized = niche.toLowerCase().replace(/[\s-]/g, '');
    return this.NICHE_MULTIPLIERS[normalized] || this.NICHE_MULTIPLIERS.default;
  }

  /**
   * Récupère le multiplicateur géographique
   */
  private static getGeoMultiplier(country: string): number {
    const countryCode = country?.toUpperCase() || 'default';
    return this.GEO_MULTIPLIERS[countryCode] || this.GEO_MULTIPLIERS.default;
  }

  /**
   * Estime les revenus annuels basés sur les followers
   * Formule: followers * engagement % * RPM * 365
   */
  static estimateAnnualRevenue(
    followers: number,
    engagement: number,
    niche: string = 'default',
    country: string = 'US'
  ): number {
    const avgViewsPerVideo = followers * (engagement / 100);
    const videosPerYear = 365; // assume 1 video par jour
    const totalViewsPerYear = avgViewsPerVideo * videosPerYear;
    
    const rpm = this.calculateDailyRPM(totalViewsPerYear, niche, country);
    return rpm;
  }

  /**
   * Calcule combien de temps pour atteindre un revenu cible
   */
  static timeToRevenueTarget(
    currentMonthlyRevenue: number,
    targetMonthlyRevenue: number,
    growthRate: number // croissance mensuelle en %
  ): number {
    // Formule: targetMonthlyRevenue = currentMonthlyRevenue * (1 + growthRate)^months
    // months = log(target/current) / log(1 + growthRate)
    
    if (currentMonthlyRevenue <= 0 || targetMonthlyRevenue <= 0) return Infinity;
    if (growthRate <= 0) return Infinity;
    if (currentMonthlyRevenue >= targetMonthlyRevenue) return 0;
    
    const rate = 1 + (growthRate / 100);
    const months = Math.log(targetMonthlyRevenue / currentMonthlyRevenue) / Math.log(rate);
    
    return Math.ceil(months);
  }

  /**
   * Compare les RPM entre deux profils
   */
  static compareRPM(profile1: TikTokProfile, profile2: TikTokProfile): {
    profile1RPM: number;
    profile2RPM: number;
    difference: number;
    percentageDifference: number;
  } {
    const rpm1 = this.calculateRPM(profile1).blendedRPM;
    const rpm2 = this.calculateRPM(profile2).blendedRPM;
    
    return {
      profile1RPM: rpm1,
      profile2RPM: rpm2,
      difference: rpm2 - rpm1,
      percentageDifference: ((rpm2 - rpm1) / rpm1) * 100
    };
  }

  /**
   * Génère une gamme d'estimations RPM avec incertitude
   */
  static generateRPMRange(estimate: RPMEstimate): {
    low: number;
    mid: number;
    high: number;
  } {
    const uncertainty = estimate.uncertainty / 100;
    
    return {
      low: Math.round(estimate.blendedRPM * (1 - uncertainty) * 10000) / 10000,
      mid: estimate.blendedRPM,
      high: Math.round(estimate.blendedRPM * (1 + uncertainty) * 10000) / 10000
    };
  }

  /**
   * Calcule l'impact d'une augmentation d'engagement
   */
  static projectRevenueWithEngagementIncrease(
    currentProfile: TikTokProfile,
    engagementIncrease: number // en points de %
  ): RPMEstimate {
    const projectedProfile: TikTokProfile = {
      ...currentProfile,
      engagement: Math.min(currentProfile.engagement + engagementIncrease, 15)
    };
    
    return this.calculateRPM(projectedProfile);
  }

  /**
   * Calcule l'impact d'une augmentation de followers
   */
  static projectRevenueWithFollowerIncrease(
    currentProfile: TikTokProfile,
    followerIncrease: number
  ): RPMEstimate {
    const projectedProfile: TikTokProfile = {
      ...currentProfile,
      followers: currentProfile.followers + followerIncrease,
      totalViews: currentProfile.totalViews + (followerIncrease * 100) // assume 100 vues par follower
    };
    
    return this.calculateRPM(projectedProfile);
  }

  /**
   * Benchmarks - Les RPM moyennes par niche
   */
  static getNicheBenchmark(niche: string): {
    low: number;
    average: number;
    high: number;
  } {
    const multiplier = this.getNicheMultiplier(niche);
    const avgGeoMultiplier = 1.2; // global average
    
    const baseAvg = this.BASE_RPM.creatorFund.average;
    const adjustedAvg = baseAvg * multiplier * avgGeoMultiplier;
    
    return {
      low: Math.round(adjustedAvg * 0.7 * 10000) / 10000,
      average: Math.round(adjustedAvg * 10000) / 10000,
      high: Math.round(adjustedAvg * 1.5 * 10000) / 10000
    };
  }

  /**
   * Breakdown détaillé des revenus
   */
  static getRevenueBreakdown(estimate: RPMEstimate): {
    creatorFund: { daily: number; monthly: number; yearly: number };
    brandPartnerships: { daily: number; monthly: number; yearly: number };
    blended: { daily: number; monthly: number; yearly: number };
  } {
    const creatorFundDaily = (estimate.creatorFundRPM / 1000) * 1000000; // simplification
    const brandDaily = (estimate.brandRPM / 1000) * 1000000;
    
    return {
      creatorFund: {
        daily: Math.round(creatorFundDaily * 100) / 100,
        monthly: Math.round(creatorFundDaily * 30 * 100) / 100,
        yearly: Math.round(creatorFundDaily * 365 * 100) / 100
      },
      brandPartnerships: {
        daily: Math.round(brandDaily * 100) / 100,
        monthly: Math.round(brandDaily * 30 * 100) / 100,
        yearly: Math.round(brandDaily * 365 * 100) / 100
      },
      blended: {
        daily: estimate.dailyEarnings,
        monthly: estimate.monthlyEarnings,
        yearly: estimate.yearlyEarnings
      }
    };
  }
}

/**
 * Prédicteur de revenus - Formules avancées
 */
export class RevenuePredictor {
  /**
   * Prédit les revenus futurs basés sur la tendance historique
   */
  static predictFutureRevenue(
    historicalData: { date: number; revenue: number }[],
    daysAhead: number
  ): number[] {
    if (historicalData.length < 2) return [];

    // Calcule la croissance moyenne
    const growth = this.calculateGrowthRate(historicalData);
    
    // Génère les prédictions
    const predictions: number[] = [];
    const lastRevenue = historicalData[historicalData.length - 1].revenue;
    
    for (let i = 1; i <= daysAhead; i++) {
      const predicted = lastRevenue * Math.pow(1 + growth, i);
      predictions.push(Math.round(predicted * 100) / 100);
    }
    
    return predictions;
  }

  /**
   * Calcule le taux de croissance moyen
   */
  private static calculateGrowthRate(data: { date: number; revenue: number }[]): number {
    if (data.length < 2) return 0;
    
    const first = data[0].revenue;
    const last = data[data.length - 1].revenue;
    const days = data.length - 1;
    
    return Math.pow(last / first, 1 / days) - 1;
  }

  /**
   * Détecte les anomalies dans les données de revenus
   */
  static detectAnomalies(data: { date: number; revenue: number }[]): number[] {
    const anomalies: number[] = [];
    
    if (data.length < 3) return anomalies;

    const avgRevenue = data.reduce((sum, d) => sum + d.revenue, 0) / data.length;
    const stdDev = Math.sqrt(
      data.reduce((sum, d) => sum + Math.pow(d.revenue - avgRevenue, 2), 0) / data.length
    );

    // Marque comme anomalie si > 2 écarts-types
    data.forEach((d, i) => {
      if (Math.abs(d.revenue - avgRevenue) > 2 * stdDev) {
        anomalies.push(i);
      }
    });

    return anomalies;
  }
}
