
# Medium to Freedium Redirector

A Chrome extension that detects Medium articles and redirects them to [freedium-mirror.cfd](https://freedium-mirror.cfd/) for unrestricted access without paywalls.

## Quick Start

1. **Install in Chrome**: Go to `chrome://extensions/` → Enable Developer mode → Click "Load unpacked" → Select the `freedium-mirror` folder
2. **Use**: Visit any Medium article → See green badge (✓) → Click extension icon → Click "Redirect to Freedium"

See [Installation in Chrome](#installation-in-chrome) for detailed instructions.

## Features

- ✅ **Automatic Detection**: Monitors active tabs for Medium articles
- 🟢 **Visual Indicator**: Green badge with checkmark appears on extension icon when on a Medium article
- 🔄 **Manual Redirect**: Click the extension icon to redirect to freedium-mirror.cfd
- 📍 **Path Preservation**: Maintains full article path in redirect URL

## Installation in Chrome

Follow these step-by-step instructions to install the extension in Google Chrome:

### Prerequisites

✅ **Icons are already generated** - The extension includes all required icon files (icon16.png, icon48.png, icon128.png) in the `icons/` folder.

If you need to regenerate icons, see the [Icon Generation](#icon-generation-optional) section below.

### Step-by-Step Installation

#### Step 1: Open Chrome Extensions Page

1. Launch **Google Chrome** browser
2. In the address bar, type: `chrome://extensions/`
3. Press **Enter** to navigate to the Extensions management page

   *Alternative method:*
   - Click the **three-dot menu** (⋮) in the top-right corner
   - Go to **More tools** → **Extensions**

#### Step 2: Enable Developer Mode

1. Look for the **Developer mode** toggle switch in the **top-right corner** of the Extensions page
2. Toggle the switch to **ON** (it will turn blue/enabled)
3. You should see additional options appear: "Load unpacked", "Pack extension", etc.

#### Step 3: Load the Extension

1. Click the **"Load unpacked"** button (appears after enabling Developer mode)
2. A file browser window will open
3. Navigate to the `freedium-mirror` folder (the directory containing `manifest.json`)
4. **Select the folder** (click on it once to highlight it)
5. Click **"Select Folder"** (or "Open" on Windows)

#### Step 4: Verify Installation

1. The extension should now appear in your extensions list
2. You should see:
   - Extension name: **"Medium to Freedium Redirector"**
   - Extension icon (green "M" icon)
   - Version: 1.0.0
   - Toggle switch to enable/disable the extension (make sure it's ON)

#### Step 5: Pin the Extension (Optional but Recommended)

1. Click the **puzzle piece icon** (🧩) in Chrome's toolbar (extensions menu)
2. Find "Medium to Freedium Redirector" in the list
3. Click the **pin icon** (📌) next to it
4. The extension icon will now appear in your toolbar for easy access

### Icon Generation (Optional)

The icons are already included, but if you need to regenerate them:

#### Method 1: Using Python (Recommended)

1. Install Pillow:
   ```bash
   pip install Pillow
   ```

2. Run the icon generator:
   ```bash
   cd icons
   python generate_icons.py
   ```

3. The icons will be created in the `icons/` directory.

#### Method 2: Using HTML Generator

1. Open `icons/generate_icons.html` in your web browser
2. Click the "Download" buttons for each icon size
3. Save them as `icon16.png`, `icon48.png`, and `icon128.png` in the `icons/` directory

### Troubleshooting Installation

- **"Load unpacked" button not visible**: Make sure Developer mode is enabled (toggle should be ON)
- **"Manifest file is missing or unreadable"**: Ensure you selected the correct folder (the one containing `manifest.json`)
- **"Icons are missing"**: The icons should already be in the `icons/` folder. If missing, use one of the icon generation methods above
- **Extension not appearing**: Refresh the Extensions page (F5) and check for error messages
- **Extension disabled**: Make sure the toggle switch next to the extension is ON

## Usage

### How to Use the Extension

1. **Visit a Medium Article**
   - Navigate to any Medium article URL (e.g., `https://medium.com/@username/article-slug`)
   - The extension automatically detects Medium articles

2. **Check the Badge Indicator**
   - Look at the extension icon in your Chrome toolbar
   - If you see a **😊 smiley emoji**, you're already on freedium-mirror.cfd
   - If you see a **green badge with a checkmark (✓)**, you're on a Medium article
   - If there's no badge, you're not on a Medium page

3. **Redirect to Freedium**
   - **Click the extension icon** in your Chrome toolbar
   - If you're on a Medium article, it will **automatically open the freedium-mirror.cfd version in a new tab**
   - Your current tab stays open, so you can compare both versions
   - If you're not on a Medium article, nothing happens (no redirect)

### Example

1. You visit: `https://medium.com/@techwriter/awesome-article`
2. Extension badge turns **green (✓)** indicating Medium article detected
3. You **click the extension icon** once
4. A **new tab automatically opens** with: `https://freedium-mirror.cfd/@techwriter/awesome-article`
5. Your original Medium article tab remains open for comparison
6. When you're on the freedium-mirror.cfd page, the badge shows **😊 smiley emoji** to indicate you're already on the freedium version

### How It Works

- The extension monitors your active tab and shows different badge indicators:
  - **😊 Smiley emoji**: You're already on freedium-mirror.cfd
  - **✓ Green checkmark**: You're on a Medium article (ready to redirect)
  - **No badge**: You're not on a Medium page
- When you visit a Medium article, the badge turns green. The extension detects:
  - **Standard Medium URLs**: `medium.com` or `*.medium.com` domains
  - **Custom Domain Medium Articles**: Articles hosted on custom domains (by checking page content for Medium indicators)
- Clicking the extension icon directly opens the freedium-mirror.cfd version in a new tab
- The redirect converts the Medium URL to the freedium-mirror.cfd format:
  - `https://medium.com/@user/article` → `https://freedium-mirror.cfd/@user/article`
  - `https://username.medium.com/article` → `https://freedium-mirror.cfd/article`
  - `https://customdomain.com/article` → `https://freedium-mirror.cfd/https://customdomain.com/article` (for custom domains)

## About freedium-mirror.cfd

[freedium-mirror.cfd](https://freedium-mirror.cfd/) is a service that provides access to Medium articles without paywalls or login requirements. It mirrors Medium content, allowing users to read articles freely.

## File Structure

```
freedium-mirror/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for detection and redirect
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic
├── icons/
│   ├── icon16.png        # 16x16 icon
│   ├── icon48.png        # 48x48 icon
│   ├── icon128.png       # 128x128 icon
│   ├── generate_icons.html  # HTML icon generator
│   └── generate_icons.py    # Python icon generator
└── README.md             # This file
```

## Permissions

The extension requires the following permissions:

- **tabs**: To detect the current active tab and check if it's a Medium article
- **activeTab**: To access the current tab's URL
- **storage**: To maintain badge state
- **scripting**: To inject scripts that detect Medium articles on custom domains (by checking page content)

Host permissions are granted for:
- `*://medium.com/*` - Standard Medium domains
- `*://*.medium.com/*` - Medium subdomains
- `<all_urls>` - Required to detect Medium articles on custom domains (the extension only checks page content, it doesn't access or modify any data)

## Development

### Testing

1. Load the extension in Chrome (see Installation)
2. Visit various Medium article URLs:
   - `https://medium.com/@username/article-slug`
   - `https://username.medium.com/article-slug`
   - Custom domain Medium articles (e.g., `https://customdomain.com/article`)
   - Articles with query parameters
3. Verify:
   - Badge turns green on Medium articles (both standard and custom domains)
   - Badge clears on non-Medium pages
   - Redirect functionality works correctly for all Medium article types

### Troubleshooting

- **Badge not appearing**: 
  - Make sure you're on a Medium article URL (check the address bar)
  - For custom domain Medium articles, wait a moment for the page to fully load - the extension checks page content
  - Some custom domains may not be detected if they don't have Medium's standard indicators
- **Redirect not working**: 
  - Check browser console for errors (F12 → Console)
  - Make sure the page has fully loaded before clicking redirect
  - For custom domains, the extension uses a different URL format
- **Icons missing**: Generate icons using one of the methods in Installation Step 1
- **Custom domain not detected**: The extension checks for Medium-specific HTML elements, meta tags, and JavaScript. If a custom domain doesn't use Medium's standard structure, it may not be detected

## License

This extension is provided as-is for educational purposes. Please respect Medium's terms of service and use responsibly.

## Disclaimer

This extension is not affiliated with Medium or freedium-mirror.cfd. Use at your own discretion.

=======
# freedium-mirror
