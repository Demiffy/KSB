function updateHelloWorldColor() {
    var helloWorld = document.querySelector('.hello-world');
    var link = document.querySelector('link[href="styles.css"]');
    if (localStorage.getItem('buttonState') === 'pressed') {
      helloWorld.style.color = 'red';
      if (link) {
        link.disabled = false;
      } else {
        link = document.createElement('link');
        link.href = 'styles.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    } else {
      helloWorld.style = '';
      if (link) {
        link.remove();
      }
    }
  }
  function toggleButtonState() {
    if (localStorage.getItem('buttonState') === 'pressed') {
      localStorage.removeItem('buttonState');
    } else {
      localStorage.setItem('buttonState', 'pressed');
    }
    updateHelloWorldColor();
  }
  