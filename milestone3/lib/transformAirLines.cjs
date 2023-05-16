let fs = require("fs");
let crashes = JSON.parse(fs.readFileSync("..\\public\\data\\final_all.json"));
console.log(crashes.length);
let crashesPerAirlinePerState = {
  Delta: {},
  "American Airlines": {},
  United: {},
  //Southwest: {},
};
crashesPerAirlinePerState = crashes.reduce((crashes, crash) => {
  const state = crash["State"];
  if (!crash["Air.carrier"]) {
    return crashes;
  }

  if (crash["Air.carrier"].includes("Delta")) {
    if (!crashes["Delta"][state]) {
      crashes["Delta"][state] = 1;
    } else {
      crashes["Delta"][state]++;
    }
  }

  if (crash["Air.carrier"].includes("American Airlines")) {
    if (!crashes["American Airlines"][state]) {
      crashes["American Airlines"][state] = 1;
    } else {
      crashes["American Airlines"][state]++;
    }
  }

  if (crash["Air.carrier"].includes("United")) {
    if (!crashes["United"][state]) {
      crashes["United"][state] = 1;
    } else {
      crashes["United"][state]++;
    }
  }

  // if (
  //   crash["Air.carrier"].includes("Southwest Airlines") &&
  //   !crash["Air.carrier"].includes("Pacific Southwest Airlines")
  // ) {
  //   if (!crashes["Southwest"][state]) {
  //     crashes["Southwest"][state] = 1;
  //   } else {
  //     crashes["Southwest"][state]++;
  //   }
  // }

  return crashes;
}, crashesPerAirlinePerState);

let json = JSON.stringify(crashesPerAirlinePerState);
fs.writeFile(
  "..\\public\\data\\final_crashes_per_airline.json",
  json,
  "utf-8",
  function (err) {
    if (err) {
      console.log(
        "An error occured while writing JSON to file: " +
          "..\\public\\data\\final_crashes_per_airline.json"
      );
      return console.log(err);
    }

    console.log("JSON file has been saved.");
  }
);
