const apiProxy = 'https://cors-anywhere.herokuapp.com/';

function setStatusDot(online) {
  const statusDot = document.querySelector('#status');
  if (online) {
    statusDot.style.backgroundColor = '#00ff00'; // green
  } else {
    statusDot.style.backgroundColor = '#ff0000'; // red
  }
}

function checkStatus() {
  fetch(apiProxy + 'https://sis.ssakhk.cz/')
    .then(response => {
      if (response.ok) {
        setStatusDot(true);
      } else {
        setStatusDot(false);
      }
    })
    .catch(() => setStatusDot(false));
}

window.addEventListener('load', () => {
  checkStatus();
  setInterval(checkStatus, 30000); // check every 30 seconds
});





// Get the current version of the extension
chrome.runtime.getManifest().version;

// Update the content of the <span> element with the current version
document.getElementById("version").textContent = "v" + chrome.runtime.getManifest().version;


document.addEventListener("DOMContentLoaded", function() {
    var rozvrh = document.getElementById("rozvrh");
    var znamky = document.getElementById("znamky");
    var absence = document.getElementById("absence");
    var logout = document.getElementById("logout");
  
    rozvrh.addEventListener("click", function() {
      chrome.tabs.create({ url: "https://sis.ssakhk.cz/TimeTable/PersonalNew" });
    });
  
    znamky.addEventListener("click", function() {
      chrome.tabs.create({ url: "https://sis.ssakhk.cz/Classification/Student" });
    });

    absence.addEventListener("click", function() {
        chrome.tabs.create({ url: "https://sis.ssakhk.cz/Absent/My" });
      });

      logout.addEventListener("click", function() {
        chrome.tabs.create({ url: "https://sis.ssakhk.cz/Account/Logout" });
      });
  });