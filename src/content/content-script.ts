/**
 * Content Script - S'exécute dans le contexte de la page TikTok
 * Extrait les données du DOM et communique avec le background
 */

import { TikTokScraper, APIService } from '../lib/scraper';

console.log('🎬 TikTok Analyzer Content Script loaded');

// Variables globales
let currentUsername: string = '';
let isAnalyzing: boolean = false;

/**
 * Initialise le content script
 */
function init() {
  // Ajoute un listener pour les messages du background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    handleMessage(request, sendResponse);
  });

  // Injecte un bouton d'analyse dans la page
  injectAnalyzeButton();

  // Observe les changements de page (route change)
  observePageChanges();
}

/**
 * Gère les messages du background
 */
function handleMessage(request: any, sendResponse: (response: any) => void) {
  console.log('📨 Content Script received message:', request.type);

  switch (request.type) {
    case 'SCRAPE_PROFILE':
      handleScrapeProfile(sendResponse);
      break;

    case 'SCRAPE_VIDEOS':
      handleScrapeVideos(sendResponse);
      break;

    case 'GET_CURRENT_PAGE':
      sendResponse({
        username: currentUsername,
        url: window.location.href,
        type: detectPageType()
      });
      break;

    case 'INJECT_BUTTON':
      injectAnalyzeButton();
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ error: 'Unknown message type' });
  }
}

/**
 * Scrape le profil actuel
 */
function handleScrapeProfile(sendResponse: (response: any) => void) {
  try {
    const profile = TikTokScraper.scrapeProfileFromDOM();
    
    if (profile) {
      currentUsername = profile.username;
      sendResponse({
        success: true,
        profile
      });
    } else {
      sendResponse({
        success: false,
        error: 'Could not scrape profile'
      });
    }
  } catch (error) {
    console.error('Error scraping profile:', error);
    sendResponse({
      success: false,
      error: String(error)
    });
  }
}

/**
 * Scrape les vidéos du profil
 */
async function handleScrapeVideos(sendResponse: (response: any) => void) {
  try {
    // Scroll jusqu'au bout pour charger toutes les vidéos
    await scrollToLoadAllVideos();

    const videos = await TikTokScraper.scrapeVideosFromDOM();

    sendResponse({
      success: true,
      videos,
      count: videos.length
    });
  } catch (error) {
    console.error('Error scraping videos:', error);
    sendResponse({
      success: false,
      error: String(error)
    });
  }
}

/**
 * Injecte un bouton "Analyser" dans la page
 */
function injectAnalyzeButton() {
  // Vérifie si on est sur un profil TikTok
  if (!window.location.href.includes('tiktok.com/@')) {
    return;
  }

  // Crée le bouton
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'tiktok-analyzer-button-container';
  buttonContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
  `;

  const button = document.createElement('button');
  button.textContent = '🔍 Analyser ce compte';
  button.id = 'tiktok-analyzer-button';
  button.style.cssText = `
    padding: 12px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: bold;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    font-size: 14px;
  `;

  button.onmouseover = () => {
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
  };

  button.onmouseout = () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
  };

  button.onclick = () => {
    handleAnalyzeButtonClick();
  };

  buttonContainer.appendChild(button);

  // Ajoute le bouton à la page (ou le remplace s'il existe)
  const existingContainer = document.getElementById('tiktok-analyzer-button-container');
  if (existingContainer) {
    existingContainer.remove();
  }
  document.body.appendChild(buttonContainer);
}

/**
 * Gère le clic sur le bouton "Analyser"
 */
async function handleAnalyzeButtonClick() {
  if (isAnalyzing) return;

  isAnalyzing = true;
  const button = document.getElementById('tiktok-analyzer-button') as HTMLButtonElement;
  const originalText = button.textContent;
  button.textContent = '⏳ Analyse en cours...';
  button.disabled = true;

  try {
    // Scrape le profil
    const profile = TikTokScraper.scrapeProfileFromDOM();

    if (!profile) {
      throw new Error('Could not scrape profile');
    }

    currentUsername = profile.username;

    // Scrape les vidéos
    await scrollToLoadAllVideos();
    const videos = await TikTokScraper.scrapeVideosFromDOM();

    // Envoie les données au background
    const response = await APIService.sendMessageToBackground({
      type: 'ANALYZE_PROFILE',
      profile,
      videos,
      sourceTab: 'content-script'
    });

    if (response.success) {
      button.textContent = '✅ Analyse complète!';
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        isAnalyzing = false;
      }, 2000);

      // Ouvre le popup de l'extension
      chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
    } else {
      throw new Error(response.error || 'Analysis failed');
    }
  } catch (error) {
    console.error('Analysis error:', error);
    button.textContent = '❌ Erreur!';
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
      isAnalyzing = false;
    }, 2000);
  }
}

/**
 * Détecte le type de page TikTok actuelle
 */
function detectPageType(): 'profile' | 'video' | 'feed' | 'unknown' {
  const url = window.location.href;
  
  if (url.includes('/@')) return 'profile';
  if (url.includes('/video/')) return 'video';
  if (url === 'https://www.tiktok.com/') return 'feed';
  
  return 'unknown';
}

/**
 * Observe les changements de route pour réinjecter le bouton
 */
function observePageChanges() {
  let lastUrl = window.location.href;

  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      
      // Réinjecte le bouton si on est sur un profil
      setTimeout(() => {
        injectAnalyzeButton();
      }, 500);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

/**
 * Scroll jusqu'au bout pour charger toutes les vidéos
 */
async function scrollToLoadAllVideos(): Promise<void> {
  return new Promise((resolve) => {
    let lastHeight = document.body.scrollHeight;
    let scrollCount = 0;
    const maxScrolls = 5; // Limite pour ne pas scroll à l'infini

    const interval = setInterval(() => {
      // Scroll down
      window.scrollBy(0, window.innerHeight);
      
      const newHeight = document.body.scrollHeight;
      
      if (newHeight === lastHeight || scrollCount >= maxScrolls) {
        clearInterval(interval);
        resolve();
      }
      
      lastHeight = newHeight;
      scrollCount++;
    }, 1000);

    // Timeout de sécurité
    setTimeout(() => {
      clearInterval(interval);
      resolve();
    }, 10000);
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
