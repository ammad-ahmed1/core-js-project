export function toggleModal(modalElement, show = null) {
  if (!modalElement) {
    throw new Error("Modal element is required.");
  }

  const shouldOpen =
    typeof show === "boolean"
      ? show
      : !modalElement.classList.contains("active");

  modalElement.classList.toggle("active", shouldOpen);
  modalElement.classList.toggle("inactive", !shouldOpen);
}
