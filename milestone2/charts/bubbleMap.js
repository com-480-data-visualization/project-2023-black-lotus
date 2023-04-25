import * as d3 from "d3";
import * as topojson from "topojson";

async function drawUSA(svg, projection, nation, counties, statemesh, data) {
  let path = d3.geoPath(projection);

  //Draw US background
  svg.append("path").datum(nation).attr("fill", "#e0e0e0").attr("d", path);

  //Fill Counties
  // const countyIndexIdMap = d3.map(counties.features, (d) => d.id);
  // const color = d3.scaleSequential(
  //   [0, d3.max(Object.values(data))],
  //   d3.interpolateBlues
  // );
  // svg
  //   .append("g")
  //   .selectAll("path")
  //   .data(counties.features)
  //   .join("path")
  //   .attr("fill", (d, i) => color(data[countyIndexIdMap[i]]))
  //   .attr("d", path);

  //Draw statelines
  svg
    .append("path")
    .attr("pointer-events", "none")
    .attr("fill", "none")
    .attr("stroke", "gray")
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("d", path(statemesh));

  //Bubble Map
  const domain = [
    0,
    d3.max(counties.features.map((f) => f.properties.crashCount)),
  ];
  const radius = d3.scaleSqrt(domain, [0, 20]);
  svg
    .append("g")
    .attr("fill", "brown")
    .attr("fill-opacity", 0.5)
    .attr("stroke", "white")
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.8)
    .selectAll("circle")
    .data(counties.features)
    .join("circle")
    .attr("transform", (c) => `translate(${projection(c.properties.center)})`)
    .attr("r", (c) => radius(c.properties.crashCount));
}

export default async function drawBubbleMap() {
  let svg = d3.select("#map");
  let width = +svg.attr("width");
  let height = +svg.attr("height");

  let projection = d3
    .geoAlbersUsa()
    .scale(800)
    .translate([width / 2, height / 2]);

  let response = await fetch("/data/counties-10m.json");
  let us = await response.json();

  response = await fetch("/data/final_with_counties.json");
  let data = await response.json();

  let crashesPerCounty = data.reduce((bins, crash) => {
    if (crash.CountyCode in bins) {
      bins[crash.CountyCode] = bins[crash.CountyCode] + 1;
    } else {
      bins[crash.CountyCode] = 0;
    }
    return bins;
  }, {});

  let counties = topojson.feature(us, us.objects.counties);
  let path = d3.geoPath();
  counties.features = counties.features.map((county) => {
    county.properties.center = path.centroid(county);
    county.properties.crashCount = crashesPerCounty[county.id];
    return county;
  });
  let statemesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b);
  let nation = topojson.feature(us, us.objects.nation);
  await drawUSA(svg, projection, nation, counties, statemesh, crashesPerCounty);
}
