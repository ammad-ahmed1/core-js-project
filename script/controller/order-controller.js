import { orders } from "../../data/data.js";
import {
  dynamicTable,
  paginateItems,
  showNotification,
  sortData,
} from "../helpers.js";
import { OrderManager } from "../manager/order-manager.js";
import { toggleModal } from "../ui/modal-view.js";
import { renderPagination } from "../ui/pagination-view.js";

const orderManager = new OrderManager(orders);
const cancelledOrdersCountElement = document.querySelector(
  "#cancelled-orders-count",
);
const orderSearchInput = document.querySelector("#orders-search");
const orderStatusFilter = document.querySelector("#orders-status-filter");
const orderModal = document.querySelector("#order-modal");
const addOrderBtn = document.querySelector("#add-order-btn");
const closeOrderModalBtn = document.querySelector("#close-order-modal-btn");
const cancelOrderModalBtn = document.querySelector("#cancel-order-modal-btn");
const orderForm = document.querySelector("#order-form");

const orderPageStart = document.querySelector("#order-page-start");
const orderPageEnd = document.querySelector("#order-page-end");
const orderTotalCount = document.querySelector("#order-total-count");
const orderPrevPageBtn = document.querySelector("#order-prev-page-btn");
const orderNextPageBtn = document.querySelector("#order-next-page-btn");
const orderPageNumbers = document.querySelector("#order-page-numbers");
const notificationToaster = document.querySelector("#notification");

const tableElement = document.querySelector("#order-table");
function updateOrderSummary() {
  const cancelledCount = orderManager.findByField("status", "cancelled").length;

  cancelledOrdersCountElement.textContent = cancelledCount;
}

const orderColumns = [
  "id",
  "customerName",
  "status",
  "paymentStatus",
  "total",
  "orderDate",
  "expectedDeliveryDate",
];

const orderSortableKeys = [
  "items",
  "total",
  "orderDate",
  "expectedDeliveryDate",
];

let currentPage = 1;
const itemsPerPage = 25;

const currentSort = {
  customerName: "asc",
  amount: "asc",
};
let activeSortBy = null;

function getVisibleOrders() {
  const selectedStatusValue = orderStatusFilter.value;
  const searchTerm = orderSearchInput.value.trim().toLowerCase();

  let visibleOrders = orderManager.getAll();

  if (selectedStatusValue && selectedStatusValue !== "all") {
    visibleOrders = visibleOrders.filter(
      (order) => order.status === selectedStatusValue,
    );
  }

  if (searchTerm) {
    visibleOrders = visibleOrders.filter((order) => {
      const orderId = String(order?.id ?? "").toLowerCase();
      const customerId = String(order?.customerId ?? "").toLowerCase();
      const customerName = String(order?.customerName ?? "").toLowerCase();

      const matchesProduct =
        Array.isArray(order?.items) &&
        order.items.some(
          (item) =>
            String(item?.productId ?? "")
              .toLowerCase()
              .includes(searchTerm) ||
            String(item?.productName ?? "")
              .toLowerCase()
              .includes(searchTerm),
        );

      return (
        orderId.includes(searchTerm) ||
        customerId.includes(searchTerm) ||
        customerName.includes(searchTerm) ||
        matchesProduct
      );
    });
  }

  if (activeSortBy) {
    visibleOrders = sortData(
      visibleOrders,
      activeSortBy,
      currentSort[activeSortBy],
      orderSortableKeys,
    );
  }
  return visibleOrders;
}

function updateOrderTable() {
  const visibleOrders = getVisibleOrders();

  const totalPages = Math.max(
    1,
    Math.ceil(visibleOrders.length / itemsPerPage),
  );

  currentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const paginatedData = visibleOrders.length
    ? paginateItems(visibleOrders, itemsPerPage, currentPage)
    : [];

  dynamicTable(tableElement, paginatedData, orderColumns, orderSortableKeys);

  renderPagination(
    visibleOrders.length,
    currentPage,
    itemsPerPage,
    orderPageStart,
    orderPageEnd,
    orderTotalCount,
    orderPageNumbers,
    orderPrevPageBtn,
    orderNextPageBtn,
  );
}
function refreshOrderView() {
  updateOrderTable();
  updateOrderSummary();
}
function fillOrderForm(orderId) {
  const order = orderManager.getById(orderId);
  const firstItem = order.items?.[0] ?? {};

  orderForm.elements["id"].value = order.id;
  orderForm.elements["customerId"].value = order.customerId || "";
  orderForm.elements["customerName"].value = order.customerName || "";
  orderForm.elements["status"].value = order.status || "pending";
  orderForm.elements["paymentStatus"].value = order.paymentStatus || "pending";
  orderForm.elements["currency"].value = order.currency || "PKR";

  orderForm.elements["productId"].value = firstItem.productId || "";
  orderForm.elements["productName"].value = firstItem.productName || "";
  orderForm.elements["quantity"].value = firstItem.quantity ?? "";
  orderForm.elements["unitPrice"].value = firstItem.unitPrice ?? "";

  orderForm.elements["discount"].value = order.discount ?? 0;
  orderForm.elements["shipping"].value = order.shipping ?? 0;
  orderForm.elements["orderDate"].value = order.orderDate || "";
  orderForm.elements["expectedDeliveryDate"].value =
    order.expectedDeliveryDate || "";
  orderForm.elements["salesChannel"].value = order.salesChannel || "website";
}

function clearOrderForm() {
  orderForm.reset();

  orderForm.elements["id"].value = "";
  orderForm.elements["status"].value = "pending";
  orderForm.elements["paymentStatus"].value = "pending";
  orderForm.elements["currency"].value = "PKR";
  orderForm.elements["discount"].value = 0;
  orderForm.elements["shipping"].value = 0;
  orderForm.elements["salesChannel"].value = "website";
}

function getOrderFormData() {
  const formData = new FormData(orderForm);
  console.log(formData);
  const quantity = Number(formData.get("quantity"));
  const unitPrice = Number(formData.get("unitPrice"));
  const discount = Number(formData.get("discount"));
  const shipping = Number(formData.get("shipping"));

  const items = [
    {
      productId: formData.get("productId").trim(),
      productName: formData.get("productName").trim(),
      quantity,
      unitPrice,
    },
  ];

  const subtotal = quantity * unitPrice;
  const total = Math.max(0, subtotal - discount + shipping);

  return {
    customerId: formData.get("customerId").trim(),
    customerName: formData.get("customerName").trim(),
    status: formData.get("status"),
    paymentStatus: formData.get("paymentStatus"),
    currency: formData.get("currency").trim().toUpperCase(),
    items,
    subtotal,
    discount,
    shipping,
    total,
    orderDate: formData.get("orderDate"),
    expectedDeliveryDate: formData.get("expectedDeliveryDate"),
    salesChannel: formData.get("salesChannel"),
  };
}

function handleOrderSubmit(event) {
  event.preventDefault();

  try {
    const orderId = orderForm.elements["id"].value;
    const orderData = getOrderFormData();

    if (orderId) {
      orderManager.updator(orderData, orderId);

      showNotification(
        "Order updated successfully",
        "success",
        notificationToaster,
      );
    } else {
      orderManager.creator(orderData);

      showNotification(
        "Order added successfully",
        "success",
        notificationToaster,
      );
    }

    toggleModal(orderModal, false);
    clearOrderForm();
    refreshOrderView();
  } catch (error) {
    showNotification(error.message, "error", notificationToaster);
  }
}

function handleOrderSort(sortKey) {
  currentSort[sortKey] = currentSort[sortKey] === "asc" ? "desc" : "asc";
  activeSortBy = sortKey;
  currentPage = 1;

  refreshOrderView();
}

const handleDeleteOrder = (id) => {
  orderManager.deleter(id);
  showNotification(
    "Order deleted successfully",
    "success",
    notificationToaster,
  );
  refreshOrderView();
};

addOrderBtn.addEventListener("click", () => {
  clearOrderForm();
  toggleModal(orderModal, true);
});

closeOrderModalBtn.addEventListener("click", () => {
  toggleModal(orderModal, false);
});

cancelOrderModalBtn.addEventListener("click", () => {
  toggleModal(orderModal, false);
});
orderForm.addEventListener("submit", handleOrderSubmit);

tableElement.addEventListener("click", (e) => {
  const target = e.target;
  const th = target.closest("th[data-sort]");
  if (th) {
    const sortKey = th.dataset.sort;
    handleOrderSort(sortKey);
    return;
  }
  const button = target.closest("[data-action]");
  if (button) {
    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") {
      fillOrderForm(id);
      toggleModal(orderModal, true);
    } else if (action === "delete") {
      handleDeleteOrder(id);
    }
    return;
  }
});

orderPageNumbers.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-page-num")) {
    currentPage = Number(e.target.dataset.page);
    refreshOrderView();
  }
});

orderPrevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    refreshOrderView();
  }
});
orderSearchInput.addEventListener("input", () => {
  currentPage = 1;
  refreshOrderView();
});

orderStatusFilter.addEventListener("change", () => {
  currentPage = 1;
  refreshOrderView();
});
orderNextPageBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(getVisibleOrders().length / itemsPerPage);
  console.log(totalPages);
  if (currentPage < totalPages) {
    currentPage++;
    refreshOrderView();
  }
});

refreshOrderView();
