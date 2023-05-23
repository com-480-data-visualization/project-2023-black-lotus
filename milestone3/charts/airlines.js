import * as d3 from "d3";
import * as topojson from "topojson";
import drawUSA from "./usaMap";
import "../assets/css/airline.css";

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

function updateAirlineMap(data, airline, svg, projection, statesCenterMap) {
  const width = +svg.attr("width");
  const amplifier = 2;
  const pad = 0;

  const rectHeight = 10;
  let rectWidth = Object.values(data).reduce(
    (sum, crashes) => sum + crashes * amplifier,
    0
  );
  const positionX = width / 2 - rectWidth / 2;
  const positionY = 80;

  const targets = Object.keys(data)
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
    const width = data[state] * amplifier;
    const sourceX = lastLinkX + width / 2;
    const sourceY = rectHeight + positionY;

    const indexOfNextTarget = targets.reduce(
      ({ minK, i }, { target, state }, index) => {
        const k =
          (lastLinkX + (data[state] * amplifier) / 2 - target[0]) /
          (sourceY - target[1]);
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
        source: [
          lastLinkX + (data[targets[indexOfNextTarget].state] * amplifier) / 2,
          sourceY,
        ],
        target: targets[indexOfNextTarget].target,
      },
      width: data[targets[indexOfNextTarget].state],
      state: STATE_CODE_TO_NAME[targets[indexOfNextTarget].state].toLowerCase(),
    };
    lastLinkX += link.width * amplifier;
    return link;
  });

  const curve = d3.linkVertical();
  svg
    .selectAll(".link")
    .data(dataForLines)
    .join("path")
    .transition()
    .attr("class", "link")
    .attr("data-state", (d) => d.state)
    .attr("d", (d) => curve(d.line))
    .attr("stroke-width", (d) => d.width * (amplifier - pad));

  const g = svg
    .selectAll(".airline-rect")
    .data([airline])
    .join("g")
    .attr("class", "airline-rect")
    .attr("transform", `translate(${positionX}, ${positionY})`);

  rectWidth = dataForLines.reduce(
    (width, line) => width + line.width * amplifier,
    0
  );
  g.selectAll("rect")
    .data([airline])
    .join("rect")
    .transition()
    .attr("x", 0)
    .attr("y", 0)
    .attr("class", "airline-rect")
    .attr("width", rectWidth)
    .attr("height", rectHeight);

  g.selectAll("text")
    .data([airline])
    .join("text")
    .transition()
    .attr("class", "airline-text")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${rectWidth / 2}, -${(rectHeight / 2) * 3})`)
    .attr("dy", "0.35em")
    .attr("x", 0)
    .attr("y", 0)
    .text(airline);
}

export default function drawAirlineMap(data, us, airline, cleanup) {
  const svg = d3.select("#airline");
  const width = +svg.attr("width");
  const height = +svg.attr("height");

  //svg.selectAll("*").remove();

  const projection = d3
    .geoAlbersUsa()
    .scale(MAP_SCALE)
    .translate([width / 2, height / 2]);

  cleanup();
  drawUSA(
    svg,
    projection,
    us,
    false,
    (event) => {
      const links = svg.selectAll(".link");
      const targetLink = Array.from(links._groups[0]).find((n) => {
        return (
          n.getAttribute("data-state") ==
          event.target.getAttribute("data-state")
        );
      });
      if (targetLink) {
        targetLink.classList.add("active");
      }
    },
    (event) => {
      const links = svg.selectAll(".link");
      const targetLink = Array.from(links._groups[0]).find((n) => {
        return (
          n.getAttribute("data-state") ==
          event.target.getAttribute("data-state")
        );
      });
      if (targetLink) {
        targetLink.classList.remove("active");
      }
    }
  );
  const states = topojson.feature(us, us.objects.states);
  initializeStateCenters(states);
  const statesCenterMap = states.features.reduce((map, state) => {
    return {
      ...map,
      [state.properties.name.toLowerCase()]: state.properties.center,
    };
  }, {});

  updateAirlineMap(data, airline, svg, projection, statesCenterMap);

  return (data, airline) => {
    updateAirlineMap(data, airline, svg, projection, statesCenterMap);
  };
}
