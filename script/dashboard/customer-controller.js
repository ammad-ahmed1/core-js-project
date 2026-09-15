import { customers } from "../../data/data.js";

import {
  dynamicTable,
  paginateItems,
  showNotification,
  sortData,
} from "../helpers.js";

import { CustomerManager } from "../manager/customer-manager.js";

const customerManager = new CustomerManager(customers);

const customerSearchInput = document.querySelector("#customer-search");
const customerStatusFilter = document.querySelector("#customer-status-filter");
const customerTableElement = document.querySelector("#customer-table");

const addCustomerBtn = document.querySelector("#add-customer-btn");
const customerModal = document.querySelector("#customer-modal");
const customerForm = document.querySelector("#customer-form");
const closeCustomerModalBtn = document.querySelector(
  "#close-customer-modal-btn",
);
const cancelCustomerModalBtn = document.querySelector(
  "#cancel-customer-modal-btn",
);

const inactiveCustomersCount = document.querySelector(
  "#inactive-customers-count",
);

const customerPageStart = document.querySelector("#customer-page-start");
const customerPageEnd = document.querySelector("#customer-page-end");
const customerTotalCount = document.querySelector("#customer-total-count");
const customerPrevPageBtn = document.querySelector("#customer-prev-page-btn");
const customerNextPageBtn = document.querySelector("#customer-next-page-btn");
const customerPageNumbers = document.querySelector("#customer-page-numbers");

const notificationToaster = document.querySelector("#notification");

const customerColumns = [
  "id",
  "name",
  "contactName",
  "email",
  "phone",
  "city",
  "industry",
  "status",
  "creditLimit",
  "createdAt",
];

const customerSortableKeys = ["name", "status", "creditLimit", "createdAt"];

let currentPage = 1;
const itemsPerPage = 25;

const currentSort = {
  customerName: "asc",
  amount: "asc",
};
let activeSortBy = null;
let inactiveCustomers = customerManager.findByField("status", "inactive");
inactiveCustomersCount.textContent = inactiveCustomers.length;

function getVisibleCustomers() {
  const selectedStatusValue = customerStatusFilter.value;
  const searchTerm = customerSearchInput.value.trim().toLowerCase();

  let visibleCustomers = customerManager.getAll();

  if (selectedStatusValue && selectedStatusValue !== "all") {
    visibleCustomers = visibleCustomers.filter(
      (customer) => customer.status === selectedStatusValue,
    );
  }

  if (searchTerm) {
    visibleCustomers = visibleCustomers.filter((customer) => {
      const customerId = String(customer.id ?? "").toLowerCase();
      const customerName = String(customer.name ?? "").toLowerCase();
      const contactName = String(customer.contactName ?? "").toLowerCase();
      const email = String(customer.email ?? "").toLowerCase();
      const city = String(customer.city ?? "").toLowerCase();

      return (
        customerId.includes(searchTerm) ||
        customerName.includes(searchTerm) ||
        contactName.includes(searchTerm) ||
        email.includes(searchTerm) ||
        city.includes(searchTerm)
      );
    });
  }

  if (activeSortBy) {
    visibleCustomers = sortData(
      visibleCustomers,
      activeSortBy,
      currentSort[activeSortBy],
      ["creditLimit", "createdAt"],
    );
  }
  console.log(visibleCustomers);
  return visibleCustomers;
}

const toggleModal = (show = null) => {
  if (show === true) {
    modal.classList.remove("inactive");
  } else if (show === false) {
    modal.classList.add("inactive");
  } else {
    modal.classList.toggle("inactive");
  }
};

function updateCustomerSummary() {
  const inactiveCount = customerManager
    .getAll()
    .filter((customer) => customer.status === "inactive").length;

  inactiveCustomersCount.textContent = inactiveCount;
}

function updateCustomerPagination(totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  customerPageStart.textContent =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;

  customerPageEnd.textContent = Math.min(
    currentPage * itemsPerPage,
    totalItems,
  );

  customerTotalCount.textContent = totalItems;
  customerPrevPageBtn.disabled = currentPage === 1;
  customerNextPageBtn.disabled = currentPage === totalPages;

  customerPageNumbers.innerHTML = "";

  for (let page = 1; page <= totalPages; page++) {
    const pageBtn = document.createElement("button");
    pageBtn.className =
      page === currentPage
        ? "btn-page page-number active"
        : "btn-page page-number";
    pageBtn.textContent = page;
    pageBtn.dataset.page = page;
    customerPageNumbers.appendChild(pageBtn);
  }
}
function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const pageNumbersContainer = document.getElementById("customer-page-numbers");
  const pageStart = document.getElementById("customer-page-start");
  const pageEnd = document.getElementById("customer-page-end");
  const totalCount = document.getElementById("customer-total-count");

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

  customerPrevPageBtn.disabled = currentPage === 1;
  customerNextPageBtn.disabled = currentPage >= totalPages;
}
function updateCustomerTable() {
  const visibleCustomers = getVisibleCustomers();
  console.log(visibleCustomers, ": scscsc");
  updateCustomerPagination(visibleCustomers.length);
  const totalPages = Math.max(
    1,
    Math.ceil(visibleCustomers.length / itemsPerPage),
  );

  currentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedData = visibleCustomers.length
    ? paginateItems(visibleCustomers, itemsPerPage, currentPage)
    : [];

  dynamicTable(
    customerTableElement,
    paginatedData,
    customerColumns,
    ["creditLimit", "createdAt"],
    // customerSortableKeys,
  );

  renderPagination(visibleCustomers.length);
}

function toggleCustomerModal(show = null) {
  if (show === true) {
    customerModal.classList.remove("inactive");
    customerModal.classList.add("active");
    return;
  }

  if (show === false) {
    customerModal.classList.remove("active");
    customerModal.classList.add("inactive");
    return;
  }

  customerModal.classList.toggle("active");
  customerModal.classList.toggle("inactive");
}

function fillCustomerForm(customerID) {
  let customer = customerManager.getById(customerID);

  customerForm.elements["id"].value = customer.id;
  customerForm.elements["name"].value = customer.name || "";
  customerForm.elements["contactName"].value = customer.contactName || "";
  customerForm.elements["email"].value = customer.email || "";
  customerForm.elements["phone"].value = customer.phone || "";
  customerForm.elements["city"].value = customer.city || "";
  customerForm.elements["country"].value = customer.country || "";
  customerForm.elements["industry"].value = customer.industry || "";
  customerForm.elements["status"].value = customer.status || "prospect";
  customerForm.elements["creditLimit"].value = customer.creditLimit ?? "";
  customerForm.elements["createdAt"].value = customer.createdAt || "";
}
function clearCustomerForm() {
  customerForm.elements["id"].value = "";
  customerForm.elements["name"].value = "";
  customerForm.elements["contactName"].value = "";
  customerForm.elements["email"].value = "";
  customerForm.elements["phone"].value = "";
  customerForm.elements["city"].value = "";
  customerForm.elements["country"].value = "";
  customerForm.elements["industry"].value = "";
  customerForm.elements["status"].value = "prospect";
  customerForm.elements["creditLimit"].value = "";
  customerForm.elements["createdAt"].value = "";
}
function getCustomerFormData() {
  const formData = new FormData(customerForm);

  return {
    name: formData.get("name").trim(),
    contactName: formData.get("contactName").trim(),
    email: formData.get("email").trim(),
    phone: formData.get("phone").trim(),
    city: formData.get("city").trim(),
    country: formData.get("country").trim(),
    industry: formData.get("industry").trim(),
    status: formData.get("status"),
    creditLimit: Number(formData.get("creditLimit")),
    createdAt: formData.get("createdAt"),
  };
}

function handleCustomerSubmit(event) {
  event.preventDefault();

  try {
    const customerId = customerForm.elements["id"].value;
    const customerData = getCustomerFormData();

    if (customerId) {
      customerManager.updator(customerData, customerId);
      showNotification(
        "Customer updated successfully",
        "success",
        notificationToaster,
      );
    } else {
      customerManager.creator(customerData);
      showNotification(
        "Customer added successfully",
        "success",
        notificationToaster,
      );
    }

    toggleCustomerModal(false);
    clearCustomerForm();
    updateCustomerTable();
  } catch (error) {
    showNotification(error.message, "error", notificationToaster);
  }
}

function handleCustomerTableClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const customerId = button.dataset.id;

  if (button.dataset.action === "delete") {
    customerManager.deleter(customerId);
    updateCustomerTable();
    showNotification(
      "Customer deleted successfully",
      "success",
      notificationToaster,
    );
    return;
  }

  if (button.dataset.action === "edit") {
    const customer = customerManager.getById(customerId);
    if (!customer) return;

    fillCustomerForm(customer);
    customerModal.classList.remove("inactive");
    customerModal.classList.add("active");
  }
}

function handleCustomerSort(sortKey) {
  currentSort[sortKey] = currentSort[sortKey] === "asc" ? "desc" : "asc";
  activeSortBy = sortKey;
  currentPage = 1;

  updateCustomerTable();
}
const handleDeleteCust = (id) => {
  customerManager.deleter(id, "INV", notificationToaster);
  updateCustomerTable();
};

customerSearchInput.addEventListener("input", () => {
  currentPage = 1;
  updateCustomerTable();
});

customerStatusFilter.addEventListener("change", () => {
  currentPage = 1;
  updateCustomerTable();
});

addCustomerBtn.addEventListener("click", toggleCustomerModal);
closeCustomerModalBtn.addEventListener("click", toggleCustomerModal);
cancelCustomerModalBtn.addEventListener("click", toggleCustomerModal);
customerForm.addEventListener("submit", handleCustomerSubmit);
// customerTableElement.addEventListener("click", handleCustomerTableClick);
// customerTableElement.addEventListener("click", sortData);

customerTableElement.addEventListener("click", (e) => {
  const target = e.target;
  const th = target.closest("th[data-sort]");
  if (th) {
    const sortKey = th.dataset.sort;
    handleCustomerSort(sortKey);
    return;
  }
  const button = target.closest("[data-action]");
  if (button) {
    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") {
      fillCustomerForm(id);
      toggleCustomerModal(true);
    } else if (action === "delete") {
      handleDeleteCust(id);
    }
    return;
  }
});

customerPageNumbers.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-page-num")) {
    currentPage = Number(e.target.dataset.page);
    updateCustomerTable();
  }
});

customerPrevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    updateCustomerTable();
  }
});

customerNextPageBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(getVisibleCustomers().length / itemsPerPage);
  console.log(totalPages);
  if (currentPage < totalPages) {
    currentPage++;
    updateCustomerTable();
  }
});

updateCustomerTable();
