import * as d3 from "d3";
import * as topojson from "topojson";
import drawUSA from "./usaMap";

const MAP_SCALE = 800;
const MAX_BUBBLE_RADIUS = 20;
const TRANSITION_DURATION = 1000;

async function updateMap(svg, projection, counties) {
  const domain = [
    0,
    d3.max(counties.features.map((f) => f.properties.crashCount)),
  ];
  const radius = d3.scaleSqrt(domain, [0, MAX_BUBBLE_RADIUS]);
  const circles = svg.selectAll("circle").data(counties.features);

  circles
    .enter()
    .append("circle")
    .classed("bubble", true)
    .attr("transform", (c) => `translate(${projection(c.properties.center)})`)
    .transition()
    .duration(TRANSITION_DURATION)
    .attr("r", (c) => radius(c.properties.crashCount));

  circles
    .transition()
    .duration(TRANSITION_DURATION)
    .attr("r", (c) => radius(c.properties.crashCount));
}

function initializeCountyCenters(counties) {
  const path = d3.geoPath();
  counties.features = counties.features.map((county) => {
    county.properties.center = path.centroid(county);
    return county;
  });
}

function updateCounties(counties, data) {
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
}

export default async function drawBubbleMap(data, us) {
  const svg = d3.select("#map");
  const width = +svg.attr("width");
  const height = +svg.attr("height");

  const projection = d3
    .geoAlbersUsa()
    .scale(MAP_SCALE)
    .translate([width / 2, height / 2]);

  drawUSA(svg, projection, us);

  const counties = topojson.feature(us, us.objects.counties);
  initializeCountyCenters(counties);
  updateCounties(counties, data);
  updateMap(svg, projection, counties);

  return (newData) => {
    updateCounties(counties, newData);
    updateMap(svg, projection, counties);
  };
}
