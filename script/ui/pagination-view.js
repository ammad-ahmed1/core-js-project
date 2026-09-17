
export function renderPagination(
  totalItems,
  currentPage = 1,
  itemsPerPage = 25,
  pageStartElement,
  pageEndElement,
  totalCountElement,
  pageNumbersElement,
  previousButton,
  nextButton,
) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  if (pageStartElement) pageStartElement.textContent = start;
  if (pageEndElement) pageEndElement.textContent = end;
  if (totalCountElement) totalCountElement.textContent = totalItems;

  pageNumbersElement.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.dataset.page = i;
    btn.className = i === currentPage ? "btn-page-num active" : "btn-page-num";
    pageNumbersElement.appendChild(btn);
  }

  previousButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage >= totalPages;
}
