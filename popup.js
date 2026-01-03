// Popup script for Medium to Freedium extension

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

// Check if page is a Medium article (URL or content-based)
async function checkIfMediumArticle(tabId, url) {
  // First check URL pattern (fast check)
  if (isMediumUrl(url)) {
    return true;
  }
  
  // For custom domains, check page content
  try {
    // Only check http/https pages
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
    // Can't access page
    return false;
  }
}

// Get freedium URL from Medium URL
function getFreediumUrl(mediumUrl) {
  try {
    const urlObj = new URL(mediumUrl);
    
    // For standard Medium domains, use pathname
    if (isMediumUrl(mediumUrl)) {
      let path = urlObj.pathname;
      if (urlObj.search) {
        path += urlObj.search;
      }
      return `https://freedium-mirror.cfd${path}`;
    }
    
    // For custom domains, pass the full URL as path
    // freedium-mirror.cfd format: https://freedium-mirror.cfd/https://customdomain.com/article
    return `https://freedium-mirror.cfd/${mediumUrl}`;
  } catch (e) {
    return '';
  }
}

// Update popup UI based on current tab
async function updatePopup() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url) {
      showStatus(false, 'No active tab');
      return;
    }
    
    // Check both URL pattern and page content for custom domains
    const isMedium = await checkIfMediumArticle(tab.id, tab.url);
    const statusDiv = document.getElementById('status');
    const redirectBtn = document.getElementById('redirectBtn');
    const urlPreview = document.getElementById('urlPreview');
    
    if (isMedium) {
      // Show Medium detected status
      statusDiv.className = 'status medium';
      statusDiv.innerHTML = `
        <div class="status-icon">✓</div>
        <div class="status-text">Medium Article Detected</div>
      `;
      
      // Enable redirect button
      redirectBtn.disabled = false;
      redirectBtn.onclick = () => {
        const freediumUrl = getFreediumUrl(tab.url);
        // Open freedium in a new tab
        chrome.tabs.create({ url: freediumUrl });
        window.close();
      };
      
      // Show URL preview
      const freediumUrl = getFreediumUrl(tab.url);
      urlPreview.textContent = `Will redirect to: ${freediumUrl}`;
      urlPreview.style.display = 'block';
    } else {
      // Show not Medium status
      statusDiv.className = 'status not-medium';
      statusDiv.innerHTML = `
        <div class="status-icon">ℹ️</div>
        <div class="status-text">Not a Medium Article</div>
      `;
      
      // Disable redirect button
      redirectBtn.disabled = true;
      redirectBtn.onclick = null;
      
      // Hide URL preview
      urlPreview.style.display = 'none';
    }
  } catch (e) {
    console.error('Error updating popup:', e);
    showStatus(false, 'Error loading tab information');
  }
}

function showStatus(isMedium, message) {
  const statusDiv = document.getElementById('status');
  statusDiv.className = `status ${isMedium ? 'medium' : 'not-medium'}`;
  statusDiv.innerHTML = `
    <div class="status-icon">${isMedium ? '✓' : 'ℹ️'}</div>
    <div class="status-text">${message}</div>
  `;
}

// Update popup when it opens
updatePopup();

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id === tabId) {
        updatePopup();
      }
    });
  }
});

