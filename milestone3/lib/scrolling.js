import { debounce } from "./debounce";
import "../assets/css/scroll.css";

function changeCurrentContainer(
  currentContainer,
  scrollBubbles,
  containers,
  newValueGenerator
) {
  scrollBubbles[currentContainer].classList.remove("active");
  currentContainer = newValueGenerator(currentContainer);
  containers[currentContainer].scrollIntoView();
  scrollBubbles[currentContainer].classList.add("active");

  return currentContainer;
}

export function initializeScrolling() {
  let containers = Array.from(
    document.getElementsByClassName("container-full")
  );
  let currentContainer = Math.floor(
    (window.scrollY || document.documentElement.scrollTop) / window.innerHeight
  );

  const scrollBubblesContainer = document.getElementsByClassName(
    "scroll-bubbles-container"
  )[0];

  const scrollBubbles = containers.map((container, index) => {
    let bubble = document.createElement("div");
    bubble.classList.add("scroll-bubble");
    if (index == currentContainer) {
      bubble.classList.add("active");
    }
    scrollBubblesContainer.appendChild(bubble);
    bubble.addEventListener("click", (event) => {
      currentContainer = changeCurrentContainer(
        currentContainer,
        scrollBubbles,
        containers,
        () => index
      );
    });
    return bubble;
  });

  function onWheel(event) {
    event.preventDefault();
    event.stopPropagation();
    currentContainer = changeCurrentContainer(
      currentContainer,
      scrollBubbles,
      containers,
      (containerIndex) => {
        containerIndex =
          event.deltaY > 0 ? containerIndex + 1 : containerIndex - 1;
        if (containerIndex < 0) {
          containerIndex = containers.length - 1;
        } else if (containerIndex >= containers.length) {
          currentContainer = 0;
        }

        return containerIndex;
      }
    );
  }
  window.addEventListener("wheel", debounce(onWheel, 100));
}
