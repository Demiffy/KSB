// Get the dot element
const dot = document.getElementById("dot");

// Function to check if the website is online
function checkOnline() {
  fetch("https://example.com")
    .then(response => {
      if (response.ok) {
        // green
        dot.style.backgroundColor = "green";
      } else {
        // red
        dot.style.backgroundColor = "red";
      }
    })
    .catch(error => {
      // Set the dot color to gray
      dot.style.backgroundColor = "gray";
    });
}

// Call the checkOnline function when the page loads
window.onload = checkOnline;

// Call the checkOnline function every 5 seconds
setInterval(checkOnline, 5000);
