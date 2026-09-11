// Imports
import { invoices, activities } from "../../data/data.js";
import {
  renderInUI,
  addClass,
  removeClass,
  debounce,
  creator,
  updator,
  getById,
  deleter,
  formatDate,
  formatCurrency,
  formatColKey,
} from "../helpers.js";
import {
  paginateItems,
  getUseableInvoices,
  getInvoicesByStatus,
  paidRevenue,
  sortInvoices,
  getInvoiceDueStatus,
  getDueDatePassedInv,
  getDaysPassedSinceDueDate,
  getInvoicesByDateRange,
  recentActivities,
} from "../data-manipulation.js";

// DOM references
const ovwBtn = document.querySelector("#sider-overview-btn");
const invBtn = document.querySelector("#sider-invoices-btn");
const ordBtn = document.querySelector("#sider-orders-btn");
const ovwSection = document.querySelector("#overview");
const invSection = document.querySelector("#invoices");
const ordSection = document.querySelector("#orders");
const invSearchInput = document.querySelector("#search");
const selectedStatus = document.querySelector("#status");
const invDateFilterType = document.getElementById("date-field-filter");
const invStartDateInput = document.querySelector("#start-date-filter");
const invEndDateInput = document.querySelector("#end-date-filter");
const clearDatesBtn = document.querySelector("#clear-date-filters");
const notificationToaster = document.querySelector("#notification");
//invoice crud modal
const modal = document.getElementById("invoice-modal");
const addInvoiceBtn = document.getElementById("add-invoice-btn");
let invoiceForm = document.querySelector("#invoice-form");
const closeModalBtn = document.querySelector("#close-modal-btn");
//event delegation for invoice update and delete
// const tableBody = document.getElementById("invoice-table-body");
const tableElement = document.getElementById("table-element");

// Configuration and state
let invoiceState = [...invoices];
let currentPage = 1;
const itemsPerPage = 25;
let recentActivitiesArr = recentActivities(invoiceState);
const currentSort = {
  customerName: "asc",
  amount: "asc",
};
let activeSortBy = null;

// Display helpers and custom renderers
const invoicesDueStatus = {
  amount: (item) => formatCurrency(item.amount, item.currency),
  issueDate: (item) => formatDate(item.issueDate),
  dueDate: (item) => formatDate(item.dueDate),
  // Key name matches column name
  dueStatus: (item) => {
    const dueStatus = getInvoiceDueStatus(item);
    const dueStatusText = {
      overdue: `Overdue ${dueStatus?.days} ${dueStatus?.days === 1 ? "day" : "days"}`,
      upcoming: `Due in ${dueStatus?.days} ${dueStatus?.days === 1 ? "day" : "days"}`,
      today: "Due today",
      paid: "Paid",
      cancelled: "Cancelled",
      invalid: "â€”",
    };

    const badge = document.createElement("span");
    badge.textContent = dueStatusText[dueStatus?.state] ?? "â€”";
    badge.className = `due-status due-status--${dueStatus?.state ?? "invalid"}`;
    return badge;
  },
};

function createDueStatusBadge(item) {
  const dueStatus = getInvoiceDueStatus(item);

  const dueStatusText = {
    overdue: `Overdue ${dueStatus?.days} ${dueStatus?.days === 1 ? "day" : "days"}`,
    upcoming: `Due in ${dueStatus?.days} ${dueStatus?.days === 1 ? "day" : "days"}`,
    today: "Due today",
    paid: "Paid",
    cancelled: "Cancelled",
    invalid: "â€”",
  };

  const dueStatusBadge = document.createElement("span");
  dueStatusBadge.textContent = dueStatusText[dueStatus?.state] ?? "â€”";
  dueStatusBadge.className = `due-status due-status--${dueStatus?.state ?? "invalid"}`;

  return dueStatusBadge;
}

// Data-selection functions
function getVisibleInvoices() {
  const selectedStatusValue = selectedStatus.value;
  const searchTerm = invSearchInput.value.trim().toLowerCase();
  const dateType = invDateFilterType.value;
  const startDate = invStartDateInput.value;
  const endDate = invEndDateInput.value;

  const invoicesWithDaysPassed = getDaysPassedSinceDueDate(invoiceState);

  let visibleInvoices =
    selectedStatusValue && selectedStatusValue !== "all"
      ? getInvoicesByStatus(invoiceState, selectedStatusValue)
      : [...invoicesWithDaysPassed];

  if (searchTerm) {
    visibleInvoices = visibleInvoices.filter((invoice) => {
      const invoiceId = String(invoice.id ?? "").toLowerCase();
      const customerName = String(invoice.customerName ?? "").toLowerCase();

      return (
        invoiceId.includes(searchTerm) || customerName.includes(searchTerm)
      );
    });
  }

  if (startDate && endDate) {
    visibleInvoices = getInvoicesByDateRange(
      visibleInvoices,
      dateType,
      startDate,
      endDate,
    );
  }

  if (activeSortBy) {
    visibleInvoices = sortInvoices(
      visibleInvoices,
      activeSortBy,
      currentSort[activeSortBy],
      ["customerName", "amount", "issueDate", "dueDate", "daysPassed"],
    );
  }

  return visibleInvoices;
}

// UI functions
const toggleModal = (show = null) => {
  if (show === true) {
    modal.classList.remove("inactive");
  } else if (show === false) {
    modal.classList.add("inactive");
  } else {
    modal.classList.toggle("inactive");
  }
};

const invFormFieldSetter = (id) => {
  console.log("update: ", id);
  let updatingInv = getById(id, invoiceState);
  console.log(updatingInv);
  invoiceForm.elements["id"].value = updatingInv.id;
  invoiceForm.elements["customerName"].value = updatingInv.customerName || "";
  invoiceForm.elements["amount"].value = updatingInv.amount || "";
  invoiceForm.elements["status"].value = updatingInv.status || "unpaid";
  invoiceForm.elements["issueDate"].value = updatingInv.issueDate || "";
  invoiceForm.elements["dueDate"].value = updatingInv.dueDate || "";
};

function sectionNavigation(forSection) {
  if (forSection === "overview") {
    console.log(ovwBtn.id);
    addClass(ovwSection, "active");
    removeClass(ovwSection, "inactive");
    addClass(invSection, "inactive");
    addClass(ordSection, "inactive");
    removeClass(invSection, "active");
    removeClass(ordSection, "active");
  } else if (forSection === "invoices") {
    console.log(invBtn.id);
    addClass(invSection, "active");
    removeClass(invSection, "inactive");
    addClass(ovwSection, "inactive");
    addClass(ordSection, "inactive");
    removeClass(ovwSection, "active");
    removeClass(ordSection, "active");
  } else if (forSection === "orders") {
    console.log(ordBtn.id);
    addClass(ordSection, "active");
    removeClass(ordSection, "inactive");
    addClass(ovwSection, "inactive");
    addClass(invSection, "inactive");
    removeClass(ovwSection, "active");
    removeClass(invSection, "active");
  } else {
    console.log("page not found!");
  }
}

function dynamicTable(
  data = [],
  cols = [],
  sortableKeys = [],
  customRenderers = {},
) {
  tableElement.innerHTML = "";
  // let data = currentInvoices;
  const keys = [
    ...new Set(
      data
        .flatMap((obj) => Object.keys(obj))
        .filter((key) => cols.includes(key)),
    ),
  ];

  Object.keys(customRenderers).forEach((customKey) => {
    if (!keys.includes(customKey)) {
      keys.push(customKey);
    }
  });

  //table columns
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

  // table rows
  const tableBody = document.createElement("tbody");
  data.forEach((item) => {
    const row = document.createElement("tr");
    keys.forEach((key) => {
      const cell = document.createElement("td");
      if (typeof customRenderers[key] === "function") {
        const result = customRenderers[key](item);
        if (result instanceof HTMLElement) {
          cell.appendChild(result);
        } else {
          cell.innerHTML = result ?? "â€”";
        }
      } else {
        cell.textContent = item[key] ?? "â€”";
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

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const pageNumbersContainer = document.getElementById("page-numbers");
  const pageStart = document.getElementById("page-start");
  const pageEnd = document.getElementById("page-end");
  const totalCount = document.getElementById("total-count");

  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  if (pageStart) pageStart.textContent = start;
  if (pageEnd) pageEnd.textContent = end;
  if (totalCount) totalCount.textContent = totalItems;

  pageNumbersContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.dataset.page = i;
    btn.className = i === currentPage ? "btn-page-num active" : "btn-page-num";
    pageNumbersContainer.appendChild(btn);
  }

  document.getElementById("prev-page-btn").disabled = currentPage === 1;
  document.getElementById("next-page-btn").disabled = currentPage >= totalPages;
}

// Refresh functions
function updateInvoiceDashboard(invoices) {
  const useableInvoices = getUseableInvoices(invoices);
  const paidInvoices = getInvoicesByStatus(useableInvoices, "paid");
  const unPaidInvoices = getInvoicesByStatus(useableInvoices, "unpaid");
  const failedInvoices = getInvoicesByStatus(useableInvoices, "failed");
  const paidRevenueAmount = paidRevenue(useableInvoices);
  const dueDatePassedInvs = getDueDatePassedInv(invoiceState);

  renderInUI("#usable-invoice-count", useableInvoices.length);
  renderInUI("#paid-invoice-count", paidInvoices.length);
  renderInUI("#unpaid-invoice-count", unPaidInvoices.length);
  renderInUI("#failed-invoice-count", failedInvoices.length);
  renderInUI("#paid-revenue", paidRevenueAmount);
  renderInUI("#overdue-invoice-count", dueDatePassedInvs.length);
}

function updateTableAndPagination() {
  const visibleInvoices = getVisibleInvoices();
  const totalPages = Math.max(
    1,
    Math.ceil(visibleInvoices.length / itemsPerPage),
  );

  currentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedData = visibleInvoices.length
    ? paginateItems(visibleInvoices, itemsPerPage, currentPage)
    : [];

  dynamicTable(
    paginatedData,
    [
      "id",
      "customerId",
      "customerName",
      "status",
      "amount",
      "currency",
      "issueDate",
      "dueDate",
      "daysPassed",
    ],
    ["customerName", "amount", "issueDate", "dueDate", "daysPassed"],
    invoicesDueStatus,
  );
  renderPagination(visibleInvoices.length);
  updateInvoiceDashboard(invoiceState);
}

const refreshInvoicesFromFirstPage = () => {
  currentPage = 1;
  updateTableAndPagination();
};

// Event handlers
const handleFormSubmit = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const existingId = formData.get("id");
  const parsedData = Object.fromEntries(formData.entries());

  if (parsedData.amount) parsedData.amount = Number(parsedData.amount);

  if (existingId) {
    invoiceState = updator(
      parsedData,
      existingId,
      invoiceState,
      "INV",
      notificationToaster,
    );
  } else {
    invoiceState = creator(
      parsedData,
      invoiceState,
      "INV",
      notificationToaster,
    );
  }
  updateTableAndPagination();
  e.target.reset();
  invoiceForm.elements["id"].value = ""; // Clear hidden ID
  toggleModal(false);
};

const handleDeleteInv = (id) => {
  console.log("delete: ", id);
  invoiceState = deleter(id, invoiceState, "INV", notificationToaster);
  updateTableAndPagination();
};

const handleSearch = debounce(refreshInvoicesFromFirstPage, 300);

const handleSort = (by) => {
  currentSort[by] = currentSort[by] === "asc" ? "desc" : "asc";
  activeSortBy = by;
  refreshInvoicesFromFirstPage();
};

const handleClearDateFilters = () => {
  invDateFilterType.value = "dueDate";
  invStartDateInput.value = "";
  invEndDateInput.value = "";

  refreshInvoicesFromFirstPage();
};

// Event listener registrations
ovwBtn.addEventListener("click", () =>
  sectionNavigation(ovwBtn.dataset.section),
);
invBtn.addEventListener("click", () =>
  sectionNavigation(invBtn.dataset.section),
);
ordBtn.addEventListener("click", () =>
  sectionNavigation(ordBtn.dataset.section),
);
invSearchInput.addEventListener("input", handleSearch);
selectedStatus.addEventListener("change", refreshInvoicesFromFirstPage);
invDateFilterType.addEventListener("change", refreshInvoicesFromFirstPage);
invStartDateInput.addEventListener("change", refreshInvoicesFromFirstPage);
invEndDateInput.addEventListener("change", refreshInvoicesFromFirstPage);
clearDatesBtn.addEventListener("click", handleClearDateFilters);
addInvoiceBtn.addEventListener("click", () => {
  ``;
  invoiceForm.reset();
  document.getElementById("modal-title").textContent = "Add Invoice";
  toggleModal(true);
});
closeModalBtn.addEventListener("click", () => {
  invoiceForm.reset();
  toggleModal(false);
});
invoiceForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleFormSubmit(e);
});

tableElement.addEventListener("click", (e) => {
  const target = e.target;
  const th = target.closest("th[data-sort]");
  if (th) {
    const sortKey = th.dataset.sort;
    handleSort(sortKey);
    return; // Exit here so it doesn't try to look for buttons
  }
  const button = target.closest("[data-action]");
  if (button) {
    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") {
      toggleModal(true);
      invFormFieldSetter(id);
    } else if (action === "delete") {
      handleDeleteInv(id);
    }
    return;
  }
});
document.getElementById("page-numbers").addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-page-num")) {
    currentPage = Number(e.target.dataset.page);
    updateTableAndPagination();
  }
});

document.getElementById("prev-page-btn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    updateTableAndPagination();
  }
});

document.getElementById("next-page-btn").addEventListener("click", () => {
  const totalPages = Math.ceil(getVisibleInvoices().length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    updateTableAndPagination();
  }
});

// Initial execution
// Usage:
updateTableAndPagination();
