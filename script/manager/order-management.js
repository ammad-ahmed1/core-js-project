class OrderManagement {
    constructor(orders){
        super('ORD', orders);
    }
    validate(data) {
  super.validate(data);

  if (typeof data.customerId !== "string" || !data.customerId.trim()) {
    throw new Error("Customer ID is required.");
  }

  const allowedStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!allowedStatuses.includes(data.status)) {
    throw new Error("Invalid order status.");
  }

  if (toValidDate(data.orderDate) === null) {
    throw new Error("A valid order date is required.");
  }

  if (
    typeof data.currency !== "string" ||
    !/^[A-Z]{3}$/.test(data.currency)
  ) {
    throw new Error("Currency must contain three uppercase letters.");
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error("An order must contain at least one item.");
  }

  for (const item of data.items) {
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      throw new Error("Each order item must be an object.");
    }

    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      throw new Error("Item quantity must be a positive number.");
    }

    if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
      throw new Error("Item price must be a non-negative number.");
    }
  }

  if (!Number.isFinite(data.discount) || data.discount < 0) {
    throw new Error("Discount must be a non-negative number.");
  }

  if (!Number.isFinite(data.shipping) || data.shipping < 0) {
    throw new Error("Shipping must be a non-negative number.");
  }
}
}