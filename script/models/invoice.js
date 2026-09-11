class Invoice {
  id;
  currency;
  #amount;
  constructor(id, currency, amount) {
    this.id = id;
    this.currency = currency;
    this.amount = amount;
  }
  get amount() {
    return this.#amount;
  }
  set amount(value) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error("Invalid Number!");
    }

    this.#amount = value;
  }
  getSummary() {
    return { id: this.id, currency: this.currency, amount: this.#amount };
  }
  static fromData(data) {
    return new Invoice(data.id, data.currency, data.amount);
  }
}
// Create with 100
const testInvoice = Invoice.fromData({
  id: "INV-005",
  currency: "PKR",
  amount: 100,
});

testInvoice.amount = 10;
testInvoice.amount = 150;

try {
  testInvoice.amount = -10;
} catch (error) {
  console.log(error.message);
}

const summaryCallback = testInvoice.getSummary;
// summaryCallback();
setTimeout(() => {
  const res = testInvoice.getSummary();
//   console.log(res);
}, 100);

// const invoicePrototype = {
//   currency: "PKR",
//   getSummary: function () {
//     return { id: this.id, currency: this.currency };
//   },
// };
// const invoice = Object.create(invoicePrototype);
// const invoice1 = Object.create(invoicePrototype);
// invoice.id = "INV-001";
// invoice.currency = "USD";
// invoice1.id = "INV-002";
// invoice1.currency = "EUR";
// console.log(invoice.id);
// console.log(invoice.currency);
// delete invoice.currency;
// console.log(Object.hasOwn(invoice, "id"));
// console.log(Object.hasOwn(invoice, "currency"));
// console.log(Object.getPrototypeOf(invoice) === invoicePrototype);
// console.log(Object.hasOwn(invoice1, "id"));
// console.log(Object.hasOwn(invoice1, "currency"));
// console.log(Object.getPrototypeOf(invoice1) === invoicePrototype);
// console.log(invoice.getSummary === invoice1.getSummary, ": same method");
// console.log(invoice.currency);
// const summary = invoice.getSummary();
// console.log("Summary:", summary);
// const summary1 = invoice1.getSummary();
// console.log("Summary 1:", summary1);

// function InvoicePrototype (id, currency) {
//   this.id = id;
//   this.currency = currency;
// };

// InvoicePrototype.prototype.getSummary = function () {
//   return { id: this.id, currency: this.currency };
// };

// const invoice2 = new InvoicePrototype("INV-003", "GBP");
// const invoice3 = new InvoicePrototype("INV-004", "GBP");
// const summary2 = invoice2.getSummary();
// const summary3 = invoice3.getSummary;
// console.log("Summary 2:", summary2);
