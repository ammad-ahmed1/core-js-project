import { invoices } from "../../data/data.js";
import { renderInUI, addClass, removeClass, debounce } from "../helpers.js";
import {
  getUseableInvoices,
  getInvoiceById,
  getInvoiceByCustName,
  getInvoicesByStatus,
  paidRevenue,
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
console.log(selectedStatus.value);

const handleFilter = (e) => {
  console.log(e.target.value);
  const filtered = e.target.value;
  let res =
    filtered === "all" ? invoices : getInvoicesByStatus(invoices, filtered);
  console.log(res);
  currentInvoices = res;
  insertInvoicesDataInTable(res);
};
selectedStatus.addEventListener("change", handleFilter);
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
invSearchInput.addEventListener("keydown", handleSearch);

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
ovwBtn.addEventListener("click", () =>
  sectionNavigation(ovwBtn.dataset.section),
);
invBtn.addEventListener("click", () =>
  sectionNavigation(invBtn.dataset.section),
);
ordBtn.addEventListener("click", () =>
  sectionNavigation(ordBtn.dataset.section),
);

function updateInvoiceDashboard(invoices) {
  // 1. Process invoice metrics
  const useableInvoices = getUseableInvoices(invoices);
  const paidInvoices = getInvoicesByStatus(useableInvoices, "paid");
  const unPaidInvoices = getInvoicesByStatus(useableInvoices, "unpaid");
  const failedInvoices = getInvoicesByStatus(useableInvoices, "failed");
  const paidRevenueAmount = paidRevenue(useableInvoices);

  // 2. Render counts to UI
  renderInUI("#usable-invoice-count", useableInvoices.length);
  renderInUI("#paid-invoice-count", paidInvoices.length);
  renderInUI("#unpaid-invoice-count", unPaidInvoices.length);
  renderInUI("#failed-invoice-count", failedInvoices.length);
  renderInUI("#paid-revenue", paidRevenueAmount);
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

    row.appendChild(invIdCell);
    row.appendChild(custCell);
    row.appendChild(statusCell);
    row.appendChild(amountCell);

    tableBody.appendChild(row);
  });
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
