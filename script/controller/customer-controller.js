import {
  dynamicTable,
  paginateItems,
  showNotification,
  sortData,
} from "../helpers.js";

import { CustomerManager } from "../manager/customer-manager.js";
import { toggleModal } from "../ui/modal-view.js";
import { renderPagination } from "../ui/pagination-view.js";

const customerSearchInput = document.querySelector("#customer-search");
const customerStatusFilter = document.querySelector("#customer-status-filter");
const customerTableElement = document.querySelector("#customer-table");

const addCustomerBtn = document.querySelector("#add-customer-btn");
const customerModal = document.querySelector("#customer-modal");
const customerForm = document.querySelector("#customer-form");
const submitCustBtn = document.querySelector("#save-customer-btn");
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

let customerManager;
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

const customerSortableKeys = ["creditLimit", "createdAt"];

let currentPage = 1;
const itemsPerPage = 25;

const currentSort = {
  customerName: "asc",
  amount: "asc",
};
let activeSortBy = null;

function updateCustomerSummary() {
  const inactiveCount = customerManager
    .getAll("customers")
    .filter((customer) => customer.status === "inactive").length;

  inactiveCustomersCount.textContent = inactiveCount;
}

function refreshCustomerView() {
  updateCustomerTable();
  updateCustomerSummary();
}

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
  return visibleCustomers;
}

function updateCustomerTable() {
  const visibleCustomers = getVisibleCustomers();
  // renderPagination(
  //   visibleCustomers.length,
  //   1,
  //   25,
  //   customerPageStart,
  //   customerPageEnd,
  //   customerTotalCount,
  //   customerPageNumbers,
  //   customerPrevPageBtn,
  //   customerNextPageBtn,
  // );
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
    customerSortableKeys,
  );

  renderPagination(
    visibleCustomers.length,
    currentPage,
    itemsPerPage,
    customerPageStart,
    customerPageEnd,
    customerTotalCount,
    customerPageNumbers,
    customerPrevPageBtn,
    customerNextPageBtn,
  );
}

async function fillCustomerForm(customerID) {
  let customer = await customerManager.getById("customers", customerID);

  customerForm.elements["id"].value = customer[0].id;
  customerForm.elements["name"].value = customer[0].name || "";
  customerForm.elements["contactName"].value = customer[0].contactName || "";
  customerForm.elements["email"].value = customer[0].email || "";
  customerForm.elements["phone"].value = customer[0].phone || "";
  customerForm.elements["city"].value = customer[0].city || "";
  customerForm.elements["country"].value = customer[0].country || "";
  customerForm.elements["industry"].value = customer[0].industry || "";
  customerForm.elements["status"].value = customer[0].status || "prospect";
  customerForm.elements["creditLimit"].value = customer[0].creditLimit ?? "";
  customerForm.elements["createdAt"].value = customer[0].createdAt || "";
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

async function handleCustomerSubmit(event) {
  event.preventDefault();
  let currentSubmitFormBtnTxt = submitCustBtn.textContent;
  submitCustBtn.textContent = "Saving...";
  submitCustBtn.disabled = true;
  try {
    const customerId = customerForm.elements["id"].value;
    const customerData = getCustomerFormData();
    let successMessage;

    if (customerId) {
      await customerManager.updator("customers", customerData, customerId);
      successMessage = "Customer updated successfully";
    } else {
      await customerManager.creator("customers", customerData);
      successMessage = "Customer added successfully";
    }
    showNotification(successMessage, "success", notificationToaster);
    clearCustomerForm();
    refreshCustomerView();
    toggleModal(customerModal, false);
  } catch (error) {
    showNotification(error.message, "error", notificationToaster);
  } finally {
    submitCustBtn.textContent = currentSubmitFormBtnTxt;
    submitCustBtn.disabled = false;
  }
}

function handleCustomerSort(sortKey) {
  currentSort[sortKey] = currentSort[sortKey] === "asc" ? "desc" : "asc";
  activeSortBy = sortKey;
  currentPage = 1;

  refreshCustomerView();
}
const handleDeleteCust = async (id) => {
  try {
    await customerManager.deleter("customers", id);

    showNotification(
      "Customer deleted successfully",
      "success",
      notificationToaster,
    );

    refreshCustomerView();
  } catch (error) {
    showNotification(error.message, "error", notificationToaster);
  }
};

customerSearchInput.addEventListener("input", () => {
  currentPage = 1;
  refreshCustomerView();
});

customerStatusFilter.addEventListener("change", () => {
  currentPage = 1;
  refreshCustomerView();
});

addCustomerBtn.addEventListener("click", () => {
  clearCustomerForm();
  toggleModal(customerModal, true);
});

closeCustomerModalBtn.addEventListener("click", () => {
  toggleModal(customerModal, false);
});

cancelCustomerModalBtn.addEventListener("click", () => {
  toggleModal(customerModal, false);
});
customerForm.addEventListener("submit", handleCustomerSubmit);

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
      toggleModal(customerModal, true);
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
  if (currentPage < totalPages) {
    currentPage++;
    updateCustomerTable();
  }
});
export async function customerInitializer(data) {
  customerManager = new CustomerManager(data);
  refreshCustomerView();
}
