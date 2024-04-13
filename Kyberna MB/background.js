// Function to dynamically inject a CSS file into the page
function injectCssFile(tabId, filename) {
  chrome.scripting.insertCSS({
      target: { tabId: tabId },
      files: [filename]
  }, () => {
      console.log(`CSS file ${filename} injected into tab ${tabId}`);
  });
}

// Function to determine the CSS file based on the stored theme
function determineCssFile(result) {
  if (result.selectedTheme === 'theme2') {
      return 'styles2.css';
  } else if (result.selectedTheme === 'theme3') {
      return 'styles3.css';
  }
  return 'styles.css';
}

// Function to apply the theme based on the current URL and stored theme
function applyThemeOnTab(tabId, url) {
  if (url.includes("https://sis.ssakhk.cz/")) {
      chrome.storage.local.get(['selectedTheme'], function(result) {
          let cssFile = determineCssFile(result);
          console.log(`Applying ${cssFile} for theme ${result.selectedTheme || 'default'} on tab ${tabId}`);
          injectCssFile(tabId, cssFile);
      });
  } else {
      console.log(`[KybernaMB] URL does not match or tab is undefined. No CSS injected.`);
  }
}

// Listening to when a tab is updated to apply the theme
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'loading') {
      applyThemeOnTab(tabId, tab.url);
  }
});

// Listening to when a tab is activated to apply the theme
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab) {
      applyThemeOnTab(tab.id, tab.url);
  });
});
  
let lastReloadTimes = {};

// Function to reload a specific tab
function reloadTab(tabId) {
  chrome.tabs.reload(tabId, () => {
    console.log(`Tab with ID: ${tabId} reloaded.`);
    lastReloadTimes[tabId] = Date.now();
  });
}

// Listening for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "refreshTab") {
    reloadTab(sender.tab.id);
  }
});
