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
  getUseableInvoices,
  getInvoiceById,
  getInvoiceByCustName,
  getInvoicesByStatus,
  paidRevenue,
  sortInvoices,
} from "../data-manipulation.js";

// -----------------------------
const ovwBtn = document.querySelector("#sider-overview-btn");
let currentInvoices = invoices;
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
// 1. Process invoice metrics
const useableInvoices = getUseableInvoices(invoices);
const paidInvoices = getInvoicesByStatus(useableInvoices, "paid");
const unPaidInvoices = getInvoicesByStatus(useableInvoices, "unpaid");
const failedInvoices = getInvoicesByStatus(useableInvoices, "failed");
const paidRevenueAmount = paidRevenue(useableInvoices);

const currentSort = {
  customerName: "asc",
  amount: "asc",
};

const toggleModal = (show = null) => {
  if (show === true) {
    modal.classList.remove("inactive");
  } else if (show === false) {
    modal.classList.add("inactive");
  } else {
    modal.classList.toggle("inactive");
  }
};
const handleAddInvoice = (e) => {
  let newInvoices = creator(e.target, invoices);
  insertInvoicesDataInTable(newInvoices);
  e.target.reset();
  toggleModal(false);
};
const handleUpdateInv = (id) => {
  console.log("update: ", id);
  let updatingInv = getById(id, invoices);
  console.log(updatingInv);
  invoiceForm.elements["id"].value = updatingInv.id;
  invoiceForm.elements["customerName"].value = updatingInv.customerName || "";
  invoiceForm.elements["amount"].value = updatingInv.amount || "";
  invoiceForm.elements["status"].value = updatingInv.status || "unpaid";
  invoiceForm.elements["issueDate"].value = updatingInv.issueDate || "";
  invoiceForm.elements["dueDate"].value = updatingInv.dueDate || "";
  // let newInvoices = updator()
};
const handleFormSubmit = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const existingId = formData.get("id");
  let newInvoices = null;
  if (existingId) {
    const parsedData = Object.fromEntries(formData.entries());
    if (parsedData.amount) parsedData.amount = Number(parsedData.amount);
    newInvoices = updator(parsedData, existingId, invoices);
  } else {
    newInvoices = creator(e.target, invoices);
  }
  insertInvoicesDataInTable(newInvoices);
  e.target.reset();
  invoiceForm.elements["id"].value = ""; // Clear hidden ID
  toggleModal(false);
};
const handleDeleteInv = (id) => {
  console.log("delete: ", id);
  let newInvoices = deleter(id, invoices);
  insertInvoicesDataInTable(newInvoices);
};
const handleFilter = (e) => {
  console.log(e.target.value);
  const filtered = e.target.value;
  let res =
    filtered === "all" ? invoices : getInvoicesByStatus(invoices, filtered);
  console.log(res);
  currentInvoices = res;
  insertInvoicesDataInTable(res);
};

const handleSearch = debounce((event) => {
  const searchedValue = event.target.value;
  console.log(searchedValue);
  if (searchedValue === "" || searchedValue === null) {
    insertInvoicesDataInTable(invoices);
  } else {
    let res = null;
    res =
      getInvoiceById(searchedValue, invoices) ||
      getInvoiceByCustName(searchedValue, invoices);
    insertInvoicesDataInTable([res]);
  }
}, 2000);

const handleSort = (invoices, by) => {
  currentSort[by] = currentSort[by] === "asc" ? "desc" : "asc";
  const res = sortInvoices(invoices, by, currentSort[by]);
  insertInvoicesDataInTable(res);
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
function insertInvoicesDataInTable(currentInvoices) {
  const tableBody = document.getElementById("invoice-table-body");
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
    editBtn.dataset.id = invoice.id;
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "btn-action btn-delete";
    deleteBtn.dataset.id = invoice.id;
    deleteBtn.dataset.action = "delete";
    deleteBtn.dataset.id = invoice.id;

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
ovwBtn.addEventListener("click", () =>
  sectionNavigation(ovwBtn.dataset.section),
);
invBtn.addEventListener("click", () =>
  sectionNavigation(invBtn.dataset.section),
);
ordBtn.addEventListener("click", () =>
  sectionNavigation(ordBtn.dataset.section),
);
tbCustHead.addEventListener("click", () =>
  handleSort(invoices, "customerName", "asc"),
);
tbAmountHead.addEventListener("click", () =>
  handleSort(invoices, "amount", "asc"),
);
selectedStatus.addEventListener("change", handleFilter);
invSearchInput.addEventListener("keydown", handleSearch);
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
    handleUpdateInv(id);
  } else if (action === "delete") {
    handleDeleteInv(id);
  }
});
function updateInvoiceDashboard(invoices) {
  // 2. Render counts to UI
  renderInUI("#usable-invoice-count", useableInvoices.length);
  renderInUI("#paid-invoice-count", paidInvoices.length);
  renderInUI("#unpaid-invoice-count", unPaidInvoices.length);
  renderInUI("#failed-invoice-count", failedInvoices.length);
  renderInUI("#paid-revenue", paidRevenueAmount);
}

// Usage:
updateInvoiceDashboard(invoices);
insertInvoicesDataInTable(invoices);

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
