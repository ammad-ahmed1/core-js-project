function renderInUI(selector, value) {
  let uiElement = document.querySelector(selector);
  if (!uiElement) return;
  uiElement.textContent = value;
}
function addClass(elementName, className) {
  elementName.classList.add(className);
}
function removeClass(elementName, className) {
  elementName.classList.remove(className);
}
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
export { renderInUI, addClass, removeClass, debounce };
