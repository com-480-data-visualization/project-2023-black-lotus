import * as d3 from "d3";
import * as topojson from "topojson";

async function drawUSA(svg, projection, us) {
  let path = d3.geoPath(projection);
  let statemesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b);
  let nation = topojson.feature(us, us.objects.nation);

  //Draw US background
  svg.append("path").datum(nation).classed("state", true).attr("d", path);

  //Draw statelines
  svg.append("path").classed("state-line", true).attr("d", path(statemesh));
}

async function updateMap(svg, projection, counties) {
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

  //Bubble Map
  const domain = [
    0,
    d3.max(counties.features.map((f) => f.properties.crashCount)),
  ];
  const radius = d3.scaleSqrt(domain, [0, 20]);
  svg
    .selectAll("circle")
    .data(counties.features)
    .join(
      function (enter) {
        return enter
          .append("circle")
          .classed("bubble", true)
          .attr(
            "transform",
            (c) => `translate(${projection(c.properties.center)})`
          )
          .transition()
          .duration(1000)
          .attr("r", (c) => radius(c.properties.crashCount));
      },
      function (update) {
        return update
          .transition()
          .duration(1000)
          .attr("r", (c) => radius(c.properties.crashCount));
      }
    );
}

function updateCounties(counties, data) {
  const crashesPerCounty = data.reduce((bins, crash) => {
    if (crash.CountyCode in bins) {
      bins[crash.CountyCode] = bins[crash.CountyCode] + 1;
    } else {
      bins[crash.CountyCode] = 0;
    }
    return bins;
  }, {});

  const path = d3.geoPath();
  counties.features = counties.features.map((county) => {
    county.properties.center = path.centroid(county);
    county.properties.crashCount = crashesPerCounty[county.id];
    return county;
  });
}

export default async function drawBubbleMap(data) {
  const svg = d3.select("#map");
  const width = +svg.attr("width");
  const height = +svg.attr("height");

  const projection = d3
    .geoAlbersUsa()
    .scale(800)
    .translate([width / 2, height / 2]);

  const response = await fetch("/data/counties-10m.json");
  const us = await response.json();

  await drawUSA(svg, projection, us);

  const counties = topojson.feature(us, us.objects.counties);
  updateCounties(counties, data);
  updateMap(svg, projection, counties);

  return (newData) => {
    updateCounties(counties, newData);
    updateMap(svg, projection, counties);
  };
}
