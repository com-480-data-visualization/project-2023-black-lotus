export default function bootstrapYearRange(...callbacks) {
  const yearRangeInput = document.getElementById("year");
  yearRangeInput.addEventListener("input", function (event) {
    let value = event.target.value;
    for (let callback of callbacks) {
      callback(value);
    }
  });
}
