import "../assets/css/doubleSlider.css";

export default function bootstrapYearDoubleSlider(...callbacks) {
  const range = document.querySelector(".range-selected");
  const rangeInput = document.querySelectorAll(".range-input input");
  const minimumRangeSize = 1;
  const start = 2001;
  rangeInput.forEach((input) => {
    input.addEventListener("input", (event) => {
      let minRange = +rangeInput[0].value;
      let maxRange = +rangeInput[1].value;
      if (maxRange - minRange < minimumRangeSize) {
        if (event.target.className === "min") {
          rangeInput[0].value = maxRange - minimumRangeSize;
          minRange = +rangeInput[0].value;
        } else {
          rangeInput[1].value = minRange + minimumRangeSize;
          maxRange = +rangeInput[1].value;
        }
      }
      range.style.left =
        ((minRange - start) / (rangeInput[0].max - start)) * 100 + "%";
      range.style.right =
        100 - ((maxRange - start) / (rangeInput[1].max - start)) * 100 + "%";
      callbacks.forEach((callback) => {
        callback([minRange, maxRange]);
      });
    });
  });
}
