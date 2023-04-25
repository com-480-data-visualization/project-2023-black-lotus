let fs = require("fs");
import("@turf/boolean-point-in-polygon").then(
  ({ default: polygonContains }) => {
    import("@turf/helpers").then((turf) => {
      let crashes = JSON.parse(
        fs.readFileSync("..\\public\\data\\final_only_lat_lon.json")
      );
      let us = JSON.parse(
        fs.readFileSync(
          "..\\public\\data\\georef-united-states-of-america-county.geojson"
        )
      );

      let newCrashes = crashes.map((crash) => {
        let point = turf.point([crash.Longitude, crash.Latitude]);
        for (let county of us.features) {
          if (polygonContains(point, county)) {
            crash.CountyCode = county.properties.coty_code[0];
            return crash;
          }
        }
      });
      console.log(crashes.length);
      console.log(newCrashes.length);

      let newCrashesJSON = JSON.stringify(newCrashes);
      fs.writeFile(
        "..\\public\\data\\final_with_counties.json",
        newCrashesJSON,
        "utf-8",
        function (err) {
          if (err) {
            console.log(
              "An error occured while writing JSON to file: " +
                "..\\public\\data\\final_with_counties.json"
            );
            return console.log(err);
          }

          console.log("JSON file has been saved.");
        }
      );
    });
  }
);
