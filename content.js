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
    '1': 'Leden', '2': 'Únor', '3': 'Březen', '4': 'Duben',
    '5': 'Květen', '6': 'Červen', '7': 'Červenec', '8': 'Srpen',
    '9': 'Září', '10': 'Říjen', '11': 'Listopad', '12': 'Prosinec'
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


// Function to insert content and apply theme-specific styles
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

    chrome.storage.local.get(['selectedTheme'], function(result) {
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
        }
      })
      .catch(error => console.error('[Kyberna MB] Error loading content:', error));
    });
  }
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
                                      cell.style.color = 'red';
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

// Function to apply gradient to the Procenta row
function applyGradientToProcentaRow(table) {
  const procentaRow = Array.from(table.rows).find(row => row.cells[0] && row.cells[0].innerText.trim() === 'Procenta');
  if (procentaRow) {
      Array.from(procentaRow.cells).forEach(cell => {
          const percentage = parseFloat(cell.innerText);
          if (!isNaN(percentage)) {
              cell.style.backgroundColor = getGradientColor(percentage);
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

  for (let i = 0; i < hourCards.length; i++) {
    const card = hourCards[i];
    const timeText = card.querySelector('.time').innerText;
    const [startTime, endTime] = timeText.split(' - ').map(t => t.trim());
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
    const endDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute);

    if (now >= startDateTime && now < endDateTime) {
      // Current subject
      foundCurrent = true;
      const diffEndSeconds = Math.floor((endDateTime - now) / 1000);
      const subjectName = card.querySelector('.subject-name').innerText;
      const roomNumber = card.querySelector('.room-name').innerText;
      container.innerHTML = `<strong>Nyní:</strong> ${subjectName} - ${roomNumber}<br><strong>Končí za:</strong> ${formatTime(diffEndSeconds)}`;

      // Look ahead for the next subject
      if (i + 1 < hourCards.length) {
        const nextCard = hourCards[i + 1];
        const nextTimeText = nextCard.querySelector('.time').innerText;
        const [nextStartHour, nextStartMinute] = nextTimeText.split(' - ')[0].split(':').map(Number);
        const nextStartDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), nextStartHour, nextStartMinute);
        const diffStartNextSeconds = Math.floor((nextStartDateTime - now) / 1000);
        const nextSubjectName = nextCard.querySelector('.subject-name').innerText;
        const nextRoomNumber = nextCard.querySelector('.room-name').innerText;

        container.innerHTML += `<br><strong>Následující:</strong> ${nextSubjectName} - ${nextRoomNumber}<br><strong>Začíná za:</strong> ${formatTime(diffStartNextSeconds)}`;
      } else {
        // No more subjects for the day
        container.innerHTML += `<br><strong>Žádná další hodina</strong>`;
      }
      break;
    }

    if (!foundCurrent && now < startDateTime) {
      // Next subject
      nextSubjectInfo = {
        name: card.querySelector('.subject-name').innerText,
        roomNumber: card.querySelector('.room-name').innerText,
        startDateTime
      };
      break;
    }
  }

  if (!foundCurrent && nextSubjectInfo) {
    // Přestávka
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












// Function to apply custom styles before the page loads
window.addEventListener("load", function() {
  document.body.style.display = "block";
});

// Initialization
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
insertNextSubjectContainerAndButton();
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
