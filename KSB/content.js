
const elements = document.querySelectorAll('*');

elements.forEach(el => {
  const style = window.getComputedStyle(el);
  const color = style.getPropertyValue('color');

  if (color === 'rgb(51, 51, 51)') {
    el.style.color = '#4E31AA'; // Replace with the color you want to use
  }
});
