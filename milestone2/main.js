import drawBubbleMap from "./charts/bubbleMap";
import "@picocss/pico/css/pico.min.css";
import "./assets/css/map.css";
import loadData from "./lib/loadData";
import "./lib/doubleSlider";
import bootstrapYearDoubleSlider from "./lib/doubleSlider";

async function initializeDocument() {
  let data = await loadData();
  data = data.filter((c) => !!c["Publication.Date"]);
  let updateMap = await drawBubbleMap(
    data.filter((crash) => crash["Publication.Date"].slice(6) == "2008")
  );
  const currentYearSpan = document.getElementById("current-year");

  bootstrapYearDoubleSlider(
    ([min, max]) => {
      currentYearSpan.innerText = `${min} - ${max}`;
    },
    ([min, max]) => {
      updateMap(
        data.filter(
          (crash) =>
            crash["Publication.Date"].slice(6) >= min &&
            crash["Publication.Date"].slice(6) <= max
        )
      );
    }
  );
}

window.addEventListener("DOMContentLoaded", initializeDocument);
