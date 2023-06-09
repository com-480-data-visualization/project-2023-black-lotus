import * as d3 from "d3";
import * as topojson from "topojson";

let scaleVal = 1;
let dx = 0;
let dy = 0;

export function getMapProperties() {
  let mapProperties = {
    dx: dx,
    dy: dy,
    scaleVal: scaleVal,
  };
  return mapProperties;
}

export function drawUSA(
  svg,
  projection,
  us,
  hoverable = false,
  clickable = false,
  onMouseEnter = (event, d) => {},
  onMouseLeave = (event, d) => {},
  onMouseClick = (event, d) => {},
  onMouseDoubleClick = (event, d) => {}
) {
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const path = d3.geoPath().projection(projection);
  const states = topojson.feature(us, us.objects.states);
  const g = svg.append("g");

  const statelines = g
    .selectAll("path")
    .data(states.features)
    .join("path")
    .classed("state-line", true)
    .attr("d", path)
    .attr("data-state", (d) => d.properties.name.toLowerCase());

  if (hoverable) {
    statelines.on("mouseenter", function (event, d) {
      statelines.attr("opacity", 0.5);
      d3.select(this).classed("active", true);
      d3.select(this).attr("opacity", 1);
      onMouseEnter(event, d);
    });
    statelines.on("mouseleave", function (event, d) {
      statelines.attr("opacity", 1);
      statelines.attr("stroke-width", 0.2);
      d3.select(this).classed("active", false);
      onMouseLeave(event, d);
    });
  }

  if (clickable) {
    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .on("zoom", function (event) {
        const { transform } = event;
        g.attr("transform", transform);
        g.attr("stroke-width", 1 / transform.k);
      });
    statelines.on("click", function (event, d) {
      if (d3.select(this).attr("opacity") == 0) return;
      statelines.attr("opacity", 0);
      d3.select(this).attr("opacity", 1);
      const [[x0, y0], [x1, y1]] = path.bounds(d);
      dx = -(x0 + x1) / 2;
      dy = -(y0 + y1) / 2;
      scaleVal = Math.min(
        8,
        0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)
      );
      event.stopPropagation();
      svg
        .transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(scaleVal)
            .translate(dx, dy),
          d3.pointer(event, svg.node())
        );
      onMouseClick(event, d, scaleVal, dx, dy);
    });
    svg.on("dblclick", function (event, d) {
      statelines.attr("opacity", 1);
      dx = 0;
      dy = 0;
      scaleVal = 1;
      svg
        .transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity,
          d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
        );
      onMouseDoubleClick(event, d);
    });
  }

  return g;
}
