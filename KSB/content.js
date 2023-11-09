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

// Update colspan elements with Czech month names
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

// This function will find the link with the specified text and disable it.
function disableLinkByText(linkText) {
  // Get all 'a' elements
  const links = document.querySelectorAll('a');
  
  // Loop through all links
  links.forEach(link => {
    if (link.textContent.trim() === linkText) {
      // Disable the link by preventing the default action
      link.addEventListener('click', function(event) {
        event.preventDefault();
      });
      
      // Add a class to grey it out or indicate it's disabled
      link.classList.add('disabled-link');
      
      // Optionally remove the href attribute
      link.removeAttribute('href');
    }
  });
}

// Add CSS for the disabled link
const style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
  .disabled-link {
    color: grey !important; /* Change the color to grey or any indication of disabled state */
    pointer-events: none; /* Makes it not clickable */
    text-decoration: none; /* Removes underline to make it look disabled */
    cursor: default;
  }
`;
document.head.appendChild(style);

// Call the function with the text content of the link you want to disable
disableLinkByText('Výpis z vysvědčení');

// Update profile photo with a random image from a list
function updateProfilePhoto() {
  // Array of image URLs
  const imageUrls = [
    'https://media.istockphoto.com/id/908673320/photo/swiss-alps-mountain-view.jpg?s=612x612&w=0&k=20&c=R4m2GuR5J9Ottw7Y0C5JmUepz3ZrptNJYzCg3vKKFE0=',
    'https://e0.pxfuel.com/wallpapers/412/709/desktop-wallpaper-huawei-landscape-mountain-paintings-nature-vertical-mountain-thumbnail.jpg',
    'https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/appalachian-mountains-scenic-sunset-spring-flowers-vertical-landscape-photography-dave-allen.jpg'
  ];

  // Select a random image URL
  const randomImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];

  // Select the image element by its container class
  const profilePhoto = document.querySelector('.profile-foto img');
  
  // Set the new image URL
  if (profilePhoto) {
    profilePhoto.src = randomImageUrl;
  }
}


// Function to insert content after the h2 element with the extension's current version
function insertContentAfterH2() {
  // Check if the current URL is the one we want to target
  if (window.location.href === 'https://sis.ssakhk.cz/News') {
    // Find the h2 element with the class 'text-center'
    const h2Element = document.querySelector('h2.text-center');
    // Get the current version from the manifest file
    const version = chrome.runtime.getManifest().version;

    // Define the HTML content to be inserted
    const newHtmlContent = `
      <style>
        .custom-container {
          background-color: #171717; /* Dark background for the container */
          color: #ffffff; /* White text color for readability */
          border-radius: 4px;
          padding: 20px;
          margin-top: 20px;
          display: flex; /* Use flexbox for centering */
          flex-direction: column; /* Stack children vertically */
          align-items: center; /* Center children horizontally */
        }
        .custom-content h2 {
          color: #00337C; /* Main color for headings */
          margin-bottom: 15px;
        }
        .custom-content .desc {
          margin-bottom: 10px;
        }
        .custom-content .dateSpan {
          background-color: #00337C;
          color: #ffffff;
          padding: 3px 6px;
          border-radius: 2px;
          font-size: 0.9em;
        }
        .custom-content a {
          color: #4da6ff;
          text-decoration: none;
        }
        .custom-content a:hover {
          text-decoration: underline;
        }
        .custom-footer-button {
          text-align: center;
          padding: 15px 0;
          background: #00337C; /* Use the main color for the footer background */
          color: #ffffff; /* White text for contrast */
          border-radius: 4px;
          margin-top: 20px;
          width: 25%; /* Ensure the footer takes full width */
          display: block; /* Make it a block element */
          text-decoration: none; /* No underline */
          transition: background-color 0.3s ease; /* Smooth background color transition */
        }
        .custom-footer-button:hover {
          background-color: #002855; /* Darken the color on hover */
          text-decoration: none; /* No underline on hover */
        }
        .custom-footer-button p {
          margin: 0; /* Remove default margins */
          line-height: 1.5; /* Add some line height for better readability */
        }
        .custom-footer-button .fa {
          margin-right: 5px; /* Space before the text */
        }
      </style>
      <div class="custom-container">
        <div class="custom-content">
          <div class="row"></div>
          <h2>Aktualizace v${version}</h2>
          <span class="dateSpan">09/11/2023</span>
          <br><br>
          <p class="desc">• Nový styl sekce Absence</p>
          <p class="desc">• Přidání aktualní čas čára na osobním rozvrhu</p>
        </div>
        <hr>
        <a href="https://github.com/Demiffy/KSB" target="_blank" class="custom-footer-button">
          <p>
            <strong>Github: </strong>
            <i class="fa fa-github"></i>KSB
          </p>
        </a>
      </div>
    `;

    // Check if the h2 element exists
    if (h2Element) {
      // Insert the new HTML content along with the style tag after the h2 element
      h2Element.insertAdjacentHTML('afterend', newHtmlContent);
    }
  }
}

// Function to set the title of the site if the URL matches a specific pattern
function setTitleIfURLMatches() {
  // Check if the current URL is the one we want to change the title for
  if (window.location.href === 'https://sis.ssakhk.cz/TimeTable/PersonalNew') {
    // Set the document's title
    document.title = 'KybernaIS - Rozvrh';
  }
}

// Call the function to set the title
setTitleIfURLMatches();



// Initialization
updateTextColorBasedOnBgColor();
setInterval(updateTextColorBasedOnBgColor, 1000);
updateCurrentTimeLine();
setInterval(updateCurrentTimeLine, 10000);
updateColspanWithCzechMonths();
updateProfilePhoto();
insertContentAfterH2();