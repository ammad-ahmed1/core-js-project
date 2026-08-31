import { invoices } from "../../data/data.js";
import {
  renderInUI,
  addClass,
  removeClass,
  debounce,
  creator,
  updator,
  getById,
  deleter,
} from "../helpers.js";
import {
  paginateItems,
  getUseableInvoices,
  getInvoicesByStatus,
  paidRevenue,
  sortInvoices,
} from "../data-manipulation.js";

// -----------------------------
let invoiceState = [...invoices];
let currentPage = 1;
const itemsPerPage = 5;
const ovwBtn = document.querySelector("#sider-overview-btn");
const invBtn = document.querySelector("#sider-invoices-btn");
const ordBtn = document.querySelector("#sider-orders-btn");
const ovwSection = document.querySelector("#overview");
const invSection = document.querySelector("#invoices");
const ordSection = document.querySelector("#orders");
const invSearchInput = document.querySelector("#search");
const selectedStatus = document.querySelector("#status");
const tbCustHead = document.querySelector("#customer-head");
const tbAmountHead = document.querySelector("#amount-head");
//invocie crud modal
const modal = document.getElementById("invoice-modal");
const addInvoiceBtn = document.getElementById("add-invoice-btn");
let invoiceForm = document.querySelector("#invoice-form");
const closeModalBtn = document.querySelector("#close-modal-btn");
//event delegation for invoice update and delete
const tableBody = document.getElementById("invoice-table-body");

const currentSort = {
  customerName: "asc",
  amount: "asc",
};
let activeSortBy = null;

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
const handleFormSubmit = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const existingId = formData.get("id");
  const parsedData = Object.fromEntries(formData.entries());

  if (parsedData.amount) parsedData.amount = Number(parsedData.amount);

  if (existingId) {
    invoiceState = updator(parsedData, existingId, invoiceState);
  } else {
    invoiceState = creator(parsedData, invoiceState, "INV");
  }
  updateTableAndPagination();
  e.target.reset();
  invoiceForm.elements["id"].value = ""; // Clear hidden ID
  toggleModal(false);
};
const handleDeleteInv = (id) => {
  console.log("delete: ", id);
  invoiceState = deleter(id, invoiceState);
  updateTableAndPagination();
};
const handleFilter = () => {
  currentPage = 1;
  updateTableAndPagination();
};

const handleSearch = debounce(() => {
  currentPage = 1;
  updateTableAndPagination();
}, 300);

const handleSort = (by) => {
  currentSort[by] = currentSort[by] === "asc" ? "desc" : "asc";
  activeSortBy = by;
  currentPage = 1;
  updateTableAndPagination();
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

function getVisibleInvoices() {
  const selectedStatusValue = selectedStatus.value;
  const searchTerm = invSearchInput.value.trim().toLowerCase();

  let visibleInvoices =
    selectedStatusValue && selectedStatusValue !== "all"
      ? getInvoicesByStatus(invoiceState, selectedStatusValue)
      : [...invoiceState];

  if (searchTerm) {
    visibleInvoices = visibleInvoices.filter((invoice) => {
      const invoiceId = String(invoice.id ?? "").toLowerCase();
      const customerName = String(invoice.customerName ?? "").toLowerCase();

      return invoiceId.includes(searchTerm) || customerName.includes(searchTerm);
    });
  }

  if (activeSortBy) {
    visibleInvoices = sortInvoices(
      visibleInvoices,
      activeSortBy,
      currentSort[activeSortBy],
    );
  }

  return visibleInvoices;
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

  insertInvoicesDataInTable(paginatedData);
  renderPagination(visibleInvoices.length);
  updateInvoiceDashboard(invoiceState);
}
function insertInvoicesDataInTable(currentInvoices) {
  tableBody.innerHTML = "";
  currentInvoices.forEach((invoice) => {
    const row = document.createElement("tr");
    const invIdCell = document.createElement("td");
    invIdCell.textContent = invoice.id;
    const custCell = document.createElement("td");
    custCell.textContent = invoice.customerName;
    const statusCell = document.createElement("td");
    statusCell.textContent = invoice.status;
    const amountCell = document.createElement("td");
    amountCell.textContent = invoice.amount;
    const actionCell = document.createElement("td");
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn-action btn-edit";
    editBtn.dataset.id = invoice.id;
    editBtn.dataset.action = "edit";
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "btn-action btn-delete";
    deleteBtn.dataset.id = invoice.id;
    deleteBtn.dataset.action = "delete";

    actionCell.appendChild(editBtn);
    actionCell.appendChild(deleteBtn);

    row.appendChild(invIdCell);
    row.appendChild(custCell);
    row.appendChild(statusCell);
    row.appendChild(amountCell);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
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
  document.getElementById("next-page-btn").disabled =
    currentPage >= totalPages;
}

ovwBtn.addEventListener("click", () =>
  sectionNavigation(ovwBtn.dataset.section),
);
invBtn.addEventListener("click", () =>
  sectionNavigation(invBtn.dataset.section),
);
ordBtn.addEventListener("click", () =>
  sectionNavigation(ordBtn.dataset.section),
);
tbCustHead.addEventListener("click", () => handleSort("customerName"));
tbAmountHead.addEventListener("click", () => handleSort("amount"));
selectedStatus.addEventListener("change", handleFilter);
invSearchInput.addEventListener("input", handleSearch);
addInvoiceBtn.addEventListener("click", () => {
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
  // handleAddInvoice(e);
  handleFormSubmit(e);
});

tableBody.addEventListener("click", (e) => {
  // Find if a button with data-action was clicked
  const button = e.target.closest("[data-action]");
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "edit") {
    toggleModal(true);
    invFormFieldSetter(id);
  } else if (action === "delete") {
    handleDeleteInv(id);
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
function updateInvoiceDashboard(invoices) {
  const useableInvoices = getUseableInvoices(invoices);
  const paidInvoices = getInvoicesByStatus(useableInvoices, "paid");
  const unPaidInvoices = getInvoicesByStatus(useableInvoices, "unpaid");
  const failedInvoices = getInvoicesByStatus(useableInvoices, "failed");
  const paidRevenueAmount = paidRevenue(useableInvoices);

  renderInUI("#usable-invoice-count", useableInvoices.length);
  renderInUI("#paid-invoice-count", paidInvoices.length);
  renderInUI("#unpaid-invoice-count", unPaidInvoices.length);
  renderInUI("#failed-invoice-count", failedInvoices.length);
  renderInUI("#paid-revenue", paidRevenueAmount);
}

// Usage:
updateTableAndPagination();

// -----------------------------
// const title = document.getElementById("page-title");
// const byClass = document.getElementsByClassName("main-heading");
// const byQuery = document.querySelector(".main-heading");
// const byQueryAll = document.querySelectorAll(".btn");
// const headingText = document.querySelector(".main-heading h1");
// console.log(byClass);
// console.log(byQuery);
// console.log(byQueryAll);
// console.log(headingText.textContent);
// headingText.textContent = "Operations Management Dashboard";
// console.log(headingText.textContent);
