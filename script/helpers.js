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

function paginateItems(items, pageSize, pageNumber) {
  if (!Array.isArray(items)) return [];
  if (!Number.isInteger(pageSize) || pageSize <= 0) {
    throw new Error("page size must be a positive integer");
  }
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    throw new Error("page number must be a positive integer");
  }
  if (items.length === 0) return [];

  const totalPages = Math.ceil(items.length / pageSize);
  if (pageNumber > totalPages) {
    throw new Error(`max page no can be: ${totalPages}`);
  }
  const stPtr = (pageNumber - 1) * pageSize;
  const endPtr = stPtr + pageSize;
  return items.slice(stPtr, endPtr);
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
function dynamicTable(
  tableElement,
  data = [],
  cols = [],
  sortableKeys = [],
  customRenderers = {},
) {
  console.log(tableElement);
  if (!tableElement) return;

  tableElement.innerHTML = "";

  const keys =
    cols.length > 0
      ? [...cols]
      : [...new Set(data.flatMap((obj) => Object.keys(obj)))];

  Object.keys(customRenderers).forEach((customKey) => {
    if (!keys.includes(customKey)) {
      keys.push(customKey);
    }
  });

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  keys.forEach((key) => {
    const th = document.createElement("th");

    if (sortableKeys.includes(key)) {
      th.className = "sortable";
      th.dataset.sort = key;
      th.innerHTML = `${formatColKey(key)} <i class="fa-solid fa-sort sort-icon"></i>`;
    } else {
      th.textContent = formatColKey(key);
    }

    headerRow.appendChild(th);
  });

  const actionTh = document.createElement("th");
  actionTh.textContent = "Actions";
  headerRow.appendChild(actionTh);

  thead.appendChild(headerRow);
  tableElement.appendChild(thead);

  const tableBody = document.createElement("tbody");

  if (data.length === 0) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");

    emptyCell.colSpan = keys.length + 1;
    emptyCell.textContent = "No records found.";
    emptyCell.className = "empty-table-message";

    emptyRow.appendChild(emptyCell);
    tableBody.appendChild(emptyRow);
    tableElement.appendChild(tableBody);

    return;
  }

  data.forEach((item) => {
    const row = document.createElement("tr");

    keys.forEach((key) => {
      const cell = document.createElement("td");

      if (typeof customRenderers[key] === "function") {
        const result = customRenderers[key](item);

        if (result instanceof HTMLElement) {
          cell.appendChild(result);
        } else {
          cell.innerHTML = result ?? "-";
        }
      } else {
        cell.textContent = item[key] ?? "-";
      }

      row.appendChild(cell);
    });

    const actionCell = document.createElement("td");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn-action btn-edit";
    editBtn.dataset.id = item.id;
    editBtn.dataset.action = "edit";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "btn-action btn-delete";
    deleteBtn.dataset.id = item.id;
    deleteBtn.dataset.action = "delete";

    actionCell.appendChild(editBtn);
    actionCell.appendChild(deleteBtn);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
  });

  tableElement.appendChild(tableBody);
}

const sortData = (data = [], by, order = "asc", validProperties = []) => {
  if (!Array.isArray(data)) return [];
  if (!by) return [...data];

  if (!validProperties.includes(by)) {
    return [...data];
  }

  const direction = order === "desc" ? -1 : 1;

  return [...data].sort((a, b) => {
    const aValue = a?.[by];
    const bValue = b?.[by];

    if (Number.isFinite(aValue) && Number.isFinite(bValue)) {
      return (aValue - bValue) * direction;
    }

    const aDate = Date.parse(aValue);
    const bDate = Date.parse(bValue);

    if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
      return (aDate - bDate) * direction;
    }

    return String(aValue ?? "").localeCompare(String(bValue ?? "")) * direction;
  });
};

export {
  renderInUI,
  addClass,
  removeClass,
  dynamicTable,
  debounce,
  sortData,
  paginateItems,
  toValidDate,
  formatDate,
  formatCurrency,
  formatColKey,
  showNotification,
};
