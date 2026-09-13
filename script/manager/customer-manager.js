class CustomerManager extends RecordManager {
  constructor(customers) {
    super("CUS", customers);
  }
  validate(data) {
    super.validate(data);
    if (typeof data.id !== "string" || !data.id.trim()) {
      throw new Error("Customer ID is required.");
    }
    if (typeof data.name !== "string" || !data.name.trim()) {
      throw new Error("Customer name is required.");
    }

    if (typeof data.contactName !== "string" || !data.contactName.trim()) {
      throw new Error("Contact name is required.");
    }

    if (
      typeof data.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
    ) {
      throw new Error("A valid email address is required.");
    }

    if (!["active", "prospect", "inactive"].includes(data.status)) {
      throw new Error("Invalid customer status.");
    }

    if (!Number.isFinite(data.creditLimit) || data.creditLimit < 0) {
      throw new Error("Credit limit must be a non-negative number.");
    }
  }
}
