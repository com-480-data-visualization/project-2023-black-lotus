import drawBubbleMap from "./charts/bubbleMap";
import "@picocss/pico/css/pico.min.css";
import "./assets/css/map.css";
import "./assets/css/ring.css";
import "./assets/css/layout.css";
import {
  loadDataLatLon,
  getCrashesPerMonth,
  flattenCrashesPerMonth,
  loadAllData,
  getUSTopology,
  getCrashesPerAirlinePerState,
} from "./lib/loadData";
import "./lib/doubleSlider";
import bootstrapYearDoubleSlider from "./lib/doubleSlider";
import bootstrapSpiral from "./charts/spiral";
import drawAirlineMap from "./charts/airlines";

async function initializeBubbleMap(us) {
  let dataLatLon = await loadDataLatLon();
  dataLatLon = dataLatLon.filter((c) => !!c["Event.Year"]);

  const leftYear = 2001;
  const rightYear = 2022;
  const updateMap = await drawBubbleMap(
    dataLatLon.filter(
      (crash) =>
        +crash["Event.Year"] >= leftYear && +crash["Event.Year"] <= rightYear
    ),
    us
  );
  bootstrapYearDoubleSlider(
    leftYear,
    rightYear,
    ([min, max]) => {
      currentYearSpan.innerText = `${min} - ${max}`;
    },
    ([min, max]) => {
      updateMap(
        dataLatLon.filter(
          (crash) => crash["Event.Year"] >= min && crash["Event.Year"] <= max
        )
      );
    }
  );

  const currentYearSpan = document.getElementById("current-year");
}

async function initializeSpiral(data) {
  const flatCrashesPerMonth = flattenCrashesPerMonth(getCrashesPerMonth(data));
  bootstrapSpiral(flatCrashesPerMonth);
}

async function initializeAirlineMap(us) {
  const data = await getCrashesPerAirlinePerState();
  await drawAirlineMap(data, us);
}

async function initializeDocument() {
  const us = await getUSTopology();
  initializeBubbleMap(us);
  loadAllData().then((data) => {
    initializeSpiral(data);
  });
  initializeAirlineMap(us);
}

window.addEventListener("DOMContentLoaded", initializeDocument);
