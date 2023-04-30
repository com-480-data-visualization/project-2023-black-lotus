import drawBubbleMap from "./charts/bubbleMap";
import "@picocss/pico/css/pico.min.css";
import "./assets/css/map.css";
import "./assets/css/ring.css";
import { loadDataLatLon, loadAllData } from "./lib/loadData";
import "./lib/doubleSlider";
import bootstrapYearDoubleSlider from "./lib/doubleSlider";
import bootstrapSpiral from "./charts/spiral";

async function initializeDocument() {
  let dataLatLon = await loadDataLatLon();
  dataLatLon = dataLatLon.filter((c) => !!c["Event.Year"]);
  let updateMap = await drawBubbleMap(
    dataLatLon.filter((crash) => crash["Event.Year"] == "2008")
  );
  const currentYearSpan = document.getElementById("current-year");

  bootstrapYearDoubleSlider(
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

  const allData = await loadAllData();
  const startYear = 1982;
  const crashesPerMonth = allData.reduce((crashesPerMonth, crash) => {
    const crashYear = crash["Event.Year"];
    const crashMonth = crash["Event.Month"];
    if (crashYear >= startYear) {
      if (!(crashYear in crashesPerMonth)) {
        crashesPerMonth[crashYear] = {};
      }

      if (crashMonth in crashesPerMonth[crashYear]) {
        crashesPerMonth[crashYear][crashMonth].crashes += 1;
      } else {
        crashesPerMonth[crashYear][crashMonth] = {
          crashes: 1,
        };
      }
    }
    return crashesPerMonth;
  }, {});
  const random = [];
  Object.keys(crashesPerMonth)
    .sort((a, b) => +a - +b)
    .forEach((year) => {
      random.push(
        ...Object.keys(crashesPerMonth[year])
          .sort((a, b) => +a - +b)
          .map((month) => {
            return {
              value: crashesPerMonth[year][month].crashes,
              date: new Date(+year, +month - 1, 1),
            };
          })
      );
    });
  bootstrapSpiral(random);
}

window.addEventListener("DOMContentLoaded", initializeDocument);
