import * as d3 from "d3";
import * as topojson from "topojson";

export default function drawUSA(svg, projection, us) {
  let path = d3.geoPath(projection);
  let statemesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b);
  let nation = topojson.feature(us, us.objects.nation);

  //Draw US background
  svg.append("path").datum(nation).classed("state", true).attr("d", path);

  //Draw statelines
  svg.append("path").classed("state-line", true).attr("d", path(statemesh));
}
