const timeFormatter = new Intl.DateTimeFormat("en-PK", {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
});

const toastMsg = {
  uploadSuccess: (recType) => `${recType} added successfully`,
  updateSuccess: (recType) => `${recType} updated successfully`,
  deleteSuccess: (recType) => `${recType} deleted successfully`,
  uploadFail: (recType) => `Failed to add ${recType}`,
  updateFail: (recType) => `Failed to update ${recType}`,
  deleteFail: (recType) => `Failed to delete ${recType}`,
};
let notificationTimer;

const showNotification = (message, type, notificationElement) => {
  if (!notificationElement) return;
  clearTimeout(notificationTimer);
  removeClass(notificationElement, "notification--success");
  removeClass(notificationElement, "notification--error");
  notificationElement.textContent = message;
  addClass(notificationElement, `notification--${type}`);
  notificationTimer = setTimeout(() => {
    removeClass(notificationElement, `notification--${type}`);
    notificationElement.textContent = "";
  }, 3000);
};
// ----crud----
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
function creator(data, arr, prefix, notificationEElement) {
  try {
    const id = generateId(prefix, arr);
    const updatedRecords = [...arr, { ...data, id }];

    showNotification(
      toastMsg.uploadSuccess(prefix),
      "success",
      notificationEElement,
    );

    return updatedRecords;
  } catch (error) {
    showNotification(
      toastMsg.uploadFail(prefix),
      "error",
      notificationEElement,
    );

    throw new Error("Failed to create record!");
  }
}
function getById(id, arr) {
  return arr.find((item) => item.id === id) ?? null;
}
function updator(data, id, arr, prefix, notificationEElement) {
  try {
    const updatedArr = arr.map((item) =>
      item.id === id ? { ...item, ...data } : item,
    );
    showNotification(
      toastMsg.updateSuccess(prefix),
      "success",
      notificationEElement,
    );
    return updatedArr;
  } catch (error) {
    showNotification(
      toastMsg.updateFail(prefix),
      "error",
      notificationEElement,
    );
    throw new Error("Failed to update record!");
  }
}
function deleter(id, arr, prefix, notificationEElement) {
  try {
    const newRec = arr.filter((item) => item.id !== id);
    showNotification(
      toastMsg.deleteSuccess(prefix),
      "success",
      notificationEElement,
    );
    return newRec;
  } catch (error) {
    showNotification(
      toastMsg.deleteFail(prefix),
      "error",
      notificationEElement,
    );
    throw new Error("Failed to delete record!");
  }
}
// ----ui-related----
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
// ----dates----
function toValidDate(dateValue) {
  if (dateValue === null || dateValue === undefined || dateValue === "") {
    return null;
  }
  const date = new Date(dateValue).getTime();
  if (Number.isNaN(date)) {
    return null;
  }
  return date;
}
function formatDate(dateValue) {
  const date = toValidDate(dateValue);
  const formatter = new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeZone: "UTC",
  });
  if (date === null) return "—";
  return formatter.format(date);
}
function formatCurrency(amount, currency) {
  const formatterPkr = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  if (amount === null) return "—";
  return formatterPkr.format(amount);
}
function formatColKey(key) {
  return key.replace(/([A-Z])/g, " $1").toUpperCase();
}
// ----------
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
  toValidDate,
  formatDate,
  formatCurrency,
  formatColKey,
};
