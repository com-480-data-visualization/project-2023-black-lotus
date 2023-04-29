import drawBubbleMap from "./charts/bubbleMap";
import "@picocss/pico/css/pico.min.css";
import "./assets/css/map.css";
import "./assets/css/ring.css";
import { loadDataLatLon, loadAllData } from "./lib/loadData";
import "./lib/doubleSlider";
import bootstrapYearDoubleSlider from "./lib/doubleSlider";
import bootstrapRing from "./charts/ring";
import bootstrapSpiral from "./charts/spiral";

function getSeason(month) {
  if (month <= 2) {
    return "Winter";
  }
  if (month >= 3 && month <= 5) {
    return "Spring";
  }

  if (month >= 6 && month <= 8) {
    return "Summer";
  }

  return "Autumn";
}

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
  const startDate = new Date(1982, 12, 22);
  const crashesPerSeason = allData.reduce((crashesPerSeason, crash) => {
    const crashDate = new Date(crash["Event.Date"]);
    const crashSeason = getSeason(+crash["Event.Month"]);
    if (crashDate >= startDate) {
      if (!(crash["Event.Year"] in crashesPerSeason)) {
        crashesPerSeason[crash["Event.Year"]] = {};
      }

      if (crashSeason in crashesPerSeason[crash["Event.Year"]]) {
        crashesPerSeason[crash["Event.Year"]][crashSeason].crashes += 1;
      } else {
        crashesPerSeason[crash["Event.Year"]][crashSeason] = {
          crashes: 1,
        };
      }
    }
    return crashesPerSeason;
  }, {});
  const random = [];
  Object.keys(crashesPerSeason)
    .sort()
    .forEach((year) => {
      random.push(
        ...Object.keys(crashesPerSeason[year])
          .sort()
          .map((season) => {
            return {
              crashCount: crashesPerSeason[year][season].crashes,
              season: season,
              year: +year,
            };
          })
      );
    });
  console.log(random);
  //bootstrapRing(random.reverse());
  bootstrapSpiral(random);
}

window.addEventListener("DOMContentLoaded", initializeDocument);
