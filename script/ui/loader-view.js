const loaderElement = document.querySelector("#overall-loader");
const wrapperElement = document.querySelector("#overall-wrapper");
export function toggleLoader(show) {
  if (show) {
    loaderElement.classList.remove("hide");
    wrapperElement.classList.add("hide");
  } else {
    loaderElement.classList.add("hide");
    wrapperElement.classList.remove("hide");
  }
}
