import { writeFile } from "node:fs/promises";
import { customers, invoices, orders } from "./data/data.js";

const database = { customers, invoices, orders };

await writeFile(
  new URL("./db.json", import.meta.url),
  JSON.stringify(database, null, 2),
);

console.log("db.json generated.");
