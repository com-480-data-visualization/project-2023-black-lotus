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

  let lastRectPositionX = 0;
  Object.keys(data).forEach((airline, i) => {
    const amplifier = 1.5;

    const height = 40;
    const positionX = 20 + lastRectPositionX + (i + 1) * 20;
    const positionY = 80;

    const targets = Object.keys(data[airline])
      .filter((state) => state in STATE_CODE_TO_NAME)
      .map((state) => {
        return {
          target: projection(
            statesCenterMap[STATE_CODE_TO_NAME[state].toLowerCase()]
          ),
          state: state,
        };
      })
      .filter(({ state }) => {
        if (
          !state in STATE_CODE_TO_NAME ||
          !STATE_CODE_TO_NAME[state].toLowerCase() in statesCenterMap
        ) {
          console.log(state);
        }
        return (
          state in STATE_CODE_TO_NAME &&
          STATE_CODE_TO_NAME[state].toLowerCase() in statesCenterMap
        );
      })
      .sort((a, b) => {
        return a.target[0] - b.target[0];
      });

    let lastLinkX = positionX;
    const usedTargets = targets.map(() => false);
    const dataForLines = targets.map(({ target, state }) => {
      const width = data[airline][state] * amplifier;
      const sourceX = lastLinkX + width / 2;
      const sourceY = height + positionY;

      const indexOfNextTarget = targets.reduce(
        ({ minK, i }, { target }, index) => {
          const k = (sourceX - target[0]) / (sourceY - target[1]);
          if (k < minK && !usedTargets[index]) {
            minK = k;
            i = index;
          }
          return { minK, i };
        },
        { minK: 10000, i: -1 }
      ).i;

      usedTargets[indexOfNextTarget] = true;

      let link = {
        line: {
          source: [sourceX, sourceY],
          target: targets[indexOfNextTarget].target,
        },
        width: width,
      };
      lastLinkX += link.width;
      return link;
    });

    const links = svg.append("g");

    const curve = d3.linkVertical();
    links
      .selectAll("path")
      .data(dataForLines)
      .join("path")
      .attr("d", (d) => curve(d.line))
      .attr("fill", "none")
      .attr("stroke", "rgba(255,0,0,0.3)")
      .attr("stroke-width", (d) => d.width);

    const g = svg
      .append("g")
      .attr("transform", `translate(${positionX}, ${positionY})`);

    const width = dataForLines.reduce((w, d) => w + d.width, 0);

    g.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "rgba(255,0,0,0.3)");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${width / 2}, ${height / 2})`)
      .attr("fill", "#888")
      .attr("dy", "0.35em")
      .attr("x", 0)
      .attr("y", 0)
      .text(airline);
    lastRectPositionX += width;
  });
}
