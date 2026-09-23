import {
  createReq,
  delReq,
  getReq,
  updateReq,
} from "../api-and-service/service.js";

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
  getAll(module) {
    // this.#arr = await getReq(module);
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

  async creator(module, data) {
    const id = this.generateId();
    const record = structuredClone({ ...data, id });
    this.validate(record);
    const res = await createReq(module, record);
    this.validate(res);
    this.#arr = [...this.#arr, res];

    return this.getAll(module);
  }

  async getById(module, id) {
    if (!id) {
      throw new Error("Missing ID!");
    }
    const param = { id };
    const res = await getReq(module, param);
    // const res = this.#arr.find((item) => item.id === id);
    if (res.length === 0) throw new Error("Record not found!");
    return structuredClone(res);
  }

  async updator(module, data, id) {
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

    const res = await updateReq(module, data, id);
    this.validate(res);
    this.#arr = this.#arr.map((item) => (item.id === id ? res : item));
    return this.getAll(module);
  }

  async deleter(module, id) {
    if (!id) {
      throw new Error("Missing ID or source!");
    }
    const idFound = this.#arr.some((item) => item?.id === id);
    if (!idFound) {
      throw new Error("Record not found!");
    }

    await delReq(module, id);

    this.#arr = this.#arr.filter((item) => item.id !== id);
    return this.getAll(module);
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
