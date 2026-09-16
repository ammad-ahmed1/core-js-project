export class RecordManager {
  #arr;
  constructor(prefix, arr) {
    this.prefix = prefix;
    this.#arr = structuredClone(arr);
  }
  validate(data) {
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Record must be an object.");
    }
  }
  getAll() {
    return structuredClone(this.#arr);
  }
  generateId() {
    const highestId = this.#arr.reduce((highest, item) => {
      const [itemPrefix, numericPart] = String(item?.id ?? "").split("-");
      const numericId = Number(numericPart);

      if (itemPrefix !== this.prefix || !Number.isInteger(numericId)) {
        return highest;
      }

      return Math.max(highest, numericId);
    }, 0);

    return `${this.prefix}-${String(highestId + 1).padStart(3, "0")}`;
  }

  creator(data) {
    const id = this.generateId();
    const record = structuredClone({ ...data, id });
    this.validate(record);
    this.#arr = [...this.#arr, record];

    return this.getAll();
  }

  getById(id) {
    if (!id) {
      throw new Error("Missing ID!");
    }
    const res = this.#arr.find((item) => item.id === id);
    if (!res) throw new Error("Record not found!");
    return structuredClone(res);
  }

  updator(data, id) {
    if (
      !id ||
      data === null ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      throw new Error("Missing ID or invalid update data!");
    }

    const existing = this.#arr.find((item) => item.id === id);
    if (!existing) throw new Error("Record not found!");

    const record = structuredClone({ ...existing, ...data, id: existing.id });
    this.validate(record);

    this.#arr = this.#arr.map((item) => (item.id === id ? record : item));
    return this.getAll();
  }

  deleter(id) {
    if (!id) {
      throw new Error("Missing ID or source!");
    }
    const idFound = this.#arr.some((item) => item?.id === id);
    if (!idFound) {
      throw new Error("Record not found!");
    }
    this.#arr = this.#arr.filter((item) => item.id !== id);
    return this.getAll();
  }
  findByField = (field, value) => {
    if (!field || value === undefined) {
      throw new Error("Missing field or value!");
    }
    //ie status, pending
    let res = this.#arr.filter((item) => item[field] === value);
    return structuredClone(res);
  };
}
