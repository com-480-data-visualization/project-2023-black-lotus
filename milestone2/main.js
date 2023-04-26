import drawBubbleMap from "./charts/bubbleMap";
import "@picocss/pico/css/pico.min.css";
import "./assets/css/main.css";
import bootstrapYearRange from "./lib/yearRange";
import loadData from "./lib/loadData";

async function initializeDocument() {
  let data = await loadData();
  data = data.filter((c) => !!c["Publication.Date"]);
  let updateMap = await drawBubbleMap(
    data.filter((crash) => crash["Publication.Date"].slice(6) == "2008")
  );
  const currentYearSpan = document.getElementById("current-year");
  bootstrapYearRange(
    (value) => {
      currentYearSpan.innerText = value;
    },
    (value) => {
      updateMap(
        data.filter((crash) => crash["Publication.Date"].slice(6) == value)
      );
    }
  );
}

window.addEventListener("DOMContentLoaded", initializeDocument);
