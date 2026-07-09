/**
 * Background Service Worker - Gère la logique métier de l'extension
 * - Traite les données scrappées
 * - Gère la base de données
 * - Coordonne les analyses
 */

import { db } from '../lib/database';
import { RPMCalculator, RevenuePredictor } from '../lib/rpmCalculator';
import { NicheDetector, SaturationAnalyzer, TrendDetector, HashtagAnalyzer } from '../lib/nicheAnalysis';
import { StorageService } from '../lib/scraper';
import { TikTokProfile, TikTokVideo, NicheAnalysis, ExtensionSettings } from '../types/index';

console.log('🎬 TikTok Analyzer Background Service Worker started');

// Variables globales
let currentAnalysis: any = null;
let extensionSettings: ExtensionSettings | null = null;

/**
 * Initialise le service worker
 */
async function init() {
  console.log('📋 Initializing Background Service Worker...');
  
  // Charge les settings
  extensionSettings = await StorageService.getLocal('extensionSettings');
  
  if (!extensionSettings) {
    extensionSettings = {
      autoLogin: false,
      rpmBaseCreatorFund: 0.03,
      rpmBaseBrand: 0.10,
      alertsEnabled: true,
      emailNotifications: false,
      watchList: [],
      lastSync: 0
    };
    await StorageService.setLocal('extensionSettings', extensionSettings);
  }

  // Setup message listeners
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    handleMessage(request, sender, sendResponse);
  });

  console.log('✅ Background Service Worker initialized');
}

/**
 * Gère les messages depuis le content script et popup
 */
function handleMessage(request: any, sender: any, sendResponse: (response: any) => void) {
  console.log('📨 Background received:', request.type);

  // Toutes les opérations asynchrones
  (async () => {
    try {
      switch (request.type) {
        case 'ANALYZE_PROFILE':
          await handleAnalyzeProfile(request, sendResponse);
          break;

        case 'GET_ANALYSIS':
          sendResponse({ success: true, analysis: currentAnalysis });
          break;

        case 'SAVE_TO_WATCHLIST':
          await handleAddToWatchList(request, sendResponse);
          break;

        case 'GET_WATCHLIST':
          await handleGetWatchList(sendResponse);
          break;

        case 'GET_PROFILE_HISTORY':
          await handleGetProfileHistory(request, sendResponse);
          break;

        case 'ADD_REVENUE_ENTRY':
          await handleAddRevenueEntry(request, sendResponse);
          break;

        case 'GET_REVENUE_ENTRIES':
          await handleGetRevenueEntries(request, sendResponse);
          break;

        case 'SET_SETTINGS':
          await handleSetSettings(request, sendResponse);
          break;

        case 'GET_SETTINGS':
          sendResponse({ success: true, settings: extensionSettings });
          break;

        case 'OPEN_POPUP':
          chrome.action.openPopup();
          sendResponse({ success: true });
          break;

        case 'CREATE_ALERT':
          await handleCreateAlert(request, sendResponse);
          break;

        default:
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: String(error) });
    }
  })();

  // Retourne true pour indiquer que la réponse sera asynchrone
  return true;
}

/**
 * Analyse un profil complet
 */
async function handleAnalyzeProfile(request: any, sendResponse: (response: any) => void) {
  try {
    const { profile, videos } = request;

    console.log(`🔍 Analyzing profile: ${profile.username}`);

    // Sauvegarde le profil
    await db.saveProfile(profile);

    // Sauvegarde les vidéos
    if (videos && videos.length > 0) {
      await db.saveVideos(videos);
    }

    // Calcule le RPM
    const rpmEstimate = RPMCalculator.calculateRPM(profile);

    // Détecte la niche
    const allHashtags = videos?.flatMap((v: TikTokVideo) => v.hashtags) || [];
    const niche = NicheDetector.detectNiche(profile, allHashtags);

    // Analyse la saturation (simulation avec données de vidéos)
    const avgEngagement = videos?.length > 0 
      ? videos.reduce((sum: number, v: TikTokVideo) => sum + v.engagement, 0) / videos.length 
      : 0;

    const saturationScore = SaturationAnalyzer.calculateSaturationScore(
      [profile], // Simplifié - en prod, utiliser les top accounts de la niche
      avgEngagement,
      rpmEstimate.blendedRPM
    );

    const potential = SaturationAnalyzer.evaluatePotential(
      saturationScore,
      rpmEstimate.blendedRPM,
      avgEngagement
    );

    const subNiches = SaturationAnalyzer.identifySubNiches(niche);

    // Détecte les tendances
    const videoFormats = videos?.map((v: TikTokVideo) => ({ 
      format: v.format, 
      engagement: v.engagement 
    })) || [];
    const winningFormats = TrendDetector.detectWinningFormats(videoFormats);

    // Crée l'analyse complète
    currentAnalysis = {
      profile,
      videos,
      rpm: rpmEstimate,
      niche,
      saturationScore,
      potential,
      subNiches,
      trends: {
        formats: winningFormats,
        hooks: TrendDetector.detectWinningHooks(),
        ctas: TrendDetector.detectWinningCTAs()
      },
      analysis: {
        avgEngagement,
        avgViewsPerVideo: videos?.length > 0 
          ? videos.reduce((sum: number, v: TikTokVideo) => sum + v.views, 0) / videos.length 
          : 0,
        topVideos: videos?.slice(0, 10) || [],
        recommendation: generateRecommendation(saturationScore, potential, niche)
      },
      analyzedAt: Date.now()
    };

    // Sauvegarde l'analyse
    await db.niches.put({
      niche,
      saturationScore,
      topAccounts: [profile],
      avgFollowers: profile.followers,
      avgEngagement,
      avgRPM: rpmEstimate.blendedRPM,
      growthRate: 0, // TODO: calculer à partir de l'historique
      recommendedAction: potential,
      subNiches,
      trends: winningFormats,
      lastUpdated: Date.now()
    } as any);

    // Crée une alerte si saturé
    if (saturationScore > 75) {
      await db.addPersonalAlert({
        id: Date.now(),
        type: 'recommendation',
        title: '⚠️ Niche saturée',
        message: `La niche "${niche}" est très saturée (${saturationScore}%). Considere une sous-niche ou niche crossover.`,
        createdAt: Date.now(),
        isRead: false
      });
    }

    sendResponse({
      success: true,
      analysis: currentAnalysis
    });

  } catch (error) {
    console.error('Error analyzing profile:', error);
    sendResponse({
      success: false,
      error: String(error)
    });
  }
}

/**
 * Ajoute un compte à la watch list
 */
async function handleAddToWatchList(request: any, sendResponse: (response: any) => void) {
  try {
    const { username } = request;
    
    await db.addToWatchList(username);
    
    if (extensionSettings) {
      extensionSettings.watchList.push(username);
      await StorageService.setLocal('extensionSettings', extensionSettings);
    }

    sendResponse({
      success: true,
      message: `${username} added to watch list`
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: String(error)
    });
  }
}

/**
 * Récupère la watch list
 */
async function handleGetWatchList(sendResponse: (response: any) => void) {
  try {
    const watchList = await db.getWatchList();
    
    sendResponse({
      success: true,
      watchList
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: String(error)
    });
  }
}

/**
 * Récupère l'historique d'un profil
 */
async function handleGetProfileHistory(request: any, sendResponse: (response: any) => void) {
  try {
    const { username, days } = request;
    
    const history = await db.getProfileHistory(username, days || 30);
    
    sendResponse({
      success: true,
      history
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: String(error)
    });
  }
}

/**
 * Ajoute une entrée de revenu
 */
async function handleAddRevenueEntry(request: any, sendResponse: (response: any) => void) {
  try {
    const { earnings, views } = request;
    
    const entry = {
      date: Date.now(),
      earnings,
      views,
      rpmCalculated: views > 0 ? (earnings / views) * 1000 : 0
    };

    await db.addRevenueEntry(entry);

    sendResponse({
      success: true,
      entry
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: String(error)
    });
  }
}

/**
 * Récupère les entrées de revenu
 */
async function handleGetRevenueEntries(request: any, sendResponse: (response: any) => void) {
  try {
    const { days } = request;
    
    const entries = await db.getRevenueEntries(days || 30);
    const totalRevenue = await db.calculateTotalRevenue(days || 30);
    
    sendResponse({
      success: true,
      entries,
      totalRevenue
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: String(error)
    });
  }
}

/**
 * Met à jour les settings
 */
async function handleSetSettings(request: any, sendResponse: (response: any) => void) {
  try {
    const { settings } = request;
    
    extensionSettings = {
      ...extensionSettings,
      ...settings,
      lastSync: Date.now()
    };

    await StorageService.setLocal('extensionSettings', extensionSettings);

    sendResponse({
      success: true,
      settings: extensionSettings
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: String(error)
    });
  }
}

/**
 * Crée une alerte
 */
async function handleCreateAlert(request: any, sendResponse: (response: any) => void) {
  try {
    const { type, title, message } = request;
    
    const alert = {
      id: Date.now(),
      type,
      title,
      message,
      createdAt: Date.now(),
      isRead: false
    };

    await db.addPersonalAlert(alert);

    sendResponse({
      success: true,
      alert
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: String(error)
    });
  }
}

/**
 * Génère une recommandation basée sur l'analyse
 */
function generateRecommendation(saturationScore: number, potential: string, niche: string): string {
  if (potential === 'launch') {
    return `✅ Excellente opportunité! La niche "${niche}" est peu saturée avec un bon potentiel de croissance.`;
  }
  
  if (potential === 'consider') {
    return `🟡 À considérer. La niche "${niche}" a du potentiel mais avec une certaine concurrence.`;
  }
  
  return `❌ À éviter. La niche "${niche}" est très saturée (${saturationScore}/100). Explore les sous-niches recommandées.`;
}

/**
 * Nettoyage périodique
 */
async function cleanupOldData() {
  console.log('🧹 Cleaning up old data...');
  await db.clearOldData(90); // Garde 90 jours de données
}

// Exécute le nettoyage tous les jours
setInterval(cleanupOldData, 24 * 60 * 60 * 1000);

// Initialize
init();
