const generateId = (prefix, arr) => {
  const highestId = arr.reduce((highest, item) => {
    const [itemPrefix, numericPart] = String(item?.id ?? "").split("-");
    const numericId = Number(numericPart);

    if (itemPrefix !== prefix || !Number.isInteger(numericId)) return highest;

    return Math.max(highest, numericId);
  }, 0);
  const nextNum = highestId + 1;

  return `${prefix}-${String(nextNum).padStart(3, "0")}`;
};

function creator(data, arr, prefix) {
  const id = generateId(prefix, arr);
  return [...arr, { ...data, id }];
}
function getById(id, arr) {
  return arr.find((item) => item.id === id) ?? null;
}
function updator(data, id, arr) {
  const updatedArr = arr.map((item) =>
    item.id === id ? { ...item, ...data } : item,
  );
  return updatedArr;
}
function deleter(id, arr) {
  const newRec = arr.filter((item) => item.id !== id);
  return newRec;
}
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
export {
  renderInUI,
  addClass,
  removeClass,
  debounce,
  creator,
  getById,
  updator,
  deleter,
};
