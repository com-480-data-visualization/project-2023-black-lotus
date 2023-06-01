import { debounce } from "./debounce";

export function initializeScrolling() {
  let containers = Array.from(
    document.getElementsByClassName("container-full")
  );
  let currentContainer = Math.floor(
    (window.scrollY || document.documentElement.scrollTop) / window.innerHeight
  );
  console.log(currentContainer);

  function onWheel(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log(event);
    currentContainer =
      event.deltaY > 0 ? currentContainer + 1 : currentContainer - 1;
    if (currentContainer < 0) {
      currentContainer = containers.length - 1;
    } else if (currentContainer >= containers.length) {
      currentContainer = 0;
    }
    containers[currentContainer].scrollIntoView();
  }
  window.addEventListener("wheel", debounce(onWheel, 100));
}
