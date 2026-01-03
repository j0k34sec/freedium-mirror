// Service worker for Medium to Freedium redirector

// Check if URL is a Medium article (by domain)
function isMediumUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'medium.com' || urlObj.hostname.endsWith('.medium.com');
  } catch (e) {
    return false;
  }
}

// Function to detect Medium articles by checking page content
// This will be injected into pages to check for Medium indicators
function detectMediumInPage() {
  // Check for Medium meta tags
  const generatorMeta = document.querySelector('meta[name="generator"][content*="Medium"]');
  if (generatorMeta) return true;
  
  // Check for Medium-specific class names
  const mediumClasses = [
    'metabar',
    'postArticle',
    'postArticle-content',
    'u-fontSize',
    'graf',
    'section-content'
  ];
  for (const className of mediumClasses) {
    if (document.querySelector(`.${className}`)) return true;
  }
  
  // Check for Medium-specific data attributes
  if (document.querySelector('[data-source="medium"]')) return true;
  
  // Check for Medium's JavaScript variables
  if (window.Medium || window.__APOLLO_STATE__) return true;
  
  // Check for Medium CDN in images/scripts
  const scripts = Array.from(document.scripts);
  const hasMediumCDN = scripts.some(script => 
    script.src && (script.src.includes('medium.com') || script.src.includes('cdn-client.medium.com'))
  );
  if (hasMediumCDN) return true;
  
  // Check for Medium-specific article structure
  const article = document.querySelector('article');
  if (article) {
    const hasMediumStructure = 
      article.querySelector('.postArticle-content') ||
      article.querySelector('.section-content') ||
      article.querySelector('[data-source="medium"]');
    if (hasMediumStructure) return true;
  }
  
  return false;
}

// Extract path from Medium URL for freedium redirect
function getMediumPath(url) {
  try {
    const urlObj = new URL(url);
    
    // For standard Medium domains, use pathname
    if (isMediumUrl(url)) {
      let path = urlObj.pathname;
      if (urlObj.search) {
        path += urlObj.search;
      }
      return path;
    }
    
    // For custom domains, pass the full URL as path
    // freedium-mirror.cfd format: https://freedium-mirror.cfd/https://customdomain.com/article
    return `/${url}`;
  } catch (e) {
    return '';
  }
}

// Check if page is a Medium article (URL or content-based)
async function checkIfMediumArticle(tabId, url) {
  // First check URL pattern (fast check)
  if (isMediumUrl(url)) {
    return true;
  }
  
  // For custom domains, check page content
  try {
    // Only check http/https pages (not chrome://, about:, etc.)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }
    
    // Inject script to check page content
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: detectMediumInPage
    });
    
    return results && results[0] && results[0].result === true;
  } catch (e) {
    // Can't access page (e.g., chrome:// pages, extensions, etc.)
    return false;
  }
}

// Update badge based on current tab
async function updateBadge(tabId, url) {
  const isMedium = await checkIfMediumArticle(tabId, url);
  
  if (isMedium) {
    // Set green badge with checkmark
    chrome.action.setBadgeText({ text: '✓', tabId: tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#00ff00', tabId: tabId });
  } else {
    // Clear badge
    chrome.action.setBadgeText({ text: '', tabId: tabId });
  }
}

// Listen for tab updates to detect Medium articles
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only process when page is fully loaded
  if (changeInfo.status === 'complete' && tab.url) {
    updateBadge(tabId, tab.url);
  }
});

// Listen for tab activation to update badge
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      updateBadge(activeInfo.tabId, tab.url);
    }
  } catch (e) {
    // Tab might not be accessible
    console.error('Error getting tab:', e);
  }
});

// Handle extension icon click - redirect to freedium
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url) return;
  
  const isMedium = await checkIfMediumArticle(tab.id, tab.url);
  if (isMedium) {
    const path = getMediumPath(tab.url);
    // For custom domains, path already includes the full URL
    // For standard domains, path is just the pathname
    const freediumUrl = `https://freedium-mirror.cfd${path}`;
    
    // Open freedium in a new tab
    chrome.tabs.create({ url: freediumUrl });
  }
});

// Initialize badge on extension load
chrome.runtime.onInstalled.addListener(() => {
  // Check current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      updateBadge(tabs[0].id, tabs[0].url);
    }
  });
});

