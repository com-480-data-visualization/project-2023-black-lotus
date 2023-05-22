export async function loadAllData() {
  const response = await fetch("/data/final_all.json");
  const data = await response.json();

  return data;
}

export async function loadDataLatLon() {
  const response = await fetch("/data/final_with_counties.json");
  const data = await response.json();

  return data;
}

export async function getUSTopology() {
  const response = await fetch("/data/counties-10m.json");
  const us = await response.json();

  return us;
}

export function getCrashesPerMonth(data) {
  const startYear = 1982;

  return data.reduce((crashesPerMonth, crash) => {
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
}

export function getCrashesPerModel(data, make, countCrashes) {
  make = make.toLowerCase();
  const startYear = 1982;
  const endYear = 2022;

  return data
    .filter((crash) => crash["Make"])
    .reduce((crashesPerModel, crash) => {
      const model = crash["Model"];
      const crashYear = Math.max(crash["Event.Year"], startYear);
      const count = countCrashes ? 1 : crash["Total.Fatal.Injuries"] ?? 0;

      if (crash["Make"].toLowerCase() == make && crashYear <= endYear) {
        if (!(model in crashesPerModel)) {
          crashesPerModel[model] = {};
          for (let year = startYear; year <= endYear; year++) {
            crashesPerModel[model][year] = {
              count: 0,
            };
          }
        }

        for (let year = crashYear; year <= endYear; year++) {
          crashesPerModel[model][year].count += count;
        }
      }
      return crashesPerModel;
    }, {});
}

export function flattenCrashesPerMonth(crashesPerMonth) {
  const flatCrashesPerMonth = [];
  Object.keys(crashesPerMonth)
    .sort((a, b) => +a - +b)
    .forEach((year) => {
      flatCrashesPerMonth.push(
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

  return flatCrashesPerMonth;
}

export async function getCrashesPerAirlinePerState() {
  const response = await fetch("/data/final_crashes_per_airline.json");
  const data = await response.json();

  return data;
}
