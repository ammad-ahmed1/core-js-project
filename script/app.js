const custBtn = document.querySelector("#sider-customer-btn");
const invBtn = document.querySelector("#sider-invoices-btn");
const ordBtn = document.querySelector("#sider-orders-btn");

const sections = {
  invoices: document.querySelector("#invoices"),
  customers: document.querySelector("#customers"),
  orders: document.querySelector("#orders"),
};

function sectionNavigation(forSection) {
  if (forSection !== "overview" && !sections[forSection]) {
    console.log("Page not found!");
    return;
  }

  Object.entries(sections).forEach(([name, section]) => {
    const isSelected = name === forSection;

    section.classList.toggle("active", isSelected);
    section.classList.toggle("inactive", !isSelected);
  });
}

custBtn.addEventListener("click", () =>
  sectionNavigation(custBtn.dataset.section),
);
invBtn.addEventListener("click", () =>
  sectionNavigation(invBtn.dataset.section),
);
ordBtn.addEventListener("click", () =>
  sectionNavigation(ordBtn.dataset.section),
);
