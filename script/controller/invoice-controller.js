// Imports
// import { invoices } from "../../data/data.js";
import {
  renderInUI,
  debounce,
  formatDate,
  formatCurrency,
  dynamicTable,
  paginateItems,
  sortData,
  showNotification,
} from "../helpers.js";

import { InvoiceManager } from "../manager/invoice-manager.js";
import { toggleModal } from "../ui/modal-view.js";
import { renderPagination } from "../ui/pagination-view.js";

const invSearchInput = document.querySelector("#search");
const selectedStatus = document.querySelector("#status");
const invDateFilterType = document.getElementById("date-field-filter");
const invStartDateInput = document.querySelector("#start-date-filter");
const invEndDateInput = document.querySelector("#end-date-filter");
const clearDatesBtn = document.querySelector("#clear-date-filters");
//invoice crud modal
const invoiceModal = document.getElementById("invoice-modal");
const addInvoiceBtn = document.getElementById("add-invoice-btn");
const closeModalBtn = document.querySelector("#close-modal-btn");
const cancelModalBtn = document.querySelector("#cancel-modal-btn");
let invoiceForm = document.querySelector("#invoice-form");
let submitInvBtn = document.querySelector("#save-invoice-btn");

//event delegation for invoice update and delete
// const tableBody = document.getElementById("invoice-table-body");
const invoiceTableElement = document.getElementById("table-element");
const invoicePageStart = document.querySelector("#invoice-page-start");
const invoicePageEnd = document.querySelector("#invoice-page-end");
const invoiceTotalCount = document.querySelector("#invoice-total-count");
const invoicePageNumbers = document.querySelector("#invoice-page-numbers");
const invoicePrevPageBtn = document.querySelector("#invoice-prev-page-btn");
const invoiceNextPageBtn = document.querySelector("#invoice-next-page-btn");
const notificationToaster = document.querySelector("#notification");

// let invoices;
let invoiceManager;

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

const invFormFieldSetter = async (id) => {
  let updatingInv = await invoiceManager.getById("invoices", id);
  invoiceForm.elements["id"].value = updatingInv[0].id;
  invoiceForm.elements["customerName"].value =
    updatingInv[0].customerName || "";
  invoiceForm.elements["amount"].value = updatingInv[0].amount || "";
  invoiceForm.elements["status"].value = updatingInv[0].status || "unpaid";
  invoiceForm.elements["issueDate"].value = updatingInv[0].issueDate || "";
  invoiceForm.elements["dueDate"].value = updatingInv[0].dueDate || "";
};

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
  renderPagination(
    visibleInvoices.length,
    currentPage,
    itemsPerPage,
    invoicePageStart,
    invoicePageEnd,
    invoiceTotalCount,
    invoicePageNumbers,
    invoicePrevPageBtn,
    invoiceNextPageBtn,
  );
  updateInvoiceDashboard();
}

const refreshInvoicesFromFirstPage = () => {
  currentPage = 1;
  updateTableAndPagination();
};

const handleFormSubmit = async (e) => {
  e.preventDefault();
  let currentSubmitFormBtnTxt = submitInvBtn.textContent;
  submitInvBtn.textContent = "Saving...";
  submitInvBtn.disabled = true;
  try {
    const formData = new FormData(e.target);
    const existingId = formData.get("id");
    const parsedData = Object.fromEntries(formData.entries());

    if (parsedData.amount) parsedData.amount = Number(parsedData.amount);
    let successMessage;
    if (existingId) {
      await invoiceManager.updator("invoices", parsedData, existingId);
      successMessage = "Invoice updated successfuly";
    } else {
      await invoiceManager.creator("invoices", parsedData);
      successMessage = "Invoice added successfuly";
    }
    showNotification(successMessage, "success", notificationToaster);
    updateTableAndPagination();
    e.target.reset();
    invoiceForm.elements["id"].value = "";
    toggleModal(invoiceModal, false);
  } catch (error) {
    showNotification(error.message, "error", notificationToaster);
  } finally {
    submitInvBtn.textContent = currentSubmitFormBtnTxt;
    submitInvBtn.disabled = false;
  }
};

const handleDeleteInv = async (id) => {
  try {
    await invoiceManager.deleter("invoices", id);

    showNotification(
      "Invoice deleted successfully",
      "success",
      notificationToaster,
    );

    updateTableAndPagination();
  } catch (error) {
    showNotification(error.message, "error", notificationToaster);
  }
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
  toggleModal(invoiceModal, true);
});
closeModalBtn.addEventListener("click", () => {
  invoiceForm.reset();
  toggleModal(invoiceModal, false);
});
cancelModalBtn.addEventListener("click", () => {
  invoiceForm.reset();
  toggleModal(invoiceModal, false);
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
      toggleModal(invoiceModal, true);
      invFormFieldSetter(id);
    } else if (action === "delete") {
      handleDeleteInv(id);
    }
    return;
  }
});
invoicePageNumbers.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");

  if (!pageButton) return;

  currentPage = Number(pageButton.dataset.page);
  updateTableAndPagination();
});

invoicePrevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    updateTableAndPagination();
  }
});

invoiceNextPageBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(getVisibleInvoices().length / itemsPerPage);

  if (currentPage < totalPages) {
    currentPage++;
    updateTableAndPagination();
  }
});

export function invoiceInitializer(data) {
  invoiceManager = new InvoiceManager(data);
  updateTableAndPagination();
}
