import * as d3 from "d3";
import * as topojson from "topojson";
import drawUSA from "./usaMap";

const MAP_SCALE = 800;
const STATE_CODE_TO_NAME = {
  AL: "Alabama",
  AK: "Alaska",
  AS: "American Samoa",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District Of Columbia",
  FM: "Federated States Of Micronesia",
  FL: "Florida",
  GA: "Georgia",
  GU: "Guam",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MH: "Marshall Islands",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  MP: "Northern Mariana Islands",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PW: "Palau",
  PA: "Pennsylvania",
  PR: "Puerto Rico",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VI: "Virgin Islands",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

function initializeStateCenters(states) {
  const path = d3.geoPath();
  states.features = states.features.map((state) => {
    state.properties.center = path.centroid(state);
    return state;
  });
}

export default async function drawAirlineMap(data, us) {
  const svg = d3.select("#airline");
  const width = +svg.attr("width");
  const height = +svg.attr("height");

  const projection = d3
    .geoAlbersUsa()
    .scale(MAP_SCALE)
    .translate([width / 2, height / 2]);

  drawUSA(svg, projection, us);
  const states = topojson.feature(us, us.objects.states);
  initializeStateCenters(states);
  const statesCenterMap = states.features.reduce((map, state) => {
    return {
      ...map,
      [state.properties.name.toLowerCase()]: state.properties.center,
    };
  }, {});

  const totalCrashesPerAirline = Object.keys(data).reduce(
    (maxCrashes, airline) => {
      maxCrashes[airline] = Object.values(data[airline]).reduce(
        (count, crashesInState) => count + crashesInState,
        0
      );
      return maxCrashes;
    },
    {}
  );

  const maxCrashes = d3.max(Object.values(totalCrashesPerAirline));

  let lastRectPositionX = 0;
  Object.keys(data).forEach((airline, i) => {
    const amplifier = 1.4;
    const width = amplifier * totalCrashesPerAirline[airline];

    const height = 40;
    const positionX = 20 + lastRectPositionX + (i + 1) * 20;
    lastRectPositionX += width;

    const positionY = 80;
    const g = svg
      .append("g")
      .attr("transform", `translate(${positionX}, ${positionY})`);

    g.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "blue");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${width / 2}, ${height / 2})`)
      .attr("fill", "#888")
      .attr("dy", "0.35em")
      .attr("x", 0)
      .attr("y", 0)
      .text(airline);
    console.log(statesCenterMap);
    let lastLinkX = positionX;
    const dataForLines = Object.keys(data[airline])
      .filter((state) => state in STATE_CODE_TO_NAME)
      .map((state) => {
        let link = {
          line: {
            source: [lastLinkX, height + positionY],
            target: projection(
              statesCenterMap[STATE_CODE_TO_NAME[state].toLowerCase()]
            ),
          },
          width: data[airline][state] * amplifier,
        };
        lastLinkX += link.width;

        return link;
      })
      .filter((link) => link.line.target);
    console.log(dataForLines);

    const links = svg.append("g");
    const line = d3.line();
    let d = dataForLines[0];
    console.log(line([d.line.source, d.line.target]));

    svg
      .selectAll("line")
      .data(dataForLines)
      .join("line")
      .attr("x1", (d) => d.line.source[0])
      .attr("x2", (d) => d.line.target[0])
      .attr("y1", (d) => d.line.source[1])
      .attr("y2", (d) => d.line.target[1])
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", (d) => d.width);
  });
}
