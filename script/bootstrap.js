import { getReq } from "./api-and-service/service.js";
import { invoiceInitializer } from "./controller/invoice-controller.js";
import { customerInitializer } from "./controller/customer-controller.js";
import { orderInitializer } from "./controller/order-controller.js";
import { toggleLoader } from "./ui/loader-view.js";

const fetchInvoices = (signal) => getReq("invoices", undefined, { signal });
const fetchCustomers = (signal) => getReq("customers", undefined, { signal });
const fetchOrders = (signal) => getReq("orders", undefined, { signal });

function initializeModule(result, initializer, moduleName) {
  if (result.status === "fulfilled" && Array.isArray(result.value)) {
    initializer(result.value);
    return;
  }

  const reason =
    result.status === "rejected"
      ? result.reason
      : "API response was not an array";

  console.error(`${moduleName} failed to load:`, reason);

  // Prevents the failed module's controller
  // from having an undefined manager.
  initializer([]);
}

export async function bootstrap() {

  try {
    // console.log("started bootstrap");
    toggleLoader(true);
    const [invoiceResult, customerResult, orderResult] =
      await Promise.allSettled([
        fetchInvoices(),
        fetchCustomers(),
        fetchOrders(),
      ]);

    initializeModule(invoiceResult, invoiceInitializer, "Invoices");

    initializeModule(customerResult, customerInitializer, "Customers");

    initializeModule(orderResult, orderInitializer, "Orders");
  } catch (error) {
    // Promise.all does not cancel the remaining requests when one fails.
   
    console.error("Failed to load dashboard:", error);
  } finally {
    toggleLoader(false);
  }
}
bootstrap();
