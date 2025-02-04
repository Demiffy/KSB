// Function to apply custom styles based on the selected theme
function applyCustomStyles() {
  chrome.storage.local.get(['selectedTheme'], function(result) {
    const url = window.location.href;
    let cssFileBaseName = '';

    if (url.includes('/News')) {
      cssFileBaseName = 'newsStyles';
    } else if (url.includes('/Classification/')) {
      cssFileBaseName = 'classificationStyles';
    } else if (url.includes('/Absent/')) {
      cssFileBaseName = 'absenceStyles';
    } else if (url.includes('/Attendance')) {
      cssFileBaseName = 'attendanceStyles';
    } else if (url.includes('/TimeTable/School')) {
      cssFileBaseName = 'timetableschoolStyles';
    } else if (url.includes('/TimeTable/PersonalNew')) {
      cssFileBaseName = 'timetablepersonalStyles';
    } else if (url.includes('/Finance/Info')) {
      cssFileBaseName = 'financeStyles';
    } else if (url.includes('/ResitExam/Index')) {
      cssFileBaseName = 'resitexamStyles';
    } else if (url.includes('/Document/List')) {
      cssFileBaseName = 'documentStyles';
    } else if (url.includes('/Election/Project')) {
      cssFileBaseName = 'projectelectionStyles';
    } else if (url.includes('/Election/Subject')) {
      cssFileBaseName = 'subjectelectionStyles';
    } else if (url.includes('/Account/UserProfile')) {
      cssFileBaseName = 'profileStyles';
    } else if (url.includes('/Account/ChangePassword')) {
      cssFileBaseName = 'changepasswordStyles';
    } else if (url.includes('/Account/Login')) {
      cssFileBaseName = 'loginStyles';
    } else if (url.includes('/Work/List/')) {
      cssFileBaseName = 'workStyles';
    }

    // Determine which CSS file to load based on the stored theme
    let themeSuffix = '';
    if (result.selectedTheme === 'theme2') {
      themeSuffix = '2';
    } else if (result.selectedTheme === 'theme3') {
      themeSuffix = '3';
    }

    const cssFileName = cssFileBaseName + themeSuffix + '.css';

    if (cssFileName) {
      const link = document.createElement('link');
      link.href = chrome.runtime.getURL(cssFileName);
      link.type = 'text/css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  });
}

applyCustomStyles();

// Update text color based on background color
function updateTextColorBasedOnBgColor() {
  const allElements = document.querySelectorAll('*');
  const colorMapping = {
    'rgba(255, 0, 0, 0.33)': '#FFFFFF',
    'rgb(32, 35, 42)': '#FFFFFF',
    'rgb(211, 211, 211)': '#000000',
    'rgb(249, 249, 249)': '#000000',
    'rgb(255, 255, 255)': '#000000',
  };

  allElements.forEach(element => {
    const style = window.getComputedStyle(element);
    Object.entries(colorMapping).forEach(([bgColor, textColor]) => {
      if (style.backgroundColor === bgColor) {
        element.style.color = textColor;
      }
    });
  });
}


// TIME LINE
function updateCurrentTimeLine() {

  if (window.location.href !== 'https://sis.ssakhk.cz/TimeTable/PersonalNew') {
    return;
  }

  const timetableDiv = document.querySelector('div.timetable');
  if (!timetableDiv) {
    console.log('[Kyberna MB] Timetable div not found');
    return;
  }

  let currentTimeLine = document.getElementById('current-time-line');
  if (!currentTimeLine) {
    console.log('[Kyberna MB] Current time line not found, creating a new one...');
    currentTimeLine = document.createElement('div');
    currentTimeLine.id = 'current-time-line';
    currentTimeLine.style.opacity = '0';
    timetableDiv.appendChild(currentTimeLine);

    setTimeout(() => {
      currentTimeLine.style.opacity = '1';
    }, 250);
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  console.log(`[Kyberna MB] Current time: ${currentHour}:${currentMinute}`);

  const timeToPixel = {
    7: 285,
    8: 375,
    9: 469,
    10: 560,
    11: 652,
    12: 743,
    13: 835,
    14: 927,
    15: 1019,
    16: 1110,
    17: 1202,
    18: 1295,
    19: 1383
  };

  let previousHour = null;
  let nextHour = null;
  for (const hour of Object.keys(timeToPixel).map(Number).sort((a, b) => a - b)) {
    if (hour <= currentHour) {
      previousHour = hour;
    }
    if (hour > currentHour && nextHour === null) {
      nextHour = hour;
    }
  }

  if (currentHour >= 7 && currentHour < 19) {
    let topPosition;
    if (previousHour !== null && nextHour !== null) {
      const pixelDifference = timeToPixel[nextHour] - timeToPixel[previousHour];
      const hourDifference = nextHour - previousHour;
      const minutesSincePreviousHour = (currentHour - previousHour) * 60 + currentMinute;

      const percentageThroughPeriod = minutesSincePreviousHour / (hourDifference * 60);
      topPosition = timeToPixel[previousHour] + pixelDifference * percentageThroughPeriod;
      
    } else {
      topPosition = timeToPixel[currentHour] ?? timeToPixel[7];
    }

    currentTimeLine.style.top = `${topPosition}px`;

    const computedStyle = window.getComputedStyle(timetableDiv);
    const paddingAndBorderAdjustment = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight) + parseFloat(computedStyle.borderLeftWidth) + parseFloat(computedStyle.borderRightWidth);
    const correctWidth = timetableDiv.clientWidth - paddingAndBorderAdjustment;
    currentTimeLine.style.width = `${correctWidth}px`;

    currentTimeLine.style.display = 'block';
  } else {
    console.log('[Kyberna MB] Current time is outside the display range');
    currentTimeLine.style.display = 'none';
  }
}







// Update colspan elements with month names
function updateColspanWithCzechMonths() {
  const czechMonths = {
    '1': 'Leden 1.', '2': 'Únor 2.', '3': 'Březen 3.', '4': 'Duben 4.',
    '5': 'Květen 5.', '6': 'Červen 6.', '7': 'Červenec 7.', '8': 'Srpen 8.',
    '9': 'Září 9.', '10': 'Říjen 10.', '11': 'Listopad 11.', '12': 'Prosinec 12.'
  };

  const colspanElements = document.querySelectorAll('td[colspan="13"]');
  colspanElements.forEach(element => {
    const matches = element.textContent.match(/Mesic (\d+)/);
    if (matches && matches[1]) {
      const monthNumber = matches[1];
      element.textContent = element.textContent.replace(matches[0], 'Měsíc ' + czechMonths[monthNumber]);
    }
  });
}

// Function to check for error and redirect
function checkForErrorAndRedirect() {
  const errorMessage = document.querySelector('h1');
  if (errorMessage && errorMessage.textContent.includes('Server Error in \'/\' Application.')) {
    console.log("[Kyberna MB] No you can't go here silly x3");
    window.location.href = 'https://sis.ssakhk.cz/News';
    
  }
}
window.addEventListener('load', checkForErrorAndRedirect);


// Function to insert content and apply styles and display next hour info
function insertContentAndApplyStyles() {
  if (window.location.href === 'https://sis.ssakhk.cz/News') {
    const h2Element = document.querySelector('h2.text-center');
    const version = chrome.runtime.getManifest().version;

    // Function to determine the CSS file name based on the selected theme
    function determineCssFileName(theme) {
      switch (theme) {
        case 'theme2': return 'updateStyles2.css';
        case 'theme3': return 'updateStyles3.css';
        default: return 'updateStyles.css';
      }
    }

    chrome.storage.local.get(['selectedTheme', 'timetable', 'lastFetched'], function(result) {
      const cssFile = determineCssFileName(result.selectedTheme);
      const updateHtmlUrl = chrome.runtime.getURL('update.html');
      const updateCssUrl = chrome.runtime.getURL(cssFile);

      Promise.all([
        fetch(updateHtmlUrl).then(response => response.text()),
        fetch(updateCssUrl).then(response => response.text())
      ])
      .then(([htmlContent, cssContent]) => {
        const updatedHtmlContent = htmlContent.replace(/\{\{version\}\}/g, version);

        const styleEl = document.createElement('style');
        styleEl.textContent = cssContent;
        document.head.appendChild(styleEl);

        // Check if the h2 element exists
        if (h2Element) {
          h2Element.insertAdjacentHTML('afterend', updatedHtmlContent);

          // Format the current date
          const today = new Date();
          const formattedDate = today.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });

          // Create the container
          const container = document.createElement('div');
          container.classList.add('news-next-container');
          container.innerHTML = `
            <h3 class="news-timetable-title">${formattedDate}</h3>
            <div><strong>Nyní:</strong> <span class="current-subject">...</span></div>
            <div><strong>Končí za:</strong> <span class="current-time-left">...</span></div>
            <div><strong>Následující:</strong> <span class="next-subject">...</span></div>
            <div class="next-time-section"><strong>Začíná za:</strong> <span class="next-time-left">...</span></div>
            <div class="news-last-fetched"><small>Poslední načtení: <span class="last-fetched-time">...</span></small></div>
            <button class="update-button"><img class="refresh-icon" alt="refresh icon"></button>
          `;
          h2Element.insertAdjacentElement('afterend', container);

          // Set image source for the refresh icon
          const refreshIcon = container.querySelector('.refresh-icon');
          refreshIcon.setAttribute('src', chrome.runtime.getURL('refresh.png'));

          // Update button - redirects to timetable page for refresh
          const updateButton = container.querySelector('.update-button');
          updateButton.addEventListener('click', () => {
            window.location.href = 'https://sis.ssakhk.cz/TimeTable/PersonalNew';
          });

          // Update next hour info every second
          setInterval(function() {
            displayNextHourInfo(result.timetable, result.lastFetched, container);
          }, 1000);
        }
      })
      .catch(error => console.error('[Kyberna MB] Error loading content:', error));
    });
  }
}


// Function to display the next hour information in the news section
function displayNextHourInfo(timetable, lastFetched, container) {
  const now = new Date();
  let foundCurrent = false;
  let nextSubjectInfo = null;

  const currentSubjectEl = container.querySelector('.current-subject');
  const currentTimeLeftEl = container.querySelector('.current-time-left');
  const nextSubjectEl = container.querySelector('.next-subject');
  const nextTimeLeftEl = container.querySelector('.next-time-left');
  const lastFetchedEl = container.querySelector('.last-fetched-time');
  const nextTimeSection = container.querySelector('.next-time-section');

  currentSubjectEl.textContent = '...';
  currentTimeLeftEl.textContent = '...';
  nextSubjectEl.textContent = '...';
  nextTimeLeftEl.textContent = '...';
  nextTimeSection.style.display = 'block';

  for (let i = 0; i < timetable.length; i++) {
    const subject = timetable[i];
    const [startTime, endTime] = subject.time.split(' - ').map(t => t.trim());
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
    const endDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute);

    if (now >= startDateTime && now < endDateTime) {
      foundCurrent = true;
      const diffEndSeconds = Math.floor((endDateTime - now) / 1000);
      currentSubjectEl.textContent = `${subject.subjectName} - ${subject.roomNumber}`;
      currentTimeLeftEl.textContent = formatTime(diffEndSeconds);

      if (i + 1 < timetable.length) {
        const nextSubject = timetable[i + 1];
        const nextStartTime = nextSubject.time.split(' - ')[0].trim();
        const [nextStartHour, nextStartMinute] = nextStartTime.split(':').map(Number);
        const nextStartDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), nextStartHour, nextStartMinute);
        const diffStartNextSeconds = Math.floor((nextStartDateTime - now) / 1000);

        nextSubjectEl.textContent = `${nextSubject.subjectName} - ${nextSubject.roomNumber}`;
        nextTimeLeftEl.textContent = formatTime(diffStartNextSeconds);

        // Turn text red if time is below 5 minutes
        if (diffStartNextSeconds < 300) {
          nextTimeLeftEl.style.color = 'red';
        } else {
          nextTimeLeftEl.style.color = '';
        }
      } else {
        nextSubjectEl.textContent = 'Žádná další hodina';
        nextTimeSection.style.display = 'none';
      }
      break;
    }

    if (!foundCurrent && now < startDateTime) {
      nextSubjectInfo = {
        name: subject.subjectName,
        roomNumber: subject.roomNumber,
        startDateTime
      };
      break;
    }
  }

  if (!foundCurrent && nextSubjectInfo) {
    // Break time
    const diffStartSeconds = Math.floor((nextSubjectInfo.startDateTime - now) / 1000);
    currentSubjectEl.textContent = 'Přestávka';
    nextSubjectEl.textContent = `${nextSubjectInfo.name} - ${nextSubjectInfo.roomNumber}`;
    nextTimeLeftEl.textContent = formatTime(diffStartSeconds);

    // Turn text red if time is below 5 minutes
    if (diffStartSeconds < 300) {
      nextTimeLeftEl.style.color = 'red';
    } else {
      nextTimeLeftEl.style.color = '';
    }
  } else if (!foundCurrent) {
    currentSubjectEl.textContent = 'Žádná další hodina';
    currentTimeLeftEl.textContent = '';
    nextSubjectEl.textContent = '';
    nextTimeLeftEl.textContent = '';
    nextTimeSection.style.display = 'none';
  }

  // Update the last fetched time and turn red if older than 12 hours
  const lastFetchedDate = new Date(lastFetched);
  const timeSinceLastFetch = (now - lastFetchedDate) / (1000 * 60 * 60);
  lastFetchedEl.textContent = `${formatLastFetched(lastFetched)}`;
  
  if (timeSinceLastFetch > 12) {
    lastFetchedEl.style.color = 'red';
  } else {
    lastFetchedEl.style.color = '';
  }
}

// Function to format time
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes} minut a ${remainingSeconds} sekund`;
}

// Function to format the last fetched time
function formatLastFetched(timestamp) {
  if (!timestamp) return 'Neznámé';

  const lastFetchedDate = new Date(timestamp);
  return `${lastFetchedDate.toLocaleDateString()} ${lastFetchedDate.toLocaleTimeString()}`;
}


// Function to format time
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes} minut a ${remainingSeconds} sekund`;
}

// Function to format the last fetched time
function formatLastFetched(timestamp) {
  if (!timestamp) return 'Neznámé';

  const lastFetchedDate = new Date(timestamp);
  return `${lastFetchedDate.toLocaleDateString()} ${lastFetchedDate.toLocaleTimeString()}`;
}

// Function set the title of the page
function setTitleIfURLMatches() {
  if (window.location.href === 'https://sis.ssakhk.cz/TimeTable/PersonalNew') {
    document.title = 'KybernaIS - Rozvrh';
  }
  if (window.location.href === 'https://sis.ssakhk.cz/TimeTable/School') {
    document.title = 'KybernaIS - Rozvrh';
  }
  if (window.location.href === 'https://sis.ssakhk.cz/Absent/My') {
    document.title = 'KybernaIS - Absence';
  }
  if (window.location.href === 'https://sis.ssakhk.cz/Document/List') {
    document.title = 'KybernaIS - Dokumenty';
  }
  if (window.location.href === 'https://sis.ssakhk.cz/Election/Project') {
    document.title = 'KybernaIS - Volba Projektů';
  }
  if (window.location.href === 'https://sis.ssakhk.cz/Election/Subject') {
    document.title = 'KybernaIS - Volba Předmětů';
  }
  if (window.location.href === 'https://sis.ssakhk.cz/Account/UserProfile') {
    document.title = 'KybernaIS - Profil';
  }
  if (window.location.href === 'https://sis.ssakhk.cz/Account/ChangePassword') {
    document.title = 'KybernaIS - Změna Hesla';
  }
  if (window.location.href.includes('https://sis.ssakhk.cz/Account/Login')) {
    document.title = 'KybernaIS - Přihlášení';
}
}

// Function change favicon for domain
function changeFaviconForDomain() {
  if (window.location.href.startsWith('https://sis.ssakhk.cz/')) {
    const link = document.createElement('link');
    const oldLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');

    link.rel = 'icon';
    link.type = 'image/png';
    link.href = 'https://kyberna.cz/favicon.ico';

    // Remove existing favicons
    oldLinks.forEach(oldLink => {
      oldLink.parentNode.removeChild(oldLink);
    });

    document.head.appendChild(link);
  }
}

// Function to insert content after the div (Better aktuální/stálý switch)
function insertContentAfterDiv() {
  const urlRegex = /^https:\/\/sis\.ssakhk\.cz\/TimeTable\/PersonalNew(\/\d+)?$/;

  if (urlRegex.test(window.location.href)) {
    const divElement = document.querySelector('div.static-switch');

    const labelHtmlContent = `
      <label class="sliderLabel">Aktuální</label>
    `;

    const styleHtmlContent = `
      <style>
        .sliderLabel {
          display: inline-block;
          margin-left: -5px;
          color: white;
          font-size: 16px;
          position: relative;
          top: -11px;
        }
      </style>
    `;

    // Check
    if (divElement) {
      document.head.insertAdjacentHTML('beforeend', styleHtmlContent);
      divElement.insertAdjacentHTML('afterend', labelHtmlContent);
      setUpCheckboxListener();
    }
  }
}


// Function to set up the checkbox listener
function setUpCheckboxListener() {
  const checkbox = document.querySelector('.static-switch input[type="checkbox"]');
  const label = document.querySelector('.sliderLabel');

  if (checkbox && label) {
    checkbox.addEventListener('change', () => {
      label.textContent = checkbox.checked ? 'Stálý' : 'Aktuální';
    });
  }
}

// Function to insert the navbar toggle button
function insertNavbarToggleButton() {
  if (window.location.href.startsWith('https://sis.ssakhk.cz/') && 
      !window.location.href.match(/\.(jpg|png)$/i)) {

      const bodyElement = document.querySelector('body');
      const navbar = document.querySelector('.navbar.navbar-inverse.navbar-fixed-top');

      const navbarToggleHtmlContent = `
          <button id="navbar-toggle" style="position: fixed; top: 10px; z-index: 10000001;">☰</button>
      `;

      if (bodyElement) {
          bodyElement.insertAdjacentHTML('afterbegin', navbarToggleHtmlContent);
          setUpNavbarToggleListener();

          // Check localStorage and update navbar visibility
          const navbarHidden = localStorage.getItem('navbarHidden') === 'true';
          if (navbarHidden && navbar) {
              navbar.style.transition = 'none';
              navbar.style.top = '-' + navbar.offsetHeight + 'px';
              setTimeout(() => {
                  navbar.style.transition = 'top 0.5s ease';
              }, 50);
          }
      }
  }
}

// Function to set up the navbar toggle listener
function setUpNavbarToggleListener() {
  const toggleBtn = document.getElementById('navbar-toggle');
  const navbar = document.querySelector('.navbar.navbar-inverse.navbar-fixed-top');

  if (toggleBtn && navbar) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = navbar.style.top === '-' + navbar.offsetHeight + 'px';
      navbar.style.top = isHidden ? '0px' : '-' + navbar.offsetHeight + 'px';

      // Save the state to localStorage
      localStorage.setItem('navbarHidden', !isHidden);
    });
  }
}



// Function to insert modern tables with headers
if (window.location.href.includes('https://sis.ssakhk.cz/Classification')) {

  function insertModernTables(data, container) {
      container.innerHTML = '';

      data.forEach(([header, ...tableData]) => {
          let table = document.createElement('table');
          table.className = 'modern-table';

          let tableHeader = document.createElement('div');
          tableHeader.className = 'modern-table-header';
          tableHeader.innerText = header;
          container.appendChild(tableHeader);

          let headerRow = document.createElement('thead');
          let headers = tableData.shift();
          headers.forEach(headerText => {
              let th = document.createElement('th');
              th.innerText = headerText;
              headerRow.appendChild(th);
          });
          table.appendChild(headerRow);

          let isClosed = false;
          let typColumnIndex = headers.indexOf('Typ');

          tableData.forEach((rowData, rowIndex) => {
              let row = document.createElement('tr');

              rowData.forEach((cellData, cellIndex) => {
                  let cell = document.createElement('td');
                  cell.innerText = cellData;

                  if (cellIndex === typColumnIndex && cellData.trim() === '*') {
                      isClosed = true;
                  }

                  if (rowIndex === tableData.length - 1) {
                      row.className = 'final-grade-row';
                      if (cellIndex === 1) {
                          cell.classList.add('final-grade-cell');

                          if (cellData.toLowerCase() === 'n') {
                              cell.style.color = 'red';
                          } else {
                              let grade = parseFloat(cellData.replace(',', '.'));
                              if (!isNaN(grade)) {
                                  if (grade >= 1.0 && grade <= 1.49) {
                                      cell.style.color = 'lime';
                                  } else if (grade >= 1.5 && grade <= 2.49) {
                                      cell.style.color = 'yellow';
                                  } else if (grade >= 2.5 && grade <= 3.49) {
                                      cell.style.color = '#fcae05';
                                  } else if (grade >= 3.5 && grade <= 4.49) {
                                      cell.style.color = 'darkorange';
                                  } else if (grade >= 4.5 && grade <= 5.0) {
                                      cell.style.color = '#FF4C4C';;
                                  }
                              }
                          }
                      }
                  }

                  row.appendChild(cell);
              });

              table.appendChild(row);
          });

          // Append 'Uzavřeno' to the header if the table is closed
          if (isClosed) {
              tableHeader.innerText += ' - Uzavřeno';
          }

          container.appendChild(table);
      });
  }

  let container = document.querySelector('.classification-container');

  if (container) {
      let originalData = [];
      container.querySelectorAll('.panel').forEach(panel => {
          let header = panel.querySelector('.panel-heading').innerText;
          let tableData = [];
          panel.querySelectorAll('table tr').forEach(row => {
              let rowData = [];
              row.querySelectorAll('th, td').forEach(cell => {
                  rowData.push(cell.innerText);
              });
              tableData.push(rowData);
          });
          originalData.push([header, ...tableData]);
      });

      // Store original data in chrome's local storage
      chrome.storage.local.set({ "originalTableData": originalData }, function() {
          console.log("[Kyberna MB] Original table data saved.");
          console.log(originalData);
          saveLastFetchDate();
      });

      // Insert modern tables with headers
      insertModernTables(originalData, container);
  } else {
      console.log("[Kyberna MB] No container found for the classification tables.");
  }
}

// Function to save the last fetch date
function saveLastFetchDate() {
const now = new Date();
chrome.storage.local.set({ "lastFetchDate": now.toString() });
}

if (window.location.href.includes('https://sis.ssakhk.cz/News') ||
    window.location.href.includes('https://sis.ssakhk.cz/Classification') ||
    window.location.href.includes('https://sis.ssakhk.cz/Absent') ||
    window.location.href.includes('https://sis.ssakhk.cz/Attendance') ||
    window.location.href.includes('https://sis.ssakhk.cz/Work') ||
    window.location.href.includes('https://sis.ssakhk.cz/TimeTable') ||
    window.location.href.includes('https://sis.ssakhk.cz/Finance') ||
    window.location.href.includes('https://sis.ssakhk.cz/ResitExam') ||
    window.location.href.includes('https://sis.ssakhk.cz/Document') ||
    window.location.href.includes('https://sis.ssakhk.cz/Election') ||
    window.location.href.includes('https://sis.ssakhk.cz/Account')) {
    
    // Function to insert predvidac menu item
    function insertNewMenuItem() {
        var studentListItem = document.querySelector('.nav.navbar-nav .dropdown a[href="/Classification/Student"]');
        
        if (studentListItem && studentListItem.parentNode) {
            var newListItem = document.createElement('li');
            var newLink = document.createElement('a');
            newLink.href = '#';
            newLink.textContent = 'Předvídač známek';
            newListItem.appendChild(newLink);

            studentListItem.parentNode.insertAdjacentElement('afterend', newListItem);

            newLink.addEventListener('click', function(event) {
                event.preventDefault();

                var url = chrome.runtime.getURL('predvidac.html');
                window.location.href = url;
            });
        } else {
            console.log('[Kyberna MB] Student list item not found, new menu item not inserted.');
        }
    }

    insertNewMenuItem();
}


if (window.location.href.includes('https://sis.ssakhk.cz/Absent') && window.location.href !== 'https://sis.ssakhk.cz/Absent/Parent') {
    function showLoadingGif() {
      if (!document.getElementById('loadingContainer')) {
          // Create a container for the loading GIF
          const loadingContainer = document.createElement('div');
          loadingContainer.setAttribute('id', 'loadingContainer');
          loadingContainer.style.textAlign = 'center';
          loadingContainer.style.margin = '20px auto';
          loadingContainer.style.width = '100px';
          loadingContainer.style.height = '100px';
  
          const loadingGif = document.createElement('img');
          loadingGif.setAttribute('src', chrome.runtime.getURL('loading.gif'));
          loadingGif.style.width = '100%';
          loadingGif.style.height = '100%';

          loadingContainer.appendChild(loadingGif);
  
          const targetElement = document.querySelector('.absent-sumarized-table');
          if (targetElement) {
              targetElement.parentNode.insertBefore(loadingContainer, targetElement);
          } else {
              const mainContainer = document.querySelector('.container');
              if (mainContainer) {
                  mainContainer.insertBefore(loadingContainer, mainContainer.firstChild);
              } else {
                  document.body.insertBefore(loadingContainer, document.body.firstChild);
              }
          }
      }
  }
  
  

    // Function to hide loading GIF
    function hideLoadingGif() {
        const loadingGif = document.getElementById('loadingContainer');
        if (loadingGif) {
            loadingGif.remove();
        }
    }

    // Function to search for the original table
    function searchForTable() {
        showLoadingGif();
        let container = document.querySelector('.absent-sumarized-table');

        if (container) {
            let originalTable = container.querySelector('.table');

            if (originalTable) {
                let data = extractTableData(originalTable);

                // Remove the original table
                originalTable.remove();
                console.log("[Kyberna MB] Original Table data saved.");

                // Insert the modern version of the table
                insertModernTables(data, container);
                hideLoadingGif();
            } else {
                console.log("[Kyberna MB] Original table not found. Retrying...");
                setTimeout(() => {
                    searchForTable(); // Call itself to retry
                    hideLoadingGif();
                }, 3000);
            }
        } else {
            console.log("[Kyberna MB] Container not found. Retrying...");
            setTimeout(() => {
                searchForTable(); // Call itself to retry
                hideLoadingGif();
            }, 3000);
        }
    }
    searchForTable();
}


// Function to extract table data
function extractTableData(table) {
  let data = [];
  table.querySelectorAll('tr').forEach(row => {
      let rowData = [];
      row.querySelectorAll('th, td').forEach(cell => {
          rowData.push(cell.innerText.trim());
      });
      data.push(rowData);
  });
  return data;
}

// Function to insert modern tables
function insertModernTables(data, container) {
  container.innerHTML = '';
  let absentSumarizedTable = document.querySelector('.absent-sumarized-table');
    if (absentSumarizedTable) {
        absentSumarizedTable.style.display = 'block';
        absentSumarizedTable.style.height = 'auto';
        absentSumarizedTable.style.width = 'auto';
    }

  let table = document.createElement('table');
  table.className = 'modern-table';

  let headerRow = document.createElement('thead');
  let headerData = data.shift();
  let tr = document.createElement('tr');
  headerData.forEach(headerText => {
      let th = document.createElement('th');
      th.innerText = headerText;
      tr.appendChild(th);
  });
  headerRow.appendChild(tr);
  table.appendChild(headerRow);

  // Create data rows
  let tbody = document.createElement('tbody');
  data.forEach(rowData => {
      let row = document.createElement('tr');
      rowData.forEach(cellData => {
          let cell = document.createElement('td');
          cell.innerText = cellData;
          row.appendChild(cell);
      });
      tbody.appendChild(row);
  });
  table.appendChild(tbody);

  container.appendChild(table);
  applyGradientToProcentaRow(table);
}

// Function to apply gradient to the Procenta row and add warning for percentages above 30%
function applyGradientToProcentaRow(table) {
  const procentaRow = Array.from(table.rows).find(row => row.cells[0] && row.cells[0].innerText.trim() === 'Procenta');
  const headerRow = table.querySelector('thead tr');

  if (procentaRow && headerRow) {
      Array.from(procentaRow.cells).forEach((cell, index) => {
          const percentage = parseFloat(cell.innerText);
          if (!isNaN(percentage)) {
              // Apply gradient background color based on percentage
              cell.style.backgroundColor = getGradientColor(percentage);

              if (percentage > 30) {
                  const headerCell = headerRow.cells[index];
                  if (headerCell) {
                      headerCell.style.color = 'red';
                  }
              }
              if (percentage > 25 && percentage <= 30) {
                const headerCell = headerRow.cells[index];
                if (headerCell) {
                    headerCell.style.color = 'orange';
                }
              }
          }
      });
  }
}

function getGradientColor(percentage) {
  // Color #1E1E1E
  const redIntensity = Math.min(255, (percentage / 100) * 255);
  const greenIntensity = 0;
  const blueIntensity = 0;
  const alpha = 0.5;

  return `rgba(${redIntensity}, ${greenIntensity}, ${blueIntensity}, ${alpha})`;
}


// Function to extract and store finance information
if (window.location.href.includes('https://sis.ssakhk.cz/Finance/Info')) {
  function saveFinanceInfo() {
      // Extract the HTML content of the finance information container
      let container = document.querySelector('.alert.alert-info');
      if (container) {
          let financeInfo = container.innerHTML;

          // Store finance data in Chrome's local storage
          chrome.storage.local.set({ "financeInfo": financeInfo }, function() {
              console.log("[Kyberna MB] Finance data saved.");
              saveLastFetchDate();
          });
      }
  }
  saveFinanceInfo();
}

// Function to replace finance information content on the page
function replaceFinanceInfoContent() {
  let originalContainer = document.querySelector('.alert.alert-info');
  if (originalContainer) {
      chrome.storage.local.get("financeInfo", function(result) {
          if (result.financeInfo) {
              modifyAndDisplayFinanceInfo(result.financeInfo, originalContainer);
          }
      });
  }
}

// Function to modify and display finance information
function modifyAndDisplayFinanceInfo(financeData, container) {
  const parser = new DOMParser();
  const financeDoc = parser.parseFromString(financeData, 'text/html');

  let newHtml = `<div class="new-finance-info-container"><h2>Finanční Informace</h2>`;

  // Extract and display variable symbols table
  const vsTable = financeDoc.querySelector('table');
  if (vsTable) {
      newHtml += `<div class="vs-info"><h3>Variabilní Symboly</h3>`;
      newHtml += `<div class="custom-list">`;

      vsTable.querySelectorAll('tr').forEach(row => {
          const description = row.cells[0]?.innerText;
          const value = row.cells[1]?.innerText;
          if (description && value) {
              newHtml += `<div class="list-item"><strong>${description}:</strong> ${value}</div>`;
          }
      });

      newHtml += `</div>`;
      newHtml += `</div>`;
  } else {
      console.error('[Kyberna MB] VS table not found in the finance data.');
  }

  // Extract and display bank account information based on the new class
  const bankAccountDiv = financeDoc.querySelector('div[style*="color:black;font-weight:bolder;font-size:19px;"]');
  if (bankAccountDiv) {
      const bankAccount = bankAccountDiv.innerText.trim();
      newHtml += `<div class="bank-account-info"><h3>Bankovní Účet</h3><p>${bankAccount}</p></div>`;
  } else {
      console.error('[Kyberna MB] Bank account information not found in the finance data.');
  }

  // Extract and display the prescription download link
  const prescriptionDiv = financeDoc.querySelector('div[style*="font-size: 2em"]');
  if (prescriptionDiv) {
      const prescriptionLink = prescriptionDiv.querySelector('a');
      if (prescriptionLink) {
          const prescriptionUrl = prescriptionLink.href;
          const prescriptionText = prescriptionLink.innerText;
          newHtml += `<div class="prescription-info"><h3>Předpis na příští rok</h3><a class="prescription-link" href="${prescriptionUrl}">${prescriptionText}</a></div>`;
      }
  } else {
      console.error('[Kyberna MB] Prescription information not found in the finance data.');
  }

  newHtml += `</div>`;
  container.innerHTML = newHtml;
}

// Function to style the new finance information based on the selected theme
function styleNewFinanceInfo() {
    chrome.storage.local.get(['selectedTheme'], function(result) {
        let cssFileName = 'financetableStyles';

        if (result.selectedTheme === 'theme2') {
            cssFileName += '2';
        } else if (result.selectedTheme === 'theme3') {
            cssFileName += '3';
        }

        cssFileName += '.css';

        // Load CSS file
        const link = document.createElement('link');
        link.href = chrome.runtime.getURL(cssFileName);
        link.type = 'text/css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    });
}

// Function to insert the next subject container and button
function insertNextSubjectContainerAndButton() {
  if (window.location.href === 'https://sis.ssakhk.cz/TimeTable/PersonalNew') {
    // Create the next subject container
    const nextContainer = document.createElement('div');
    nextContainer.id = 'next-container';
    document.body.appendChild(nextContainer);

    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggle-next-container';
    toggleButton.textContent = '▶';
    const buttonTopPosition = window.innerHeight / 2 - 70;
    toggleButton.style.cssText = `position: fixed; left: 10px; top: ${buttonTopPosition}px; z-index: 1001;`;
    document.body.appendChild(toggleButton);

    toggleButton.addEventListener('click', function() {
      nextContainer.classList.toggle('visible');
      if (nextContainer.classList.contains('visible')) {
        toggleButton.textContent = '◀';
      } else {
        toggleButton.textContent = '▶';
      }
    });

    saveTimetableToStorage();
    updateNextSubjectInfo(nextContainer);

    setInterval(function() {
      updateNextSubjectInfo(nextContainer);
    }, 1000);
  }
}

// Function to update the next subject info
function updateNextSubjectInfo(container) {
  const activeColumn = document.querySelector('.col.active');
  const hourCards = activeColumn.querySelectorAll('.hour-card:not(.canceled-card)');
  const now = new Date();
  let foundCurrent = false;
  let nextSubjectInfo = null;

  container.innerHTML = '';

  // Array to store combined lessons
  let combinedLessons = [];
  for (let i = 0; i < hourCards.length; i++) {
    const card = hourCards[i];
    const subjectName = card.querySelector('.subject-name').innerText;
    const roomNumber = card.querySelector('.room-name').innerText;
    const timeText = card.querySelector('.time').innerText;
    const [startTime, endTime] = timeText.split(' - ').map(t => t.trim());
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Check and merge lessons
    if (
      combinedLessons.length > 0 &&
      combinedLessons[combinedLessons.length - 1].subjectName === subjectName &&
      combinedLessons[combinedLessons.length - 1].roomNumber === roomNumber
    ) {
      const previousLesson = combinedLessons[combinedLessons.length - 1];

      const previousEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), previousLesson.endHour, previousLesson.endMinute);
      const currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
      const breakLength = Math.floor((currentStart - previousEnd) / 60000);

      const adjustedEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute);
      adjustedEndTime.setMinutes(adjustedEndTime.getMinutes() - breakLength);

      previousLesson.endHour = adjustedEndTime.getHours();
      previousLesson.endMinute = adjustedEndTime.getMinutes();
      previousLesson.adjustedEndTime = `${String(previousLesson.endHour).padStart(2, '0')}:${String(previousLesson.endMinute).padStart(2, '0')}`;
      previousLesson.isDoubleHour = true;
      previousLesson.breakLength = breakLength;
      } else {
      combinedLessons.push({
        subjectName,
        roomNumber,
        startHour,
        startMinute,
        endHour,
        endMinute,
        adjustedEndTime: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
        isDoubleHour: false,
        breakLength: 0,
      });
    }
  }

  // Iterate over combined lessons
  for (let i = 0; i < combinedLessons.length; i++) {
    const lesson = combinedLessons[i];
    const startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), lesson.startHour, lesson.startMinute);
    const endDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), lesson.endHour, lesson.endMinute);

    if (now >= startDateTime && now < endDateTime) {
      // Current subject
      foundCurrent = true;
      const diffEndSeconds = Math.floor((endDateTime - now) / 1000);
      const doubleHourSuffix = lesson.isDoubleHour ? ' x2' : ''; // Add 'x2' if it's a double hour
      container.innerHTML = `<strong>Nyní:</strong> ${lesson.subjectName} - ${lesson.roomNumber}${doubleHourSuffix}<br><strong>Končí za:</strong> ${formatTime(diffEndSeconds)}`;

      // Look ahead for the next subject
      if (i + 1 < combinedLessons.length) {
        const nextLesson = combinedLessons[i + 1];
        const nextStartDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), nextLesson.startHour, nextLesson.startMinute);
        const diffStartNextSeconds = Math.floor((nextStartDateTime - now) / 1000);

        container.innerHTML += `<br><strong>Následující:</strong> ${nextLesson.subjectName} - ${nextLesson.roomNumber}<br><strong>Začíná za:</strong> ${formatTime(diffStartNextSeconds)}`;
      } else {
        // No more subjects for the day
        container.innerHTML += `<br><strong>Žádná další hodina</strong>`;
      }
      break;
    }

    if (!foundCurrent && now < startDateTime) {
      // Next subject
      nextSubjectInfo = {
        name: lesson.subjectName,
        roomNumber: lesson.roomNumber,
        startDateTime
      };
      break;
    }
  }

  if (!foundCurrent && nextSubjectInfo) {
    // Break
    const diffStartSeconds = Math.floor((nextSubjectInfo.startDateTime - now) / 1000);
    container.innerHTML = `<strong>Přestávka</strong><br><strong>Následující:</strong> ${nextSubjectInfo.name} - ${nextSubjectInfo.roomNumber}<br><strong>Začíná za:</strong> ${formatTime(diffStartSeconds)}`;
  } else if (!foundCurrent) {
    // No more subjects for the day
    container.innerHTML = `<strong>Žádná další hodina</strong>`;
  }

  // Function to format time
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minut a ${remainingSeconds} sekund`;
  }
}


// Function to save active day timetable to storage
function saveTimetableToStorage() {
  const activeColumn = document.querySelector('.col.active');
  if (!activeColumn) {
    console.error('No active column found for the current day.');
    return;
  }

  let timetableData = [];
  const hourCards = activeColumn.querySelectorAll('.hour-card:not(.canceled-card)');

  hourCards.forEach((card) => {
    const subjectName = card.querySelector('.subject-name').innerText;
    const timeText = card.querySelector('.time').innerText;
    const roomNumber = card.querySelector('.room-name').innerText;

    timetableData.push({
      subjectName,
      time: timeText,
      roomNumber
    });
  });

  const lastFetched = new Date().toISOString();  // Store fetch time

  // Save to local storage
  chrome.storage.local.set({ 
    timetable: timetableData, 
    lastFetched 
  }, function() {
    console.log('[Kyberna MB] Timetable saved for the current day:', timetableData);
    console.log('[Kyberna MB] Last fetched time saved as:', lastFetched);
  });
}



// Function to show full subject name on hover
function showFullSubjectNameOnHover() {
  chrome.storage.local.get(['hoverEnabled'], function(result) {
    if (result.hoverEnabled) {
      const subjectInfo = {
        "PSY": "POČÍTAČOVÉ SYSTÉMY",
        "PRG": "PROGRAMOVÁNÍ",
        "MAT": "MATEMATIKA",
        "CJL": "ČESKÝ JAZYK A LITERATURA",
        "TEV": "TĚLOCVIK",
        "VYT": "VÝPOČETNÍ TECHNIKA",
        "AGJ": "ANGLICKÝ JAZYK",
        "OBN": "OBČANSKÁ VÝCHOVA",
        "AUT": "AUTOMATIZACE",
        "EKO": "EKONOMIKA",
        "PSI": "POČÍTAČOVÉ SÍTĚ",
        "FYZ": "FYZIKA",
        "ELZ": "ELEKTROTECHNIKA",
        "ZEL": "ZÁKLADY ELEKTROTECHNIKY",
        "Třh": "Třídní hodina",
        "ALG": "ALGORITMY",
        "PW1": "PROGRAMOVÁNÍ WEBU 1",
        "PW2": "PROGRAMOVÁNÍ WEBU 2",
        "DIC": "DÍLČÍ ČINNOSTI",
        "MPT": "MIKROPROCESOROVÁ TECHNIKA",
        "ITE": "IT ESSENTIALS",
        "3DM": "3D MODELOVÁNÍ",
        "CCE": "COMMERCIAL AND CORPORATE ENGLISH",
        "DVK": "DĚJINY VÝTVARNÉ KULTURY",
        "EBE": "BEZPEČNOST V ELEKTROTECHNICE",
        "FF1": "FINANČNÍ A FIREMNÍ ZÁKLADY 1",
        "FGK": "FIGURÁLNÍ KRESBA",
        "FOT": "FOTOGRAFOVÁNÍ",
        "GRA": "GRAFIKA",
        "ISR": "INTEGROVANÉ SYSTÉMY ŘÍZENÍ",
        "KAJ": "KONVERZACE V ANGLICKÉM JAZYCE",
        "MP2": "MIKROPROCESOROVÁ TECHNIKA 2",
        "MP3": "MIKROPROCESOROVÁ TECHNIKA 3",
        "NAR": "NÁVRHOVÁ A REALIZAČNÍ ČINNOST",
        "NLO": "NÁVRH LOGICKÝCH OBVODŮ",
        "NWS": "NAVRHOVÁNÍ WEBOVÝCH STRÁNEK",
        "OZE": "OBNOVITELNÉ ZDROJE ENERGIE",
        "PAN": "PROGRAMOVÁNÍ APLIKACÍ PRO ANDROID",
        "PGA": "POČÍTAČOVÁ GRAFIKA",
        "PGR": "PROGRAMOVÁNÍ GRAFIKY",
        "PIS": "PÍSMO",
        "PJC": "PROGRAMOVÁNÍ V JAZYCE C++",
        "PS1": "POČÍTAČOVÉ SÍTĚ 1",
        "PSE": "POČÍTAČOVÉ SERVERY",
        "PTG": "PROMTOLOGIE",
        "RPZ": "RUSKÝ JAZYK A KONVERZACE",
        "SEL": "STÁTNÍ ELEKTROPRÁVNÍ PŘEDPISY A LEGISLATIVA",
        "SMA": "SOFISTIKOVANÁ MATEMATIKA",
        "TEK": "TECHNICKÉ KRESLENÍ",
        "VGD": "VÝVOJ A DESIGN HER",
        "VIZ": "VIZUÁLNÍ EFEKTY",
        "VYP": "VÝTVARNÁ PŘÍPRAVA",
        "ZEN": "ZDROJE ENERGIE",
        "ZIT": "ZABEZPEČENÍ INFORMAČNÍCH TECHNOLOGIÍ",
        "ZPV": "ZÁKLADY PŘÍRODNÍCH VĚD"
      };      

      const hourCards = document.querySelectorAll('.hour-card');

      hourCards.forEach(card => {
        const subjectElement = card.querySelector('.subject-name');
        const originalSubjectName = subjectElement.innerText;

        card.addEventListener('mouseenter', (event) => {
          const subjectCode = subjectElement.innerText;

          if (subjectInfo[subjectCode]) {
            subjectElement.innerText = subjectInfo[subjectCode];

            if (subjectElement.innerText.length > 15) {
              subjectElement.style.fontSize = '12px';
            } else {
              subjectElement.style.fontSize = '16px';
            }
          }
        });

        card.addEventListener('mouseleave', () => {
          subjectElement.innerText = originalSubjectName;
          subjectElement.style.fontSize = '16px';
        });
      });
    }
  });
}

// Function to remove hover listeners
function removeHoverListeners() {
  const hourCards = document.querySelectorAll('.hour-card');

  hourCards.forEach(card => {
    const newCard = card.cloneNode(true);
    card.parentNode.replaceChild(newCard, card);
  });

  console.log('Hover listeners removed');
}

// Function to scrape the user profile data
function scrapeUserProfile() {
  const baseURL = "https://sis.ssakhk.cz/Account/UserProfile";
  if (window.location.href.startsWith(baseURL)) {
    const userProfile = {};

    try {
      // Extract the user's name
      const firstName = document.querySelector('td label[for="FirstName"]').parentElement.nextElementSibling.innerText.trim();
      const lastName = document.querySelector('td label[for="LastName"]').parentElement.nextElementSibling.innerText.trim();
      userProfile.name = `${firstName} ${lastName}`;
      console.log("[Kyberna MB] Scraped name:", userProfile.name);

      // Extract the user's email
      const schoolMail = document.querySelector('td label[for="SchoolMail"]').parentElement.nextElementSibling.innerText.trim();
      userProfile.email = schoolMail;
      console.log("[Kyberna MB] Scraped email:", userProfile.email);

      // Extract the profile picture
      const profilePicElement = document.querySelector('.profile-foto img');
      if (profilePicElement) {
        userProfile.profilePictureSrc = profilePicElement.src;
        console.log("[Kyberna MB] Scraped profile picture URL:", userProfile.profilePictureSrc);
      }

      // "Rozdělení třídy"
      const classSeparation = [];
      const classSeparationTable = Array.from(document.querySelectorAll('.studyGroups')).find(group => 
        group.querySelector('th') && group.querySelector('th').innerText.trim() === "Rozdělení třídy"
      );
      if (classSeparationTable) {
        classSeparationTable.querySelectorAll('tr td').forEach(td => {
          classSeparation.push(td.innerText.trim());
        });
      }
      userProfile.classSeparation = classSeparation;
      console.log("[Kyberna MB] Scraped class separation:", userProfile.classSeparation);

      // "Bloky"
      const blocks = [];
      const blokyTable = Array.from(document.querySelectorAll('.studyGroups')).find(group => 
        group.querySelector('th') && group.querySelector('th').innerText.trim() === "Bloky"
      );
      if (blokyTable) {
        blokyTable.querySelectorAll('tr').forEach((row, index) => {
          if (index > 1) {
            const subjectCell = row.querySelector('td:nth-of-type(1)');
            const nameCell = row.querySelector('td:nth-of-type(2)');
            if (subjectCell && nameCell) {
              blocks.push({ subject: subjectCell.innerText.trim(), name: nameCell.innerText.trim() });
            }
          }
        });
      }
      userProfile.blocks = blocks;
      console.log("Scraped blocks:", userProfile.blocks);

      // "Projekty"
      const mainProjects = [];
      const projektyTable = Array.from(document.querySelectorAll('.studyGroups')).find(group => 
        group.querySelector('th') && group.querySelector('th').innerText.trim() === "Projekty"
      );
      if (projektyTable) {
        projektyTable.querySelectorAll('tr td').forEach(td => {
          mainProjects.push(td.innerText.trim());
        });
      }
      userProfile.mainProjects = mainProjects;
      console.log("[Kyberna MB] Scraped main projects:", userProfile.mainProjects);

      // Extract the QR code image source
      const qrCodeSrc = document.querySelector('img[src*="UserProfile.qrcode"]').src;
      userProfile.qrCodeSrc = qrCodeSrc;
      console.log("[Kyberna MB] Scraped QR code URL:", userProfile.qrCodeSrc);

      // Find the container that holds the profile data and remove it
      const profileHeading = Array.from(document.querySelectorAll('h2')).find(
        heading => heading.textContent.trim() === "Profil uživatele"
      );
      if (profileHeading) {
        const profileContainer = profileHeading.closest('.container');
        if (profileContainer) {
          const placeholder = document.createElement('div');
          placeholder.id = 'profile-container';
          profileContainer.parentElement.insertBefore(placeholder, profileContainer);
          profileContainer.remove();
          console.log("[Kyberna MB] Profile container removed and placeholder inserted successfully.");
        } else {
          console.warn("[Kyberna MB] Profile container not found.");
        }
      } else {
        console.warn("[Kyberna MB] Profile heading not found.");
      }

      return userProfile;
    } catch (error) {
      console.error("[Kyberna MB] An error occurred while scraping the user profile:", error);
    }
  }
}

// Function to insert the scraped user profile data into the HTML
function displayUserProfile(userProfile) {
  const profileContainer = document.getElementById('profile-container');
  if (!profileContainer) {
    console.error('[Kyberna MB] Profile container placeholder not found!');
    return;
  }

  profileContainer.innerHTML = '';
  profileContainer.className = 'profile-container';
  const gridContainer = document.createElement('div');
  gridContainer.className = 'grid-container';

  const leftColumn = document.createElement('div');
  leftColumn.className = 'profile-left-column';

  if (userProfile.profilePictureSrc) {
    const profilePicContainer = document.createElement('span');
    profilePicContainer.className = 'profile-pic-container';
    const profilePic = document.createElement('img');
    profilePic.src = userProfile.profilePictureSrc;
    profilePic.alt = 'Profile Picture';
    profilePic.className = 'profile-pic';

    // Add click event listener to play sound
  profilePic.addEventListener('click', function(event) {
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime < 3000) {
      return;
    }
    
    // Check if the click is in the middle of the image
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    if (x > rect.width * 0.4 && x < rect.width * 0.6 && y > rect.height * 0.4 && y < rect.height * 0.6) {
      const audio = new Audio('https://www.myinstants.com/media/sounds/fnaf-12-3-freddys-nose-sound.mp3');
      audio.play();
      lastClickTime = currentTime;
    }
  });

    profilePicContainer.appendChild(profilePic);
    leftColumn.appendChild(profilePicContainer);
  } else {
    const placeholderPic = document.createElement('span');
    placeholderPic.className = 'profile-pic-placeholder';
    placeholderPic.textContent = 'JD';
    leftColumn.appendChild(placeholderPic);
  }

  const profileName = document.createElement('h1');
  profileName.className = 'profile-name';
  profileName.textContent = userProfile.name || 'John Doe';
  leftColumn.appendChild(profileName);

  const profileRole = document.createElement('p');
  profileRole.className = 'profile-role';
  const roleText = userProfile.classSeparation[1] === 'p' ? 'Programování' : (userProfile.classSeparation[1] === 's' ? 'Síťař' : 'Software Engineer');
  profileRole.textContent = roleText;
  leftColumn.appendChild(profileRole);

  const classSeparationContainer = document.createElement('div');
  classSeparationContainer.className = 'class-separation-container';
  const classSeparationTitle = document.createElement('h3');
  classSeparationTitle.className = 'class-separation-title';
  classSeparationTitle.textContent = 'Rozdělení třídy';
  classSeparationContainer.appendChild(classSeparationTitle);
  const classInfo = document.createElement('div');
  classInfo.className = 'class-info';
  const classGroupsList = document.createElement('ul');
  classGroupsList.className = 'class-groups-list';
  userProfile.classSeparation.forEach(group => {
    const listItem = document.createElement('li');
    listItem.textContent = group;
    classGroupsList.appendChild(listItem);
  });
  classInfo.appendChild(classGroupsList);
  classSeparationContainer.appendChild(classInfo);
  leftColumn.appendChild(classSeparationContainer);

  // Move QR code below "Rozdělení třídy"
  if (userProfile.qrCodeSrc) {
    const qrCodeContainer = document.createElement('div');
    qrCodeContainer.className = 'qr-code-container';
    const qrCodeImg = document.createElement('img');
    qrCodeImg.src = userProfile.qrCodeSrc;
    qrCodeImg.className = 'qr-code';
    
    // Tooltip for QR Code
    const qrCodeTooltip = document.createElement('div');
    qrCodeTooltip.className = 'qr-code-tooltip';
    qrCodeTooltip.textContent = 'Toto je váš QR kód k profilu';

    qrCodeContainer.appendChild(qrCodeImg);
    qrCodeContainer.appendChild(qrCodeTooltip);
    leftColumn.appendChild(qrCodeContainer);
  }

  const rightColumn = document.createElement('div');
  rightColumn.className = 'profile-right-column';
  const profileTable = document.createElement('table');
  profileTable.className = 'profile-table';
  
  function addRow(label, value) {
    const row = document.createElement('tr');
    row.className = 'profile-row';
    const labelCell = document.createElement('td');
    labelCell.textContent = label;
    labelCell.className = 'profile-label';
    const valueCell = document.createElement('td');
    valueCell.textContent = value;
    valueCell.className = 'profile-value';
    row.appendChild(labelCell);
    row.appendChild(valueCell);
    profileTable.appendChild(row);
  }
  
  addRow('Email', userProfile.email || 'john.doe@example.com');
  rightColumn.appendChild(profileTable);

  if (userProfile.blocks && userProfile.blocks.length > 0) {
    const blocksTableTitle = document.createElement('h3');
    blocksTableTitle.textContent = 'Bloky';
    blocksTableTitle.className = 'blocks-title';
    rightColumn.appendChild(blocksTableTitle);
    const blocksTable = document.createElement('table');
    blocksTable.className = 'blocks-table';
    const headerRow = document.createElement('tr');
    const subjectHeader = document.createElement('th');
    subjectHeader.textContent = 'Předmět';
    const nameHeader = document.createElement('th');
    nameHeader.textContent = 'Název';
    headerRow.appendChild(subjectHeader);
    headerRow.appendChild(nameHeader);
    blocksTable.appendChild(headerRow);
    userProfile.blocks.forEach(block => {
      const blockRow = document.createElement('tr');
      const subjectCell = document.createElement('td');
      subjectCell.textContent = block.subject;
      const nameCell = document.createElement('td');
      nameCell.textContent = block.name;
      blockRow.appendChild(subjectCell);
      blockRow.appendChild(nameCell);
      blocksTable.appendChild(blockRow);
    });
    rightColumn.appendChild(blocksTable);
  }

  // Add Projects section below Blocks
  if (userProfile.mainProjects && userProfile.mainProjects.length > 0) {
    const projectsTableTitle = document.createElement('h3');
    projectsTableTitle.textContent = 'Projekty';
    projectsTableTitle.className = 'projects-title';
    rightColumn.appendChild(projectsTableTitle);
    const projectsTable = document.createElement('table');
    projectsTable.className = 'projects-table';
    const headerRow = document.createElement('tr');
    const projectHeader = document.createElement('th');
    projectHeader.textContent = 'Název projektu';
    headerRow.appendChild(projectHeader);
    projectsTable.appendChild(headerRow);
    userProfile.mainProjects.forEach(project => {
      const projectRow = document.createElement('tr');
      const projectCell = document.createElement('td');
      projectCell.textContent = project;
      projectRow.appendChild(projectCell);
      projectsTable.appendChild(projectRow);
    });
    rightColumn.appendChild(projectsTable);
  }

  // Static WiFi settings with dynamic 'Načti' button handling
  const wifiSettingsTitle = document.createElement('h3');
  wifiSettingsTitle.textContent = 'Nastavení WiFi';
  wifiSettingsTitle.className = 'wifi-settings-title';
  rightColumn.appendChild(wifiSettingsTitle);

  const wifiSettingsTable = document.createElement('table');
  wifiSettingsTable.className = 'wifi-settings-table';
    
  const params = new URLSearchParams(window.location.search);
  const adUserName = params.get('adUserName');

  const usernameRow = document.createElement('tr');
  const usernameLabel = document.createElement('th');
  usernameLabel.textContent = 'Uživatelské jméno';
  const usernameCell = document.createElement('td');
    
  if (adUserName) {
    usernameCell.textContent = `${adUserName}@ssakhk.cz`;
  } else {
    const usernameForm = document.createElement('form');
    usernameForm.action = '/Account/EduroamProfile';
    usernameForm.method = 'get';
    const usernameSubmit = document.createElement('input');
    usernameSubmit.type = 'submit';
    usernameSubmit.value = 'Načti';
    const usernameText = document.createTextNode('@ssakhk.cz');
    usernameForm.appendChild(usernameSubmit);
    usernameForm.appendChild(usernameText);
    usernameCell.appendChild(usernameForm);
  }
    
  usernameRow.appendChild(usernameLabel);
  usernameRow.appendChild(usernameCell);
  wifiSettingsTable.appendChild(usernameRow);
    
  const passwordRow = document.createElement('tr');
  const passwordLabel = document.createElement('th');
  passwordLabel.textContent = 'Heslo na eduroam';
  const passwordCell = document.createElement('td');
  const passwordForm = document.createElement('form');
  passwordForm.action = '/Account/EduroamProfile';
  passwordForm.method = 'post';
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.name = 'eduroamPassword';
  const passwordSubmit = document.createElement('input');
  passwordSubmit.type = 'submit';
  passwordSubmit.value = 'Uložit';
  passwordForm.appendChild(passwordInput);
  passwordForm.appendChild(passwordSubmit);
  passwordCell.appendChild(passwordForm);
  passwordRow.appendChild(passwordLabel);
  passwordRow.appendChild(passwordCell);
  wifiSettingsTable.appendChild(passwordRow);

  rightColumn.appendChild(wifiSettingsTable);

  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(rightColumn);
  profileContainer.appendChild(gridContainer);
}

// Function to teleport the update GIF to a random location
let lastClickTime = 0;
function teleportGif() {
  const gif = document.querySelector('.update-gif');
  if (!gif) {
    return;
  }

  // Get the dimensions of the viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Get dimensions of the GIF
  const gifWidth = gif.offsetWidth;
  const gifHeight = gif.offsetHeight;

  // Generate random position for the GIF
  const randomX = Math.random() * (viewportWidth - gifWidth);
  const randomY = Math.random() * (viewportHeight - gifHeight);

  // Apply the new position to the GIF
  gif.style.left = `${randomX}px`;
  gif.style.top = `${randomY}px`;
}

// Function to handle the GIF click event
function handleGifClick() {
  const gif = document.querySelector('.update-gif');
  if (!gif) {
    console.error('GIF not found!');
    return;
  }

  let clickCount = 0;
  let firstClickDone = false;

  // Add click event listener to the GIF
  gif.addEventListener('click', function() {
    const currentTime = new Date().getTime();
    
    if (!firstClickDone && currentTime - lastClickTime < 3000) {
      return;
    }

    const audioUrl = clickCount < 9 
      ? 'https://cdn.pixabay.com/audio/2024/08/07/audio_801a5dbcf9.mp3'
      : 'https://cdn.pixabay.com/audio/2022/03/17/audio_d52cf65833.mp3';

    const audio = new Audio(audioUrl);
    audio.play();

    clickCount++;
    lastClickTime = currentTime;

    if (!firstClickDone) {
      firstClickDone = true;
    }

    if (clickCount >= 10) {
      setTimeout(() => {
        console.log('%cNO MORE BOOPING! QwQ', 'color: #B71C1C; font-size: 50px; font-weight: bold;');
        gif.style.display = 'none';
        setTimeout(() => {
          window.location.href = 'https://http.cat/images/401.jpg';
        }, 1000);
      }, 250);
    } else {
      console.log('%c>w<', 'color: pink; font-size: 16px;');
      teleportGif();
    }
  });
}

// Boop initialization
if (window.location.href.includes('https://sis.ssakhk.cz/News')) {
  setTimeout(() => {
    handleGifClick();
  }, 1000);
}

// Function to change the color of crossed out rows
function changeCrossedOutRowsColor() {
  const crossedOutRows = document.querySelectorAll('tr[style*="text-decoration:line-through"]');
  
  crossedOutRows.forEach(row => {
    row.style.color = 'red';
    row.querySelectorAll('*').forEach(child => {
      child.style.color = 'red';
    });
  });
}





// Function to ensure the timetable data is loaded
function waitForTimetableContent() {
  return new Promise((resolve, reject) => {
    const checkExist = setInterval(() => {
      const weekDivs = document.querySelectorAll('.container .content div');
      if (weekDivs.length >= 2) {
        clearInterval(checkExist);
        resolve(weekDivs);
      } else if (document.readyState === 'complete') {
        clearInterval(checkExist);
        reject("[KybernaMB] Week data not found.");
      }
    }, 100);
  });
}

// Function to preload images sequentially and enable buttons
async function preloadImagesSequentially(imageUrls, dayButtons, preloadedImages) {
  console.log(`[KybernaMB] Preloading ${imageUrls.length} images...`);

  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const dayButton = dayButtons[i];

    await new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        console.log(`[KybernaMB] Loaded image: ${url}`);
        preloadedImages[url] = img;
        dayButton.classList.remove('disabled');
        resolve();
      };
      img.onerror = () => {
        console.error(`[KybernaMB] Failed to load image: ${url}`);
        dayButton.classList.remove('disabled');
        resolve();
      };
    });
  }

  console.log("[KybernaMB] All images preloaded.");
}

// Function to replace the timetable with clickable sections
async function replaceTimetableWithPanel() {
  if (window.location.href.includes('/TimeTable/School')) {
    console.log("[KybernaMB] Replacing timetable with panel...");
    const container = document.querySelector('.container .content');
    
    if (!container) {
      console.error("[KybernaMB] Container not found!");
      return;
    }

    try {
      const weekDivs = await waitForTimetableContent();
      
      container.innerHTML = '';

      const header = document.createElement('h1');
      header.classList.add('main-header');
      header.textContent = 'Rozvrh hodin';
      container.appendChild(header);

      const allImageUrls = [];
      const dayButtons = [];
      const preloadedImages = {};

      const weeksContainer = document.createElement('div');
      weeksContainer.classList.add('weeks-container');

      weekDivs.forEach((weekDiv, weekIndex) => {
        const weekLabelText = weekDiv.textContent.match(/Tento týden \(([\d.]+) - ([\d.]+)\):/);
        if (!weekLabelText) {
          console.error("Week label not found in:", weekDiv.textContent);
          return;
        }

        const weekStartDate = weekLabelText ? weekLabelText[1] : 'Neznámé Datum Začátku';
        const weekEndDate = weekLabelText ? weekLabelText[2] : 'Neznámé Datum Konce';
        const weekLabel = weekIndex === 0 
          ? `Tento týden (${weekStartDate} - ${weekEndDate})` 
          : `Další týden (${weekStartDate} - ${weekEndDate})`;

        const weekContainer = document.createElement('div');
        weekContainer.classList.add('week-container');

        const weekHeader = document.createElement('button');
        weekHeader.classList.add('week-header', 'btn', 'btn-default');
        weekHeader.textContent = weekLabel;

        const weekSectionPanel = document.createElement('div');
        weekSectionPanel.classList.add('section-panel', 'collapsed');
        weekSectionPanel.style.display = 'none';

        weekHeader.addEventListener('click', () => {
          const isCollapsed = weekSectionPanel.classList.contains('collapsed');
          weekSectionPanel.style.display = isCollapsed ? 'flex' : 'none';
          weekSectionPanel.classList.toggle('collapsed');
        });

        const dayLinks = weekDiv.querySelectorAll('a');
        dayLinks.forEach((link) => {
          const dayShortName = link.textContent;
          const dayNames = {
            'po': 'Pondělí', 'út': 'Úterý', 'st': 'Středa', 'čt': 'Čtvrtek', 'pá': 'Pátek',
          };
          const dayName = dayNames[dayShortName] || 'Unknown';

          allImageUrls.push(link.href);

          const dayButton = document.createElement('span');
          dayButton.classList.add('day-text', 'disabled');
          dayButton.textContent = dayName;

          dayButton.addEventListener('click', () => {
            if (!preloadedImages[link.href]) {
              console.log(`[KybernaMB] Image for ${dayName} not yet loaded, ignoring click.`);
              return;
            }

            console.log(`[KybernaMB] Displaying timetable for ${dayName}`);

            const activeButton = document.querySelector('.day-text.active');
            if (activeButton) {
              activeButton.classList.remove('active');
            }

            if (activeButton !== dayButton) {
              dayButton.classList.add('active');

              // Clear any previous content
              const dayContainer = document.createElement('div');
              dayContainer.classList.add('day-container');
              container.querySelectorAll('.day-container').forEach(dc => dc.remove());
              container.appendChild(dayContainer);

              const img = preloadedImages[link.href].cloneNode(true);
              img.classList.add('day-image');
              img.addEventListener('click', () => {
                window.open(link.href, '_blank');
              });
              dayContainer.appendChild(img);
            } else {
              dayButton.classList.remove('active');
              container.querySelectorAll('.day-container').forEach(dc => dc.remove());
            }
          });

          dayButtons.push(dayButton);
          weekSectionPanel.appendChild(dayButton);
        });

        weekContainer.appendChild(weekHeader);
        weekContainer.appendChild(weekSectionPanel);
        weeksContainer.appendChild(weekContainer);
      });
      container.appendChild(weeksContainer);

      await preloadImagesSequentially(allImageUrls, dayButtons, preloadedImages);

    } catch (error) {
      console.error(error);
    }
  }
}

// Function to handle click events on hour cards
function replaceHourCardContent() {
  const hourCards = document.querySelectorAll('.hour-card');

  hourCards.forEach((card) => {
    if (card.hasAttribute('href')) {
      const url = card.getAttribute('href');
      card.removeAttribute('href');
      card.dataset.url = url;
    }

    card.addEventListener('click', handleCardClick);

    // Check for existing notes to display the glowing red dot
    const debugId = card.getAttribute('data-debugid');
    chrome.storage.local.get(debugId, (result) => {
      const savedData = result[debugId] || {};
      if (savedData.notesList && savedData.notesList.length > 0) {
        addGlowingRedDotToCard(card);
      }
    });
  });

  async function handleCardClick(event) {
    try {
      const card = event.currentTarget;
      const subjectName = card.querySelector('.subject-name').innerText;
      const time = card.querySelector('.time').innerText;
      const roomNumber = card.querySelector('.room-name').innerText;
      const url = card.dataset.url || null;
      const debugId = card.getAttribute('data-debugid');
  
      // Fetch any stored notes for the current card
      const savedData = await getStorageData(debugId);
      
      openPopup({
        subjectName,
        time,
        roomNumber,
        url,
        debugId,
        notesList: savedData?.notesList || [],
      });
    } catch (error) {
      console.error("[KybernaMB] Failed to fetch storage data:", error);
    }
  }  

  // Utility function to promisify chrome.storage.local.get
  function getStorageData(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[key]);
        }
      });
    });
  }

  // Function to add a glowing red dot
  function addGlowingRedDotToCard(card) {
    const subjectNameEl = card.querySelector('.subject-name');
    const existingDot = card.querySelector('.red-dot-container');
    if (!existingDot) {
      const redDotContainer = document.createElement('div');
      redDotContainer.classList.add('red-dot-container');

      // Glowing red dot element
      const redDot = document.createElement('div');
      redDot.classList.add('glowing-red-dot');
      
      redDotContainer.appendChild(redDot);

      // Insert the red dot container
      subjectNameEl.parentNode.insertBefore(redDotContainer, subjectNameEl);
    }
  }

  function removeGlowingRedDotFromCard(card) {
    const redDotContainer = card.querySelector('.red-dot-container');
    if (redDotContainer) {
      redDotContainer.remove();
    }
  }

  // Create and display a popup over the card
  function openPopup({
    subjectName,
    time,
    roomNumber,
    url,
    debugId,
    notesList,
  }) {
    const overlay = document.createElement('div');
    overlay.classList.add('popup-overlay');

    const popupContainer = document.createElement('div');
    popupContainer.classList.add('popup-container');

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closePopup();
      }
    });

    function closePopup() {
      popupContainer.classList.remove('popup-open');
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 300);
    }

    const closeButton = document.createElement('span');
    closeButton.classList.add('popup-close');
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', closePopup);

    if (url) {
      const joinButton = document.createElement('a');
      joinButton.href = url;
      joinButton.target = '_blank';
      joinButton.classList.add('join-url-button');
      joinButton.textContent = 'Připojit se k hodině';
      popupContainer.appendChild(joinButton);
    }

    const subjectDetails = document.createElement('div');
    subjectDetails.classList.add('popup-details');
    subjectDetails.innerHTML = `
      <p><strong>Předmět:</strong> ${subjectName}</p>
      <p><strong>Čas:</strong> ${time}</p>
      <p><strong>Místnost:</strong> ${roomNumber}</p>
    `;
    popupContainer.appendChild(subjectDetails);

    const notesListContainer = document.createElement('div');
    notesListContainer.classList.add('notes-list-container');
    popupContainer.appendChild(notesListContainer);

    function renderNotesList() {
      notesListContainer.innerHTML = '';

      notesList.forEach((note, index) => {
        const noteItem = document.createElement('div');
        noteItem.classList.add('note-item');

        const bulletPoint = document.createElement('span');
        bulletPoint.textContent = '•';
        bulletPoint.classList.add('note-bullet');
        noteItem.appendChild(bulletPoint);

        const noteTypeSelect = document.createElement('select');
        noteTypeSelect.classList.add('note-type-select');
        ['Domácí Úkol', 'Test', "Zkoušení", "Prezentace", 'Ostatní'].forEach((type) => {
          const option = document.createElement('option');
          option.value = type;
          option.textContent = type;
          if (note.type === type) {
            option.selected = true;
          }
          noteTypeSelect.appendChild(option);
        });
        noteItem.appendChild(noteTypeSelect);

        const noteTextInput = document.createElement('input');
        noteTextInput.type = 'text';
        noteTextInput.classList.add('note-text-input');
        noteTextInput.placeholder = 'Název';
        noteTextInput.value = note.text;
        noteItem.appendChild(noteTextInput);

        noteTypeSelect.addEventListener('change', () => {
          updateNote(index, noteTypeSelect.value, noteTextInput.value);
        });
        noteTextInput.addEventListener('input', () => {
          updateNote(index, noteTypeSelect.value, noteTextInput.value);
        });

        const noteDeleteButton = document.createElement('button');
        noteDeleteButton.classList.add('note-delete-button');
        noteDeleteButton.textContent = 'Odstranit';
        noteItem.appendChild(noteDeleteButton);

        noteDeleteButton.addEventListener('click', () => {
          notesList.splice(index, 1);
          renderNotesList();
          saveNotes();
        });

        notesListContainer.appendChild(noteItem);
      });
    }

    // Function to update a note and save
    function updateNote(index, type, text) {
      notesList[index] = { type, text };
      saveNotes();
    }

    // Function to save notes list to Chrome storage
    function saveNotes() {
      chrome.storage.local.set(
        { [debugId]: { subjectName, time, roomNumber, notesList } },
        () => {
          console.log('Notes list saved');
          const card = document.querySelector(`[data-debugid="${debugId}"]`);
          if (notesList.length > 0) {
            addGlowingRedDotToCard(card);
          } else {
            removeGlowingRedDotFromCard(card);
          }
        }
      );
    }
    renderNotesList();

    const addNoteButton = document.createElement('button');
    addNoteButton.classList.add('add-note-button');
    addNoteButton.textContent = 'Přidat novou poznámku';
    popupContainer.appendChild(addNoteButton);

    addNoteButton.addEventListener('click', () => {
      notesList.push({ type: 'Homework', text: '' });
      renderNotesList();
      saveNotes();
    });

    popupContainer.appendChild(closeButton);
    overlay.appendChild(popupContainer);
    document.body.appendChild(overlay);

    setTimeout(() => {
      popupContainer.classList.add('popup-open');
    }, 10);
  }
}

// Function to monitor the loading element
function monitorLoadingElement() {
  const loadingElementSelector = '.loading .content';
  
  const intervalId = setInterval(() => {
    const loadingElement = document.querySelector(loadingElementSelector);
    
    if (loadingElement) {
      console.log('[KybernaMB] Loading element is visible: Načítání');
    } else {
      clearInterval(intervalId);
      replaceHourCardContent();
    }
  }, 500);
}

const prevDayButton = document.querySelector('#prev-day');
const nextDayButton = document.querySelector('#next-day');
const toggleSwitch = document.querySelector('.static-switch input[type="checkbox"]');

if (prevDayButton) {
  prevDayButton.addEventListener('click', () => {
    monitorLoadingElement();
  });
}

if (nextDayButton) {
  nextDayButton.addEventListener('click', () => {
    monitorLoadingElement();
  });
}

if (toggleSwitch) {
  toggleSwitch.addEventListener('change', () => {
    monitorLoadingElement();
  });
}

// Function to insert the update image
function insertUpdateImage() {
  const intervalId = setInterval(() => {
    const changelogElement = document.querySelector('.update-changelog');

    if (changelogElement) {
      const updateImage = document.createElement('img');
      updateImage.alt = 'Detaily Hodiny';
      updateImage.classList.add('update-img');

      const imageUrl = chrome.runtime.getURL('classdetails.png');
      updateImage.src = imageUrl;

      updateImage.style.cursor = 'pointer';
      updateImage.addEventListener('click', () => {
        window.open(imageUrl, '_blank');
      });

      changelogElement.appendChild(updateImage);
      clearInterval(intervalId);
    }
  }, 100);
}

let highlightTimeoutId = null;

// Function to inject enhanced CSS styles for highlighting
function injectEnhancedHighlightStyles() {
  const style = document.createElement('style');
  style.textContent = `
    td.hour {
      transition: background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease;
    }

    .highlight-column {
      background-color: rgba(173, 216, 230, 0.3) !important;
    }

    .highlight-cell {
      z-index: 1;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }

    tr > td.highlight-column[title] {
      background-color: transparent !important;
    }
  `;
  document.head.appendChild(style);
}

// Function to remove all existing highlights
function removeAllEnhancedHighlights() {
  const highlightedColumns = document.querySelectorAll('.highlight-column');
  highlightedColumns.forEach(col => col.classList.remove('highlight-column'));

  const highlightedCells = document.querySelectorAll('.highlight-cell');
  highlightedCells.forEach(cell => cell.classList.remove('highlight-cell'));
}

// Function to highlight the selected column with enhanced styles
function highlightSelectedEnhancedCell(event) {
  // Check if the middle mouse button was clicked (button === 1)
  if (event.button !== 1) {
    return;
  }

  removeAllEnhancedHighlights();

  const clickedCell = event.currentTarget;

  // Add highlight to the clicked cell
  clickedCell.classList.add('highlight-cell');

  const cellIndex = Array.from(clickedCell.parentElement.children).indexOf(clickedCell);

  let table = clickedCell.closest('table');
  if (!table) {
    console.error("[KybernaMB] Could not find the parent table element.");
    return;
  }

  const tbody = table.querySelector('tbody');
  if (!tbody) {
    console.error("[KybernaMB] No <tbody> found within the table.");
    return;
  }

  const rows = tbody.querySelectorAll('tr');

  rows.forEach((r, index) => {
    const cells = r.children;
    if (cells[cellIndex]) {
      if (!cells[cellIndex].hasAttribute('title')) {
        cells[cellIndex].classList.add('highlight-column');
      }
    }
  });

  if (highlightTimeoutId !== null) {
    clearTimeout(highlightTimeoutId);
  }

  highlightTimeoutId = setTimeout(() => {
    removeAllEnhancedHighlights();
    highlightTimeoutId = null;
  }, 2000);
}

// Function to add event listeners to all timetable cells
function addEnhancedCellEventListeners() {
  const cells = document.querySelectorAll('td.hour');

  cells.forEach((cell, index) => {
    cell.style.cursor = 'pointer';

    cell.addEventListener('auxclick', highlightSelectedEnhancedCell);
  });
}

// Function to initialize the enhanced highlighting feature
function initializeEnhancedCellHighlighting() {
  injectEnhancedHighlightStyles();
  addEnhancedCellEventListeners();
}




// Function to apply custom styles before the page loads
window.addEventListener("load", function() {
  document.body.style.display = "block";
});

// Initialization
//insertUpdateImage();
insertNavbarToggleButton();
updateTextColorBasedOnBgColor();
setInterval(updateTextColorBasedOnBgColor, 100);
setInterval(updateCurrentTimeLine, 1000);
updateColspanWithCzechMonths();
insertContentAndApplyStyles();
insertContentAfterDiv();
setTitleIfURLMatches();
changeFaviconForDomain();
replaceFinanceInfoContent();
replaceFinanceInfoContent();
styleNewFinanceInfo();
showFullSubjectNameOnHover();
insertNextSubjectContainerAndButton();
changeCrossedOutRowsColor();
//replaceTimetableWithPanel();
replaceHourCardContent();
initializeEnhancedCellHighlighting();
const userProfileData = scrapeUserProfile();
if (userProfileData) {
  displayUserProfile(userProfileData);
}






/* function getMonday(d) {
  d = new Date(d);
  var day = d.getDay(),
      diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(d.setDate(diff));
}

// Adjusted extractEntireTimetableData function to include dynamic date calculation
function extractEntireTimetableData() {
  const columns = document.querySelectorAll('.timetable .col');
  const dayNames = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek"];
  const startDate = getMonday(new Date()); // Get Monday of the current week

  const timetableData = [];

  columns.forEach((column, index) => {
    const isActive = column.classList.contains('active');
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + index); // Calculate the date for each day

    // Formatting the date as '29.3' for 29th of March
    const dayLabelFormatted = `${dayDate.getDate()}.${dayDate.getMonth() + 1}`;
    const dayLabel = dayNames[index];

    const hourCards = column.querySelectorAll('.hour-card, .hour-card.canceled-card, .hour-card.changed-card');
    const subjects = Array.from(hourCards).map(card => ({
      subjectName: card.querySelector('.subject-name')?.innerText.trim(),
      time: card.querySelector('.time')?.innerText.trim(),
      roomName: card.querySelector('.room-name')?.innerText.trim(),
      groupName: card.querySelector('.group-name')?.innerText.trim(),
      teacher: card.querySelector('.teacher')?.innerText.trim(),
      link: card.href || null,
      status: card.classList.contains('canceled-card') ? 'canceled' : (card.classList.contains('changed-card') ? 'changed' : 'normal')
    }));

    timetableData.push({ 
      dayLabel,
      dayDate: dayLabelFormatted,
      isActive,
      subjects 
    });
  });

  return timetableData;
}

function createAndDisplayNewTimetable() {
  const timetableData = extractEntireTimetableData();
  const newContainer = document.createElement('div');
  newContainer.className = 'calendar'; // Use 'calendar' instead of 'custom-timetable-container' for the class name
  document.body.appendChild(newContainer);

  let timelineHtml = '<div class="timeline"><div class="spacer"></div>';
  // Assuming a fixed timeline for simplicity
  const hours = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"];
  hours.forEach(hour => {
    timelineHtml += `<div class="time-marker">${hour}</div>`;
  });
  timelineHtml += '</div>'; // Close timeline div

  let daysHtml = '<div class="days">';
  timetableData.forEach(day => {
    daysHtml += `
      <div class="day ${day.isActive ? 'active' : ''}">
        <div class="date">
          <p class="date-num">${day.dayDate}</p>
          <p class="date-day">${day.dayLabel}</p>
        </div>
        <div class="events">`;

    day.subjects.forEach(subject => {
      let startHour = parseInt(subject.time.split(' - ')[0].split(':')[0]);
      let endHour = parseInt(subject.time.split(' - ')[1].split(':')[0]);
      daysHtml += `
          <div class="event" style="--event-start: ${startHour - 8}; --event-end: ${endHour - 8}; background-color: ${subject.status === 'canceled' ? 'var(--eventColor3)' : 'var(--eventColor1)'};">
            <p class="title">${subject.subjectName}</p>
            <p class="time">${subject.time}</p>
          </div>`;
    });

    daysHtml += '</div></div>'; // Close events and day div
  });
  daysHtml += '</div>'; // Close days div

  newContainer.innerHTML = timelineHtml + daysHtml;
}

// Make sure to call this function to initialize the timetable
createAndDisplayNewTimetable(); */
