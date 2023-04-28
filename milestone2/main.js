import drawBubbleMap from "./charts/bubbleMap";
import "@picocss/pico/css/pico.min.css";
import "./assets/css/map.css";
import loadData from "./lib/loadData";
import "./lib/doubleSlider";
import bootstrapYearDoubleSlider from "./lib/doubleSlider";

async function initializeDocument() {
  let data = await loadData();
  data = data.filter((c) => !!c["Event.Year"]);
  let updateMap = await drawBubbleMap(
    data.filter((crash) => crash["Event.Year"] == "2008")
  );
  const currentYearSpan = document.getElementById("current-year");

  bootstrapYearDoubleSlider(
    ([min, max]) => {
      currentYearSpan.innerText = `${min} - ${max}`;
    },
    ([min, max]) => {
      updateMap(
        data.filter(
          (crash) => crash["Event.Year"] >= min && crash["Event.Year"] <= max
        )
      );
    }
  );
}

window.addEventListener("DOMContentLoaded", initializeDocument);
