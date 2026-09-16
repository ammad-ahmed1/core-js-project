import { customers, invoices, orders, tasks } from "../data/data.js";
import { toValidDate } from "../script/helpers.js";

function getUseableInvoices(invoices) {
  let isArr = Array.isArray(invoices);
  if (!isArr) {
    //throw new Error("Invoices is not an array")
    return [];
  }
  let useableInvoices = invoices.filter(
    (invoice) =>
      invoice !== null &&
      typeof invoice === "object" &&
      !Array.isArray(invoice) &&
      typeof invoice.id === "string" &&
      invoice.id.trim() !== "" &&
      typeof invoice.customerName === "string" &&
      invoice.customerName.trim() !== "" &&
      ["paid", "unpaid", "failed", "cancelled"].includes(invoice.status) &&
      typeof invoice.amount === "number" &&
      Number.isFinite(invoice.amount) &&
      invoice.amount > 0 &&
      Array.isArray(invoice.lineItems),
  );
  return useableInvoices;
}

const getInvoicesByStatus = (invoices, status) => {
  if (!Array.isArray(invoices)) {
    return [];
  }
  let res = invoices.filter((inv) => inv.status === status);
  return res;
};

const getInvoiceById = (id, invoices) => {
  const invoice = invoices.find((inv) => inv.id === id);
  return invoice || null;
};
const getInvoiceByCustName = (name, invoices) => {
  const invoice = invoices.find((inv) => inv.customerName === name);
  return invoice || null;
};
const getInvoicesByDateRange = (invoices, dateField, startDate, endDate) => {
  if (!startDate && !endDate) {
    return [...invoices];
  }
  let invStartDate = toValidDate(startDate);
  let invEndDate = toValidDate(endDate);
  if (dateField !== "issueDate" && dateField !== "dueDate") {
    throw new Error("dateField must be either 'issueDate' or 'dueDate'");
  }
  if (
    dateField === "issueDate" &&
    (invStartDate === null || invEndDate === null)
  ) {
    throw new Error("Invalid date values for issueDate");
  }
  if (
    dateField === "dueDate" &&
    (invStartDate === null || invEndDate === null)
  ) {
    throw new Error("Invalid date values for dueDate");
  }
  if (dateField === "issueDate") {
    const filteredInvoices = invoices.filter((inv) => {
      return (
        toValidDate(inv.issueDate) >= invStartDate &&
        toValidDate(inv.issueDate) <= invEndDate
      );
    });
    return filteredInvoices;
  }
  if (dateField === "dueDate") {
    const filteredInvoices = invoices.filter((inv) => {
      return (
        toValidDate(inv.dueDate) >= invStartDate &&
        toValidDate(inv.dueDate) <= invEndDate
      );
    });
    return filteredInvoices;
  }
};
const getDueDatePassedInv = (invoices) => {
  const currTime = toValidDate(Date.now());

  const dueDatePassedInvoices = invoices?.filter((inv) => {
    let invDueDate = toValidDate(inv.dueDate);
    return (
      inv.status === "unpaid" && invDueDate !== null && invDueDate < currTime
    );
  });
  return dueDatePassedInvoices;
};
const getDaysPassedSinceDueDate = (invoices) => {
  const currTime = toValidDate(Date.now());
  const invoicesDaysPassed = invoices.map((inv) => {
    const dueTime = toValidDate(inv.dueDate);

    if (dueTime === null) {
      return {
        ...inv,
        daysPassed: null,
      };
    }
    const days = Math.floor((currTime - dueTime) / (24 * 60 * 60 * 1000));
    return {
      ...inv,
      daysPassed: days >= 0 ? days : 0,
    };
  });
  return invoicesDaysPassed;
};

const getInvoiceDueStatus = (invoice) => {
  const currTime = toValidDate(Date.now());
  const invoiceDueDate = toValidDate(invoice?.dueDate);
  if (!invoice) {
    return {
      state: "invalid",
      days: null,
      label: "—",
    };
  }
  if (invoice?.status === "paid") {
    return { state: "paid", days: null, label: "Paid" };
  }
  if (invoice?.status === "unpaid") {
    if (currTime === null || invoiceDueDate === null) {
      return {
        state: "invalid",
        days: null,
        label: "—",
      };
    }
    if (currTime > invoiceDueDate)
      return {
        state: "overdue",
        days: Math.floor((currTime - invoiceDueDate) / (24 * 60 * 60 * 1000)),
        label: "Overdue",
      };
    if (invoiceDueDate > currTime)
      return {
        state: "upcoming",
        days: Math.floor((invoiceDueDate - currTime) / (24 * 60 * 60 * 1000)),
        label: "Upcoming",
      };
    if (invoiceDueDate === currTime)
      return {
        state: "today",
        days: 0,
        label: "Today",
      };
  }
};

const recentActivities = (invoices) => {
  return invoices.slice(0, 10).map((invoice) => ({
    id: `activity-${invoice.id}`,
    text: `${invoice.id} belongs to ${invoice.customerName}`,
    date: invoice.issueDate,
  }));
};
const hasExpensiveItems = (orders, minPrice) => {
  if (!Array.isArray(orders)) {
    return false;
  }
  const isExpensiveItems = orders.some((order) => {
    if (!Array.isArray(order.items)) {
      return false;
    }
    return order?.items?.some((item) => item.unitPrice > minPrice);
  });
  return isExpensiveItems;
};

const doAllOrdersHaveItems = (orders) => {
  if (!Array.isArray(orders) || orders.length === 0) {
    return false;
  }
  const allOrdershaveitems = orders.every((order) => {
    if (Array.isArray(order.items) && order.items.length > 0) {
      // return order?.items?.every(item)
      return true;
    } else {
      return false;
    }
  });
  return allOrdershaveitems;
};

const useableInvoiceSummary = (invoices) => {
  const summaries = invoices?.forEach(
    (invoice) =>
      `Invoice ID: ${invoice.id}, Customer Name: ${invoice.customerName}, Status: ${invoice.status}, Amount: ${invoice.amount}`,
  );
  return summaries;
};

const sortInvoices = (data, by, order = "desc", validProperties = []) => {
  if (!Array.isArray(data)) return [];

  // Normalize inputs
  const dir = order.toLowerCase() === "desc" ? -1 : 1;
  const orderLabel = dir === 1 ? "ascending" : "descending";

  // Validate sorting property
  // const validProperties = [
  //   "amount",
  //   "customerName",
  //   "issueDate",
  //   "dueDate",
  //   "daysPassed",
  // ];
  if (!validProperties.includes(by)) {
    console.warn(
      `[Sort] Invalid sort property: "${by}". Returning original list.`,
    );
    return [...invoices];
  }

  // Console output stating what is being sorted and in what direction
  console.log(`[Sort] Sorting invoices by "${by}" in ${orderLabel} order.`);

  return [...data].sort((a, b) => {
    switch (by) {
      case "amount":
        // Numerical comparison
        return (a.amount - b.amount) * dir;

      case "customerName":
        // Alphabetical comparison (case-insensitive)
        return (
          a.customerName.localeCompare(b.customerName, undefined, {
            sensitivity: "base",
          }) * dir
        );

      case "issueDate":
      case "dueDate":
        // Date timestamp comparison
        const dateA = new Date(a[by]).getTime();
        const dateB = new Date(b[by]).getTime();
        return (dateA - dateB) * dir;
      case "daysPassed":
        return (a.daysPassed - b.daysPassed) * dir;
      default:
        return 0;
    }
  });
};

const updateLineItemQuantity = (
  invoices,
  invoiceId,
  lineItemId,
  newQuantity,
) => {
  return invoices?.map((invoice) => {
    if (invoice.id === invoiceId) {
      return {
        ...invoice,
        lineItems: invoice?.lineItems?.map((lineItem) => {
          if (lineItem.id === lineItemId) {
            return { ...lineItem, quantity: newQuantity };
          } else {
            return lineItem;
          }
        }),
      };
    } else {
      return invoice;
    }
  });
};

const perpareInvoicePreview = (invoices, newInvoice) => {
  if (!Array.isArray(invoices)) return null;
  const firstFiveInvoices = invoices?.slice(0, 5);
  const withNewInvoice = invoices?.concat(newInvoice);
  const withoutSecondInvoice = invoices?.toSpliced(1, 1);
  const firstInvoice = invoices?.at(0);
  const lastInvoice = invoices?.at(-1);
  return {
    firstFiveInvoices,
    withNewInvoice,
    withoutSecondInvoice,
    firstInvoice,
    lastInvoice,
  };
};

const paidRevenue = (invoices) => {
  if (!Array.isArray(invoices)) return 0;
  const totalRevenue = invoices.reduce((acc, currInv) => {
    if (
      currInv?.status === "paid" &&
      typeof currInv.amount === "number" &&
      Number.isFinite(currInv.amount) &&
      currInv.amount > 0
    ) {
      return acc + currInv.amount;
    }

    return acc;
  }, 0);
  return totalRevenue;
};

const countInvoicesByStatus = (invoices) => {};

//nested financial report (copied)
const nestedFinancialReport = (orders) => {
  const totalRevenue = orders
    .flatMap((order) => (Array.isArray(order?.items) ? order.items : []))
    .reduce((total, item) => {
      const quantity = item?.quantity;
      const unitPrice = item?.unitPrice;

      if (
        typeof quantity !== "number" ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        typeof unitPrice !== "number" ||
        !Number.isFinite(unitPrice) ||
        unitPrice <= 0
      ) {
        return total;
      }

      return total + quantity * unitPrice;
    }, 0);
  return totalRevenue;
};

//method chaining (copied)
const methodChainingFinancialReport = (invoices) => {
  const result = invoices
    .filter((invoice) => invoice.status === "paid")
    .map((invoice) => ({
      id: invoice.id,
      amount: invoice.amount,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  return result;
};

const useableInvoices = getUseableInvoices(invoices);
const searchedInvoices = getInvoicesByStatus(useableInvoices, "unpaid");
const invoiceById = getInvoiceById("INV-057", invoices);
const expensiveItems = hasExpensiveItems(orders, 1000);
const allOrdersHaveItems = doAllOrdersHaveItems(orders);
const invoiceSummaries = useableInvoiceSummary(useableInvoices);
const sortedInvoices = sortInvoices(useableInvoices);
const updatedInvoices = updateLineItemQuantity(
  invoices,
  "INV-057",
  "LI-003",
  10,
);
const perparedInvoicePreview = perpareInvoicePreview(invoices, {
  id: "INV-101",
  customerName: "Test Customer",
  status: "unpaid",
  amount: 25000,
  currency: "PKR",
  lineItems: [],
});
const totalPaidRevenue = paidRevenue(invoices);
const totalRevenue = nestedFinancialReport(orders);
const methodChainedRevenue = methodChainingFinancialReport(invoices);

// console.log("useable invoices: ", useableInvoices);
// console.log("searched invoices: ", searchedInvoices);
// console.log("invoice by ID: ", invoiceById);
// console.log("expensive items: ", expensiveItems);
// console.log("have items: ", allOrdersHaveItems);
// console.log("invoice summaries: ", invoiceSummaries);
// console.log("sorted invoices: ", sortedInvoices);
// console.log("updated invoices: ", updatedInvoices);
// console.log("perpared invoice preview: ", perparedInvoicePreview);
// console.log("total paid revenue: ", totalPaidRevenue);
// console.log("total nested revenue: ", totalRevenue);
// console.log("method chained revenue: ", methodChainedRevenue);

export {
  getUseableInvoices,
  getInvoiceById,
  getInvoiceByCustName,
  getInvoicesByStatus,
  paidRevenue,
  sortInvoices,
  getDueDatePassedInv,
  getDaysPassedSinceDueDate,
  getInvoicesByDateRange,
  getInvoiceDueStatus,
  recentActivities,
};
