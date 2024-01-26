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

    // Determine the CSS file name based on the selected theme
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

// Update current time line
function updateCurrentTimeLine() {
  const timetableDiv = document.querySelector('div.timetable');
  if (!timetableDiv) return;

  let currentTimeLine = document.getElementById('current-time-line');
  if (!currentTimeLine) {
    currentTimeLine = document.createElement('div');
    currentTimeLine.style = 'position: absolute; background-color: red; height: 4px;';
    currentTimeLine.id = 'current-time-line';
    timetableDiv.querySelector('div.hour-lines').appendChild(currentTimeLine);
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  if (currentHour >= 7 && currentHour < 19) {
    const startTime = 7;
    const endTime = 19;
    const hoursSinceStart = currentHour - startTime;
    const totalHours = endTime - startTime;
    const minutesSinceStart = hoursSinceStart * 60 + currentMinute;
    const totalMinutes = totalHours * 60;
    let topPosition = (minutesSinceStart / totalMinutes) * timetableDiv.querySelector('div.hour-lines').clientHeight;

    topPosition = Math.min(topPosition, 1140);

    currentTimeLine.style.top = `${topPosition}px`;
    currentTimeLine.style.width = '500%';
    currentTimeLine.style.display = 'block';
  } else {
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

// This function checks for an error message when the page loads
function checkForErrorAndRedirect() {
  const errorMessage = document.querySelector('h1');
  if (errorMessage && errorMessage.textContent.includes('Server Error in \'/\' Application.')) {
    console.log("No you can't go here silly x3");
    window.location.href = 'https://sis.ssakhk.cz/News';
    
  }
}

// Run the function
window.addEventListener('load', checkForErrorAndRedirect);


// Function to insert content and apply theme-specific styles
function insertContentAndApplyStyles() {
  if (window.location.href === 'https://sis.ssakhk.cz/News') {
    const h2Element = document.querySelector('h2.text-center');
    const version = chrome.runtime.getManifest().version;

    // Determine which CSS file to load based on the stored theme
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
        // Replace placeholders in HTML content
        const updatedHtmlContent = htmlContent.replace(/\{\{version\}\}/g, version);

        // Create style element for CSS
        const styleEl = document.createElement('style');
        styleEl.textContent = cssContent;
        document.head.appendChild(styleEl);

        // Check if the h2 element exists
        if (h2Element) {
          // Insert the updated HTML content after the h2 element
          h2Element.insertAdjacentHTML('afterend', updatedHtmlContent);
        }
      })
      .catch(error => console.error('Error loading content:', error));
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
    link.href = 'https://gcdnb.pbrd.co/images/CDpSp5R80QKE.png?o=1';

    // Remove existing favicons
    oldLinks.forEach(oldLink => {
      oldLink.parentNode.removeChild(oldLink);
    });

    // Append
    document.head.appendChild(link);
  }
}

// Function insert content after the div element with the class 'static-switch'
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
      // Insert
      document.head.insertAdjacentHTML('beforeend', styleHtmlContent);
      divElement.insertAdjacentHTML('afterend', labelHtmlContent);
      setUpCheckboxListener();
    }
  }
}

// Function set up checkbox listener
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
        container.innerHTML = ''; // Clear existing content

        data.forEach(([header, ...tableData]) => {
            let table = document.createElement('table');
            table.className = 'modern-table';

            // Create and insert table header (title)
            let tableHeader = document.createElement('div');
            tableHeader.className = 'modern-table-header';
            tableHeader.innerText = header;
            container.appendChild(tableHeader);

            // Create header row
            let headerRow = document.createElement('thead');
            tableData.shift().forEach(headerText => {
                let th = document.createElement('th');
                th.innerText = headerText;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            // Initialize a flag to check if the class is closed
            let isClosed = false;

            // Create data rows
            tableData.forEach((rowData, rowIndex) => {
                let row = document.createElement('tr');

                rowData.forEach((cellData, cellIndex) => {
                    let cell = document.createElement('td');
                    cell.innerText = cellData;

                    // Special styling and check for the final grade row
                    if (rowIndex === tableData.length - 1) {
                        row.className = 'final-grade-row';
                        if (cellIndex === 2 && cellData.trim() === '*') {
                            isClosed = true; // Mark as closed if asterisk is found
                        }
                        // Special styling for the final grade row
                        if (rowIndex === tableData.length - 1) {
                          row.className = 'final-grade-row';
                          if (cellIndex === 1) {
                              cell.classList.add('final-grade-cell');
                      
                              // Check for non-numeric grades first
                              if (cellData.toLowerCase() === 'n') {
                                  cell.style.color = 'red'; // Color for grade "n"
                              } else {
                                  // Handle numeric grades
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
                    }

                    row.appendChild(cell);
                });

                table.appendChild(row);
            });

            // Append '- Uzavřeno' to the subject name if closed
            if (isClosed) {
                tableHeader.innerText += ' - Uzavřeno';
            }

            container.appendChild(table);
        });
    }

    // Fetch the container
    let container = document.querySelector('.classification-container');

    // Proceed only if container exists
    if (container) {
        // Extract data and headers from existing tables
        let originalData = [];
        container.querySelectorAll('.panel').forEach(panel => {
            let header = panel.querySelector('.panel-heading').innerText; // Get the table name
            let tableData = [];
            panel.querySelectorAll('table tr').forEach(row => {
                let rowData = [];
                row.querySelectorAll('th, td').forEach(cell => {
                    rowData.push(cell.innerText);
                });
                tableData.push(rowData);
            });
            originalData.push([header, ...tableData]); // Include the header in the data array
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


// Check if on the Absent page
if (window.location.href.includes('https://sis.ssakhk.cz/Absent')) {
    // Define the function to search for the table within the scope of the Absent page check
    function searchForTable() {
        // Fetch the container where the original table is located
        let container = document.querySelector('.absent-sumarized-table');

        if (container) {
            // Find the original table
            let originalTable = container.querySelector('.table');
            
            if (originalTable) {
                // Extract data from the original table
                let data = extractTableData(originalTable);

                // Remove the original table
                originalTable.remove();
                console.log("[Kyberna MB] Original Table data saved.");
                // Insert the modern version of the table
                insertModernTables(data, container);
            } else {
                console.log("[Kyberna MB] Original table not found. Retrying...");
                // Wait for a while before retrying
                setTimeout(searchForTable, 3000); // Adjust the delay as needed
            }
        } else {
            console.log("[Kyberna MB] Container not found. Retrying...");
            // Wait for a while before retrying
            setTimeout(searchForTable, 3000); // Adjust the delay as needed
        }
    }

    // Start the first search
    searchForTable();
}


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

function insertModernTables(data, container) {
  // Clear existing content and make container visible
  container.innerHTML = '';
  let absentSumarizedTable = document.querySelector('.absent-sumarized-table');
    if (absentSumarizedTable) {
        absentSumarizedTable.style.display = 'block';
        absentSumarizedTable.style.height = 'auto';
        absentSumarizedTable.style.width = 'auto';
    }

  let table = document.createElement('table');
  table.className = 'modern-table';

  // Assuming the first row of data is the header
  let headerRow = document.createElement('thead');
  let headerData = data.shift(); // First row as header
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
  // Apply gradient to 'Procenta' row
  applyGradientToProcentaRow(table);
}

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
  // Adjust the color range to be more visible on #1E1E1E
  const redIntensity = Math.min(255, (percentage / 100) * 255);
  const greenIntensity = 0; // No green
  const blueIntensity = 0; // No blue
  const alpha = 0.5; // Adjust the alpha for visibility

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

    // Call the function to save the finance information
    saveFinanceInfo();
}

// Function to replace finance information content on the page
function replaceFinanceInfoContent() {
    let originalContainer = document.querySelector('.alert.alert-info');
    if (originalContainer) {
        chrome.storage.local.get("financeInfo", function(result) {
            if (result.financeInfo) {
                // Call a function to modify and display finance information
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
      newHtml += `<div class="custom-list">`; // Use a custom div for the list

      vsTable.querySelectorAll('tr').forEach(row => {
          const description = row.cells[0]?.innerText;
          const value = row.cells[1]?.innerText;
          if (description && value) {
              // Use <div> elements for list items
              newHtml += `<div class="list-item"><strong>${description}:</strong> ${value}</div>`;
          }
      });

      newHtml += `</div>`; // Close the custom list div
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

        // Create a link element to apply styles
        const link = document.createElement('link');
        link.href = chrome.runtime.getURL(cssFileName);
        link.type = 'text/css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    });
}

// Call the function to replace and style finance information
replaceFinanceInfoContent();
styleNewFinanceInfo();







// Function to apply custom styles before the page loads
window.addEventListener("load", function() {
  document.body.style.display = "block";
});

// Initialization
insertNavbarToggleButton();
updateTextColorBasedOnBgColor();
setInterval(updateTextColorBasedOnBgColor, 100);
updateCurrentTimeLine();
setInterval(updateCurrentTimeLine, 1000);
updateColspanWithCzechMonths();
insertContentAndApplyStyles();
insertContentAfterDiv();
setTitleIfURLMatches();
changeFaviconForDomain();
replaceFinanceInfoContent();