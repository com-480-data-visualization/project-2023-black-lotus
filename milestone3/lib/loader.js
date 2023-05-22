export function removeLoader(svgId) {
  const barsContainer = document.getElementById(svgId).parentElement;
  const loaders = barsContainer.getElementsByClassName("loader");
  if (loaders.length > 0) {
    barsContainer.removeChild(loaders[0]);
  }
}
