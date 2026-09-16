// Imports
import { invoices } from "../../data/data.js";
import {
  renderInUI,
  debounce,
  formatDate,
  formatCurrency,
  dynamicTable,
  paginateItems,
  sortData,
} from "../helpers.js";

import { InvoiceManager } from "../manager/invoice-manager.js";
const invoiceManager = new InvoiceManager(invoices);
// DOM references
const custBtn = document.querySelector("#sider-customer-btn");
const invBtn = document.querySelector("#sider-invoices-btn");
const ordBtn = document.querySelector("#sider-orders-btn");
const custSection = document.querySelector("#customer");
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
const invoiceTableElement = document.getElementById("table-element");

// Configuration and state
let currentPage = 1;
const itemsPerPage = 25;
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
    const dueStatus = invoiceManager.getInvoiceDueStatus(item);
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

function getVisibleInvoices() {
  const selectedStatusValue = selectedStatus.value;
  const searchTerm = invSearchInput.value.trim().toLowerCase();
  const dateType = invDateFilterType.value;
  const startDate = invStartDateInput.value;
  const endDate = invEndDateInput.value;
  const invoicesWithDaysPassed = invoiceManager.getDaysPassedSinceDueDate();
  let visibleInvoices =
    selectedStatusValue && selectedStatusValue !== "all"
      ? invoiceManager.findByField("status", selectedStatusValue)
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
    visibleInvoices = invoiceManager.getInvoicesByDateRange(
      visibleInvoices,
      dateType,
      startDate,
      endDate,
    );
  }
  if (activeSortBy) {
    visibleInvoices = sortData(
      visibleInvoices,
      activeSortBy,
      currentSort[activeSortBy],
      ["customerName", "amount", "issueDate", "dueDate", "daysPassed"],
    );
  }

  return visibleInvoices;
}

const invFormFieldSetter = (id) => {
  let updatingInv = invoiceManager.getById(id);
  invoiceForm.elements["id"].value = updatingInv.id;
  invoiceForm.elements["customerName"].value = updatingInv.customerName || "";
  invoiceForm.elements["amount"].value = updatingInv.amount || "";
  invoiceForm.elements["status"].value = updatingInv.status || "unpaid";
  invoiceForm.elements["issueDate"].value = updatingInv.issueDate || "";
  invoiceForm.elements["dueDate"].value = updatingInv.dueDate || "";
};

function sectionNavigation(forSection) {
  const sections = {
    invoices: invSection,
    customers: document.getElementById("customers"),
    orders: ordSection,
  };

  if (forSection !== "overview" && !sections[forSection]) {
    console.log("Page not found!");
    return;
  }

  // ovwSection.classList.add("active");
  // ovwSection.classList.remove("inactive");

  Object.entries(sections).forEach(([name, section]) => {
    const isSelected = name === forSection;

    section.classList.toggle("active", isSelected);
    section.classList.toggle("inactive", !isSelected);
  });
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

function updateInvoiceDashboard() {
  const useableInvoices = invoiceManager.getUseableInvoices();
  const paidInvoices = invoiceManager.findByField("status", "paid");
  const unPaidInvoices = invoiceManager.findByField("status", "unpaid");
  const failedInvoices = invoiceManager.findByField("status", "failed");
  const paidRevenueAmount = invoiceManager.paidRevenue("PKR");
  const dueDatePassedInvs = invoiceManager.getDueDatePassedInv();

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
    invoiceTableElement,
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
  //   updateInvoiceDashboard(invoiceState); //declare before use
  updateInvoiceDashboard();
}

const refreshInvoicesFromFirstPage = () => {
  currentPage = 1;
  updateTableAndPagination();
};

const handleFormSubmit = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const existingId = formData.get("id");
  const parsedData = Object.fromEntries(formData.entries());

  if (parsedData.amount) parsedData.amount = Number(parsedData.amount);

  if (existingId) {
    // Call update method on instance
    invoiceManager.updator(parsedData, existingId, "INV", notificationToaster);
  } else {
    // Call create method on instance
    invoiceManager.creator(parsedData, "INV", notificationToaster);
  }

  updateTableAndPagination();
  e.target.reset();
  invoiceForm.elements["id"].value = "";
  toggleModal(false);
};

const handleDeleteInv = (id) => {
  invoiceManager.deleter(id, "INV", notificationToaster);
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
custBtn.addEventListener("click", () =>
  sectionNavigation(custBtn.dataset.section),
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
  handleFormSubmit(e);
});

invoiceTableElement.addEventListener("click", (e) => {
  const target = e.target;
  const th = target.closest("th[data-sort]");
  if (th) {
    const sortKey = th.dataset.sort;
    handleSort(sortKey);
    return;
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
