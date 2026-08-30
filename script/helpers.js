import { getInvoiceById } from "./data-manipulation.js";

const generateId = (prefix, arr) => {
  const nextNum = arr.length + 1;
  return `${prefix}-${String(nextNum).padStart(3, "0")}`;
};

function creator(data, arr) {
  const newInvoiceId = generateId("INV", arr);

  const formData = new FormData(data);
  formData.set("id", newInvoiceId);

  const parsedData = Object.fromEntries(formData.entries());
  if (parsedData.amount) parsedData.amount = Number(parsedData.amount);

  return [...arr, parsedData];
}
function getter(arr) {
  return arr;
}
function getById(id, arr) {
  const res = getInvoiceById(id, arr);
  return res;
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
  getter,
  getById,
  updator,
  deleter,
};
