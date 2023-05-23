import drawBubbleMap from "./charts/bubbleMap";
import "@picocss/pico/css/pico.min.css";
import "./assets/css/map.css";
import "./assets/css/ring.css";
import "./assets/css/layout.css";
import "./assets/css/loader.css";
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
      updateMap(
        dataLatLon
          .filter(
            (crash) => crash["Event.Year"] >= min && crash["Event.Year"] <= max
          )
          .filter((crash) =>
            phaseSelect.value === "Any"
              ? true
              : (crash["Flight.phase"] ?? [""]).includes(
                  phaseSelect.value.toLowerCase()
                )
          )
      );
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
    updateMap(
      dataLatLon
        .filter(
          (crash) => crash["Event.Year"] >= min && crash["Event.Year"] <= max
        )
        .filter((crash) =>
          event.target.value === "Any"
            ? true
            : (crash["Flight.phase"] ?? [""]).includes(
                event.target.value.toLowerCase()
              )
        )
    );
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

  const updateAirlineMap = drawAirlineMap(
    data[defaultAirline],
    us,
    defaultAirline,
    () => removeLoader("airline")
  );
  airlineSelect.addEventListener("change", (event) =>
    updateAirlineMap(data[event.target.value], event.target.value)
  );
}

async function initializeBars(data) {
  const crashButton = document.getElementById("crash-count");
  const deathButton = document.getElementById("death-toll");
  const manuSelect = document.getElementById("manu-select");

  const btn = document.getElementById("start-bars");
  let defaultManu = "";
  ["Piper", "Cessna", "Boeing", "Airbus", "Beech"].forEach((manu, i) => {
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
  bootstrapBars(crashesPerModel, () => removeLoader("bars"));

  let restart = (_) => {
    const crashesPerModel = getCrashesPerModel(
      data,
      manuSelect.value,
      crashButton.checked
    );
    bootstrapBars(crashesPerModel, () => {
      document.getElementById("bars").remove();
      const newBars = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      newBars.setAttribute("id", "bars");
      newBars.setAttribute("width", "640");
      newBars.setAttribute("height", "740");
      newBars.setAttribute("viewbox", "0 0 640 740");
      document.getElementById("bars-container").appendChild(newBars);
    });
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
}

window.addEventListener("DOMContentLoaded", initializeDocument);
