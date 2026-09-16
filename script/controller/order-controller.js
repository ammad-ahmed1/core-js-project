import { orders } from "../../data/data.js";
import { OrderManager } from "../manager/order-manager.js";
console.log(orders);
const orderManager = new OrderManager(orders);
const cancelledOrdersCountElement = document.querySelector(
  "#cancelled-orders-count",
);
const orderSearchInput = document.querySelector("#orders-search");
const orderStatusFilter = document.querySelector("#orders-status-filter");
const tableElement = document.querySelector("#order-table");
const getCancelledOrders = () => {
  let cancelledOrders = orderManager.findByField("status", "cancelled");
  return cancelledOrders;
};

const orderColumns = [
  "id",
  "customerName",
  "status",
  "paymentStatus",
  "items",
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

const cancelledOrdersCount = getCancelledOrders();
cancelledOrdersCountElement.textContent = cancelledOrdersCount.length;
getCancelledOrders();

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
  return visibleCustomers;
}
