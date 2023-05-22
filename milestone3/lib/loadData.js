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

export function getCrashesPerModel(data) {
  const earlyYear = 1960;
  const startYear = 1982;
  const endYear = 2022;
  console.log("Loading");
  let cnt = 0;

  return data.reduce((crashesPerModel, crash) => {
    /*if (cnt == 1747) {
      console.log(crash);
    }*/
    if (crash["Make"] === null) {
      return crashesPerModel;
    }
    const make = crash["Make"].toUpperCase();
    const model = crash["Model"];
    const crashYear = crash["Event.Year"];
    const inj = crash["Total.Fatal.Injuries"] ?? 0;
    const modYear = Math.max(crashYear, startYear);
    //console.log(model);
    //return crashesPerModel;
    if (make == "PIPER" && modYear <= endYear && modYear >= startYear) {
      if (!(model in crashesPerModel)) {
        crashesPerModel[model] = {};
        for (let year = startYear; year <= endYear; year++) {
          crashesPerModel[model][year] = {
            crashes: 0,
          };
        }
      }

      for (let year = modYear; year <= endYear; year++) {
        //console.log(modYear);
        crashesPerModel[model][year].crashes += inj;
      }
    }
    cnt += 1;
    /*if (cnt > 1700) {
      console.log(cnt);
    }*/
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
