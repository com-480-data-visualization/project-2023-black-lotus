import "../assets/css/doubleSlider.css";

export default function bootstrapYearDoubleSlider(
  defaultLeftValue,
  defaultRightValue,
  ...callbacks
) {
  const range = document.querySelector(".range-selected");
  const rangeInput = document.querySelectorAll(".range-input input");
  rangeInput[0].value = defaultLeftValue;
  rangeInput[1].value = defaultRightValue;
  const minimumRangeSize = 1;
  const start = +rangeInput[0].min;
  rangeInput.forEach((input) => {
    input.addEventListener("input", (event) => {
      let leftValue = +rangeInput[0].value;
      let rightValue = +rangeInput[1].value;
      if (rightValue - leftValue < minimumRangeSize) {
        if (event.target.className === "min") {
          rangeInput[0].value = rightValue - minimumRangeSize;
          leftValue = +rangeInput[0].value;
        } else {
          rangeInput[1].value = leftValue + minimumRangeSize;
          rightValue = +rangeInput[1].value;
        }
      }
      range.style.left =
        ((leftValue - start) / (rangeInput[0].max - start)) * 100 + "%";
      range.style.right =
        100 - ((rightValue - start) / (rangeInput[1].max - start)) * 100 + "%";
      callbacks.forEach((callback) => {
        callback([leftValue, rightValue]);
      });
    });
  });
}
