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

export async function getCrashesPerMonth() {
  const allData = await loadAllData();
  const startYear = 1982;

  return allData.reduce((crashesPerMonth, crash) => {
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
