import { getReq } from "./api-and-service/service.js";
import { invoiceInitializer } from "./controller/invoice-controller.js";
import { customerInitializer } from "./controller/customer-controller.js";
import { orderInitializer } from "./controller/order-controller.js";
import { toggleLoader } from "./ui/loader-view.js";

const fetchInvoices = () => getReq("invoices");
const fetchCustomers = () => getReq("customers");
const fetchOrders = () => getReq("orders");
export async function bootstrap() {
  try {
    console.log("started bootstrap");
    toggleLoader(true);
    const [invoices, customers, orders] = await Promise.all([
      fetchInvoices(),
      fetchCustomers(),
      fetchOrders(),
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
    console.log("calling initializers from bootstrap");
    invoiceInitializer(invoices);
    customerInitializer(customers);
    orderInitializer(orders);
    toggleLoader(false);
    return { invoices, customers, orders };
  } catch (error) {
    console.error("Failed to load dashboard:", error);
  }
}
bootstrap();
