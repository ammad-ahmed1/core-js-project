import { getReq } from "./api-and-service/service.js";
import { invoiceInitializer } from "./controller/invoice-controller.js";
import { customerInitializer } from "./controller/customer-controller.js";
import { orderInitializer } from "./controller/order-controller.js";
import { toggleLoader } from "./ui/loader-view.js";

const fetchInvoices = (signal) => getReq("invoices", undefined, { signal });
const fetchCustomers = (signal) => getReq("customers", undefined, { signal });
const fetchOrders = (signal) => getReq("orders", undefined, { signal });

export async function bootstrap() {
  const controller = new AbortController();

  try {
    // console.log("started bootstrap");
    toggleLoader(true);
    const [invoices, customers, orders] = await Promise.all([
      fetchInvoices(controller.signal),
      fetchCustomers(controller.signal),
      fetchOrders(controller.signal),
    ]);
    if (
      !Array.isArray(invoices) ||
      !Array.isArray(customers) ||
      !Array.isArray(orders)
    ) {
      throw new TypeError(
        "One or more resources failed to load as a valid array.",
      );
    }
    // console.log("calling initializers from bootstrap");
    invoiceInitializer(invoices);
    customerInitializer(customers);
    orderInitializer(orders);
    return { invoices, customers, orders };
  } catch (error) {
    // Promise.all does not cancel the remaining requests when one fails.
    controller.abort();
    console.error("Failed to load dashboard:", error);
  } finally {
    toggleLoader(false);
  }
}
bootstrap();
