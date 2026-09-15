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
    this.#arr = [...this.#arr, { ...data, id }];

    return this.#arr;
  }

  getById(id) {
    if (!id) {
      throw new Error("Missing ID!");
    }
    return this.#arr.find((item) => item.id === id) ?? null;
  }

  updator(data, id) {
    if (!id || !data) {
      throw new Error("Missing ID or source data!");
    }
    this.#arr = this.#arr.map((item) =>
      item.id === id ? { ...item, ...data, id: item.id } : item,
    );

    return this.#arr;
  }

  deleter(id) {
    if (!id) {
      throw new Error("Missing ID or source!");
    }
    this.#arr = this.#arr.filter((item) => item.id !== id);
    return this.#arr;
  }
  findByField = (field, value) => {
    if (!field || !value) {
      throw new Error("Missing field or value!");
    }
    //ie status, pending
    return this.#arr.filter((item) => item[field] === value) ?? null;
  };
}
