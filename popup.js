function setStatusDot(online) {
  const statusDot = document.querySelector('#status');
  if (online) {
    statusDot.style.backgroundColor = '#00ff00';
  } else {
    statusDot.style.backgroundColor = '#ff0000';
  }
}

function checkStatus() {
  axios.get('https://sis.ssakhk.cz/')
    .then(response => {
      if (response.status === 200) {
        setStatusDot(true);
      } else {
        setStatusDot(false);
      }
    })
    .catch(() => setStatusDot(false));
}

window.addEventListener('load', () => {
  checkStatus();
  setInterval(checkStatus, 30000); // 30 seconds
});

// Current version of the extension
chrome.runtime.getManifest().version;

// Update the version number
document.getElementById("version").textContent = "v" + chrome.runtime.getManifest().version;

// Save the hover toggle state to local storage
function saveHoverToggle(enabled) {
  chrome.storage.local.set({ 'hoverEnabled': enabled }, function() {
    console.log('Hover feature is set to ' + (enabled ? 'enabled' : 'disabled'));

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: updateHoverState,
          args: [enabled]
        });
      }
    });
  });
}

// Load the hover toggle state when the popup opens
function loadHoverToggle() {
  chrome.storage.local.get(['hoverEnabled'], function(result) {
    const toggleHover = document.getElementById("toggleHover");
    if (result.hoverEnabled !== undefined) {
      toggleHover.checked = result.hoverEnabled;
    } else {
      toggleHover.checked = false;
    }
  });
}

// Update hover behavior based on the new state
function updateHoverState(enabled) {
  if (enabled) {
    showFullSubjectNameOnHover();
  } else {
    removeHoverListeners();
  }
}

// Add event listener for the hover toggle checkbox
document.addEventListener("DOMContentLoaded", function() {
  loadHoverToggle();

  const toggleHover = document.getElementById("toggleHover");
  toggleHover.addEventListener('change', function() {
    saveHoverToggle(toggleHover.checked);
  });
});


document.addEventListener("DOMContentLoaded", function() {
    var rozvrh = document.getElementById("rozvrh");
    var znamky = document.getElementById("znamky");
    var absence = document.getElementById("absence");
    var logout = document.getElementById("logout");
    var predvidac = document.getElementById("predvidac");
  
    rozvrh.addEventListener("click", function() {
      chrome.tabs.create({ url: "https://sis.ssakhk.cz/TimeTable/PersonalNew" });
    });
  
    znamky.addEventListener("click", function() {
      chrome.tabs.create({ url: "https://sis.ssakhk.cz/Classification/" });
    });

    absence.addEventListener("click", function() {
        chrome.tabs.create({ url: "https://sis.ssakhk.cz/Absent/My" });
      });

      logout.addEventListener("click", function() {
        chrome.tabs.create({ url: "https://sis.ssakhk.cz/Account/Logout" });
      });

      predvidac.addEventListener("click", function() {
        chrome.tabs.create({ url: "chrome-extension://ckofcdmhdighamfdejhjjpckpogbbgpf/predvidac.html" });
      });
  });

  function saveTheme(theme) {
    chrome.storage.local.set({ 'selectedTheme': theme }, function() {
      console.log('Theme is set to ' + theme);
  
      // Refresh the current tab directly
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    });
  }

// Event listeners for theme radio button changes
document.querySelectorAll('.theme-options input[type="radio"]').forEach(radio => {
  radio.addEventListener('change', function() {
    saveTheme(this.id);
  });
});

// Load the theme from local storage when the popup opens
document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['selectedTheme'], function(result) {
    if (result.selectedTheme) {
      document.getElementById(result.selectedTheme).checked = true;
    }
  });
});