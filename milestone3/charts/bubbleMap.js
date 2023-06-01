import * as d3 from "d3";
import * as topojson from "topojson";
import drawUSA from "./usaMap";

const MAP_SCALE = 800;
const MAX_BUBBLE_RADIUS = 20;
const TRANSITION_DURATION = 1000;

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
const NAME_TO_STATE_CODE = Object.fromEntries(
  Object.entries(STATE_CODE_TO_NAME).map(([key, value]) => [value, key])
);
const defaultState = "USA";
let clickedState = defaultState;
let scaleVal = 1;
let dx = 0;
let dy = 0;

function filterData(data) {
  const rangeInput = document.querySelectorAll(".range-input input");
  const min = rangeInput[0].value;
  const max = rangeInput[1].value;
  const phaseSelect = document.getElementById("phase-select");

  return data
    .filter((crash) => crash["Event.Year"] >= min && crash["Event.Year"] <= max)
    .filter((crash) =>
      phaseSelect.value === "Any"
        ? true
        : (crash["Flight.phase"] ?? [""]).includes(
            phaseSelect.value.toLowerCase()
          )
    )
    .filter((crash) =>
      clickedState === defaultState ? true : crash["State"] === clickedState
    );
}

function showPopup(projection, d) {
  const svg = d3.select("#map");
  const width = +svg.attr("width");
  const height = +svg.attr("height");

  var mypopup = document.getElementById("popup");
  mypopup.style.display = "block";
  var mypopupTitle = document.getElementById("popup-title");
  mypopupTitle.innerText = d.properties.name; //jel ok?
  mypopupTitle.style.color = "black";
  var mypopupText = document.getElementById("popup-text");

  mypopup.style.width = "auto";

  mypopupTitle.style.fontSize = "16px";
  mypopupText.style.fontSize = "12px";
  mypopupText.style.margin = "0px";
  mypopupTitle.style.margin = "1px";
  let crashCount = d.properties.crashCount;
  if (crashCount) {
    if (crashCount == 11 || crashCount % 10 != 1) {
      mypopupText.innerText = crashCount + " accidents";
    } else {
      mypopupText.innerText = crashCount + " accident";
    }
  } else {
    mypopupText.innerText = "No accidents";
  }
  mypopupText.style.color = "black";

  var mySvg = document.getElementById("map");

  var point = mySvg.createSVGPoint();

  point.x = (projection(d.properties.center)[0] + dx) * scaleVal + width / 2;
  point.y = (projection(d.properties.center)[1] + dy) * scaleVal + height / 2;

  var screenPoint = point.matrixTransform(mySvg.getScreenCTM());

  mypopup.style.left = screenPoint.x + "px";
  mypopup.style.top = screenPoint.y + "px";
}

function hidePopup(d) {
  var mypopup = document.getElementById("popup");
  mypopup.style.display = "none";
}

function addHoveredEffect(d) {
  const circleSvg = d3.select("#map");
  const rectangleSvg = d3.select("#county-data");
  const rectangles = Array.from(rectangleSvg.selectAll("rect")._groups[0]);
  const targetRectangle = rectangles.find((n) => {
    return (
      n.getAttribute("county-name") == d.properties.name &&
      n.getAttribute("county-center") == d.properties.center
    );
  });
  if (targetRectangle) {
    targetRectangle.classList.add("active");
  }

  const circles = Array.from(circleSvg.selectAll("circle")._groups[0]);
  const targetCircle = circles.find((n) => {
    return (
      n.getAttribute("county-name") == d.properties.name &&
      n.getAttribute("county-center") == d.properties.center
    );
  });
  if (targetCircle) {
    targetCircle.classList.add("active");
  }
}

function removeHoveredEffect(d) {
  const circleSvg = d3.select("#map");
  const rectangleSvg = d3.select("#county-data");
  const rectangles = Array.from(rectangleSvg.selectAll("rect")._groups[0]);
  const targetRectangle = rectangles.find((n) => {
    return (
      n.getAttribute("county-name") == d.properties.name &&
      n.getAttribute("county-center") == d.properties.center
    );
  });
  if (targetRectangle) {
    targetRectangle.classList.remove("active");
  }

  const circles = Array.from(circleSvg.selectAll("circle")._groups[0]);
  const targetCircle = circles.find((n) => {
    return (
      n.getAttribute("county-name") == d.properties.name &&
      n.getAttribute("county-center") == d.properties.center
    );
  });
  if (targetCircle) {
    targetCircle.classList.remove("active");
  }
}

async function updateMap(svg, projection, counties) {
  svg.selectAll("circle").classed("hover-bubble", false);
  // var selectedState = document.getElementById("selected-state");
  // if (clickedState === "USA") selectedState.innerText = clickedState;
  // else selectedState.innerText = STATE_CODE_TO_NAME[clickedState];
  const domain = [
    0,
    d3.max(counties.features.map((f) => f.properties.crashCount)),
  ];
  const radius = d3.scaleSqrt(domain, [0, MAX_BUBBLE_RADIUS / scaleVal]);
  const circles = svg.selectAll("circle").data(counties.features);

  circles
    .enter()
    .append("circle")
    .classed("bubble", true)
    .attr("transform", (c) => `translate(${projection(c.properties.center)})`)
    .attr("county-name", (c) => c.properties.name)
    .attr("county-center", (c) => c.properties.center)
    .transition()
    .duration(TRANSITION_DURATION)
    .attr("r", (c) => radius(c.properties.crashCount));

  circles
    .transition()
    .duration(TRANSITION_DURATION)
    .attr("r", (c) => radius(c.properties.crashCount));

  if (clickedState != "USA") {
    const otherSvg = d3.select("#county-data");
    circles
      .classed("hover-bubble", true)
      .on("mouseover", (event, d) => {
        showPopup(projection, d);
        addHoveredEffect(d);
      })
      .on("mouseout", (event, d) => {
        d3.select(this).classed("active", false);
        hidePopup(d);
        removeHoveredEffect(d);
      });
  }
}

function initializeCountyCenters(counties) {
  const path = d3.geoPath();
  counties.features = counties.features.map((county) => {
    county.properties.center = path.centroid(county);
    return county;
  });
}

function updateCounties(projection, counties, data) {
  const crashesPerCounty = data.reduce((bins, crash) => {
    if (crash.CountyCode in bins) {
      bins[crash.CountyCode] = bins[crash.CountyCode] + 1;
    } else {
      bins[crash.CountyCode] = 1;
    }
    return bins;
  }, {});

  counties.features = counties.features.map((county) => {
    county.properties.crashCount = crashesPerCounty[county.id];
    return county;
  });

  let sorted = counties.features
    .filter((county) => county.properties.crashCount)
    .sort((a, b) => {
      return b.properties.crashCount - a.properties.crashCount;
    });

  var selectedState = document.getElementById("selected-state-county");
  const svg = d3.select("#county-data");
  if (clickedState === defaultState) {
    selectedState.innerText = "";
    svg.selectAll("*").remove();
  } else {
    svg.selectAll("*").remove();
    const num = Math.min(sorted.length, 10);
    if (num == 0) {
      selectedState.innerText =
        "No county data for " + STATE_CODE_TO_NAME[clickedState] + ".";
      return;
    }

    selectedState.innerText =
      "County data for " + STATE_CODE_TO_NAME[clickedState] + ":";

    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const space = 10;
    const xOffset = 30;
    const yOffset = 100;
    const maxVal = sorted[0].properties.crashCount;

    const barWidth = (width - xOffset - (num - 1) * space) / num;

    const x = d3
      .scaleLinear()
      .domain([1, num])
      .range([xOffset, width - barWidth - 20]);
    const y = d3
      .scaleLinear()
      .domain([0, maxVal])
      .range([height - yOffset, 50]);

    const yAxisTicks = y.ticks().filter((tick) => Number.isInteger(tick));

    const yAxis = d3
      .axisLeft(y)
      .tickValues(yAxisTicks)
      .tickFormat(d3.format("d"));

    svg
      .append("g")
      .selectAll("rect")
      .data(sorted.slice(0, num))
      .enter()
      .append("rect")
      .classed("county-bar", true)
      .attr("x", 1)
      .attr("transform", function (d, i) {
        console.log(d);
        return "translate(" + x(i + 1) + "," + y(d.properties.crashCount) + ")";
      })
      .attr("width", function (d) {
        return barWidth;
      })
      .attr("height", function (d) {
        return height - yOffset - y(d.properties.crashCount);
      })
      .attr("county-name", (d) => d.properties.name)
      .attr("county-center", (d) => d.properties.center)
      .on("mouseover", (event, d) => {
        showPopup(projection, d);
        addHoveredEffect(d);
      })
      .on("mouseout", (event, d) => {
        hidePopup(d);
        removeHoveredEffect(d);
      });

    svg
      .append("g")
      .attr("transform", "translate(" + xOffset + ",0)")
      .call(yAxis);

    svg
      .append("g")
      .selectAll("text")
      .data(sorted.slice(0, num))
      .enter()
      .append("text")
      .attr("x", (d, i) => x(i + 1))
      .attr("y", (d, i) => height - yOffset / 2)
      .attr("font-size", "0.8rem")
      .attr(
        "transform",
        (d, i) =>
          `rotate(45,${x(i + 1) + barWidth / 2},${height - yOffset / 2})`
      )
      .text((d) => d.properties.name);
  }
}

export default async function drawBubbleMap(data, us, cleanup) {
  const svg = d3.select("#map");
  const width = +svg.attr("width");
  const height = +svg.attr("height");

  const projection = d3
    .geoAlbersUsa()
    .scale(MAP_SCALE)
    .translate([width / 2, height / 2]);

  cleanup();
  const counties = topojson.feature(us, us.objects.counties);
  initializeCountyCenters(counties);
  const g = drawUSA(
    svg,
    projection,
    us,
    false,
    true,
    (event, d) => {},
    (event, d) => {},
    (g, event, d, newScaleVal, newDx, newDy) => {
      scaleVal = newScaleVal;
      dx = newDx;
      dy = newDy;
      console.log(d);
      clickedState = NAME_TO_STATE_CODE[d.properties.name];
      updateCounties(projection, counties, filterData(data));
      updateMap(g, projection, counties);
    },
    (g, event, d) => {
      scaleVal = 1;
      clickedState = defaultState;
      updateCounties(projection, counties, filterData(data));
      updateMap(g, projection, counties);
    }
  );
  updateCounties(projection, counties, data);

  updateMap(g, projection, counties);

  return (newData) => {
    updateCounties(
      projection,
      counties,
      newData.filter((crash) =>
        clickedState === defaultState ? true : crash["State"] === clickedState
      )
    );
    updateMap(g, projection, counties);
  };
}
