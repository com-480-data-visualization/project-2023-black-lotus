import drawBubbleMap from "./charts/bubbleMap";
import "@picocss/pico/css/pico.min.css";
import "./assets/css/map.css";
import "./assets/css/ring.css";
import "./assets/css/layout.css";
import "./assets/css/loader.css";
import "./assets/css/team.css";
import * as d3 from "d3";
import {
  loadDataLatLon,
  getCrashesPerMonth,
  getCrashesPerModel,
  flattenCrashesPerMonth,
  loadAllData,
  getUSTopology,
  getCrashesPerAirlinePerState,
} from "./lib/loadData";
import "./lib/doubleSlider";
import bootstrapYearDoubleSlider from "./lib/doubleSlider";
import bootstrapSpiral from "./charts/spiral";
import bootstrapBars from "./charts/bars";
import drawAirlineMap from "./charts/airlines";
import { removeLoader } from "./lib/loader";
import { initializeScrolling } from "./lib/scrolling";

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
    us,
    () => removeLoader("map")
  );

  const currentYearSpan = document.getElementById("current-year");

  const phaseSelect = document.getElementById("phase-select");
  bootstrapYearDoubleSlider(
    leftYear,
    rightYear,
    ([min, max]) => {
      currentYearSpan.innerText = `${min} - ${max}`;
    },
    ([min, max]) => {
      updateMap(dataLatLon);
    }
  );
  let defaultPhase = "";
  ["Any", "Takeoff", "Cruise", "Landing", "Taxi"].forEach((phase, i) => {
    let phaseOption = document.createElement("option");
    if (i == 0) {
      phaseOption.selected = true;
      defaultPhase = phase;
    }
    phaseOption.value = phase;
    phaseOption.innerHTML = phase;
    phaseSelect.appendChild(phaseOption);
  });

  phaseSelect.addEventListener("change", (event) => {
    const rangeInput = document.querySelectorAll(".range-input input");
    const min = document.querySelectorAll(".range-input input")[0].value;
    const max = document.querySelectorAll(".range-input input")[1].value;
    updateMap(dataLatLon);
  });
}

async function initializeSpiral(data) {
  const flatCrashesPerMonth = flattenCrashesPerMonth(getCrashesPerMonth(data));
  bootstrapSpiral(flatCrashesPerMonth, () => removeLoader("ring"));
}

async function initializeAirlineMap(us) {
  const data = await getCrashesPerAirlinePerState();

  console.log(data);
  const airlineSelect = document.getElementById("airline-select");
  let defaultAirline = "";
  Object.keys(data).forEach((airline, i) => {
    let airlineOption = document.createElement("option");
    if (i == 0) {
      airlineOption.selected = true;
      defaultAirline = airline;
    }
    airlineOption.value = airline;
    airlineOption.innerHTML = airline;
    airlineSelect.appendChild(airlineOption);
  });

  const updateAirlineMap = drawAirlineMap(data, us, defaultAirline, () =>
    removeLoader("airline")
  );
  airlineSelect.addEventListener("change", (event) =>
    updateAirlineMap(data[event.target.value], event.target.value)
  );
}

function removeBars() {
  const bars = document.getElementById("bars");
  const id = bars.getAttribute("id");
  const width = bars.getAttribute("width");
  const height = bars.getAttribute("height");
  bars.remove();
  const newBars = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  newBars.setAttribute("id", id);
  newBars.setAttribute("width", width);
  newBars.setAttribute("height", height);
  newBars.setAttribute("viewbox", `0 0 ${width} ${height}`);
  document.getElementById("bars-container").appendChild(newBars);
}

async function initializeBars(data) {
  const crashButton = document.getElementById("crash-count");
  const deathButton = document.getElementById("death-toll");
  const manuSelect = document.getElementById("manu-select");

  const btn = document.getElementById("start-bars");
  let defaultManu = "";
  ["Piper", "Cessna", "Boeing", "Beech"].forEach((manu, i) => {
    let manuOption = document.createElement("option");
    if (i == 0) {
      manuOption.selected = true;
      defaultManu = manu;
    }
    manuOption.value = manu;
    manuOption.innerHTML = manu;
    manuSelect.appendChild(manuOption);
  });

  const crashesPerModel = getCrashesPerModel(
    data,
    manuSelect.value,
    crashButton.checked
  );
  bootstrapBars(crashesPerModel, () => {
    removeLoader("bars");
    removeBars();
  });

  let restart = (_) => {
    const crashesPerModel = getCrashesPerModel(
      data,
      manuSelect.value,
      crashButton.checked
    );
    bootstrapBars(crashesPerModel, removeBars);
  };

  btn.addEventListener("click", restart);
  manuSelect.addEventListener("change", restart);
  crashButton.addEventListener("change", restart);
  deathButton.addEventListener("change", restart);
}

async function initializeDocument() {
  const us = await getUSTopology();
  initializeBubbleMap(us);
  loadAllData().then((data) => {
    initializeSpiral(data);
  });
  initializeAirlineMap(us);
  loadAllData().then((data) => {
    initializeBars(data);
  });
  initializeScrolling();
}

window.addEventListener("DOMContentLoaded", initializeDocument);
