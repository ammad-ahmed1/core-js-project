import { RecordManager } from "./record-manager.js";
import { toValidDate } from "../helpers.js";
export class InvoiceManager extends RecordManager {
  constructor(invoices) {
    super("INV", invoices);
  }

  validate(invoice) {
    super.validate(invoice);

    if (typeof invoice.id !== "string" || !invoice.id.trim()) {
      throw new Error("Invoice ID is required.");
    }

    if (
      typeof invoice.customerName !== "string" ||
      !invoice.customerName.trim()
    ) {
      throw new Error("Customer name is required.");
    }

    if (!["paid", "unpaid", "failed", "cancelled"].includes(invoice.status)) {
      throw new Error("Invalid invoice status.");
    }

    if (!Number.isFinite(invoice.amount) || invoice.amount <= 0) {
      throw new Error("Invoice amount must be a positive number.");
    }

    // if (!Array.isArray(invoice.lineItems)) {
    //   throw new Error("Invoice lineItems must be an array.");
    // }
  }

  getUseableInvoices() {
    return this.getAll().filter((invoice) => {
      try {
        this.validate(invoice);
        return true;
      } catch {
        return false;
      }
    });
  }

  // Sums paid invoices in the requested currency.
  paidRevenue(currency) {
    if (typeof currency !== "string" || !currency.trim()) {
      throw new Error("Supply a currency, for example PKR.");
    }

    const currencyCode = currency.trim().toUpperCase();

    return this.getAll().reduce((total, invoice) => {
      if (
        invoice?.status === "paid" &&
        invoice.currency === currencyCode &&
        Number.isFinite(invoice.amount) &&
        invoice.amount > 0
      ) {
        return total + invoice.amount;
      }

      return total;
    }, 0);
  }

  getInvoiceDueStatus(invoice) {
    if (!invoice) {
      return { state: "invalid", days: null, label: "—" };
    }

    if (invoice.status === "paid") {
      return { state: "paid", days: null, label: "Paid" };
    }

    if (invoice.status === "cancelled") {
      return { state: "cancelled", days: null, label: "Cancelled" };
    }

    if (invoice.status !== "unpaid") {
      return { state: "invalid", days: null, label: "—" };
    }

    const dueTime = toValidDate(invoice.dueDate);

    if (dueTime === null) {
      return { state: "invalid", days: null, label: "—" };
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const today = Math.floor(Date.now() / millisecondsPerDay);
    const dueDay = Math.floor(dueTime / millisecondsPerDay);
    const difference = dueDay - today;

    if (difference < 0) {
      return {
        state: "overdue",
        days: -difference,
        label: "Overdue",
      };
    }

    if (difference > 0) {
      return {
        state: "upcoming",
        days: difference,
        label: "Upcoming",
      };
    }

    return { state: "today", days: 0, label: "Today" };
  }

  getDueDatePassedInv() {
    return this.getAll().filter(
      (invoice) => this.getInvoiceDueStatus(invoice).state === "overdue",
    );
  }

  getDaysPassedSinceDueDate() {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const today = Math.floor(Date.now() / millisecondsPerDay);

    return this.getAll().map((invoice) => {
      const dueTime = toValidDate(invoice?.dueDate);

      return {
        ...invoice,
        daysPassed:
          dueTime === null
            ? null
            : Math.max(0, today - Math.floor(dueTime / millisecondsPerDay)),
      };
    });
  }
  getInvoicesByDateRange(invoices, dateField, startDate, endDate) {
    if (!Array.isArray(invoices)) {
      throw new Error("Invoices must be an array.");
    }
    if (!startDate && !endDate) return [...invoices];

    if (!["issueDate", "dueDate"].includes(dateField)) {
      throw new Error("dateField must be 'issueDate' or 'dueDate'.");
    }

    const start = toValidDate(startDate);
    const end = toValidDate(endDate);
    if (start === null || end === null) {
      throw new Error(`Invalid date values for ${dateField}.`);
    }

    return invoices.filter((invoice) => {
      const date = toValidDate(invoice?.[dateField]);
      return date !== null && date >= start && date <= end;
    });
  }
  updateLineItemQuantity(invoiceId, lineItemId, newQuantity) {
    if (!Number.isFinite(newQuantity) || newQuantity <= 0) {
      throw new Error("Quantity must be a positive number.");
    }

    const invoice = this.getById(invoiceId);

    if (!invoice) {
      throw new Error("Invoice not found.");
    }

    if (
      !Array.isArray(invoice.lineItems) ||
      !invoice.lineItems.some((item) => item?.id === lineItemId)
    ) {
      throw new Error("Line item not found.");
    }

    const lineItems = invoice.lineItems.map((item) =>
      item?.id === lineItemId ? { ...item, quantity: newQuantity } : item,
    );

    return this.updator({ lineItems }, invoiceId);
  }
}
