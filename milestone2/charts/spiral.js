import * as d3 from "d3";

export default function bootstrapSpiral(data) {
  const binsPerRing = 40;
  const svg = d3.select("#ring");
  const width = +svg.attr("width");
  const height = +svg.attr("height");

  const rings = Array.from(
    { length: Math.floor(data.length / binsPerRing) },
    () => []
  );

  data = data.map((d, i) => {
    return { value: d.crashCount, index: i };
  });
  const r = d3.min([width, height]) / 2 - 30;

  const radius = d3.scaleLinear().domain([0, data.length]).range([r, 80]);

  const numSpirals = 4;
  const angle = d3
    .scaleLinear()
    .domain([0, data.length])
    .range([0, 2 * numSpirals * Math.PI]);

  const radial = d3
    .lineRadial()
    .angle((d, i) => angle(i))
    .radius((d, i) => radius(i))
    .curve(d3.curveCardinal);

  const spiral = svg
    .append("path")
    .attr("transform", `translate(${width / 2}, ${height / 2})`)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", "4")
    .attr("d", radial(data));

  const maxCrashes = d3.max(data, (d) => d.value);
  var spiralLength = spiral.node().getTotalLength(),
    barWidth = spiralLength / data.length - 1;
  const heightScale = d3.scaleLinear().domain([0, maxCrashes]).range([0, 30]);

  const timeScale = d3.scaleLinear([0, data.length], [0, spiralLength]);
  const color = d3.scaleSequential([0, maxCrashes], d3.interpolateBlues);
  svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`)
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function (d, i) {
      // placement calculations
      var linePer = timeScale(i + 1),
        posOnLine = spiral.node().getPointAtLength(linePer),
        angleOnLine = spiral.node().getPointAtLength(linePer - barWidth / 2);

      d.linePer = linePer; // % distance are on the spiral
      d.x = posOnLine.x; // x postion on the spiral
      d.y = posOnLine.y; // y position on the spiral

      d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180) / Math.PI - 90; //angle at the spiral position

      return d.x;
    })
    .attr("y", function (d) {
      return d.y;
    })
    .attr("width", function (d, i) {
      if (i == 0) {
        return barWidth + 1;
      }
      return barWidth;
    })
    .attr("height", function (d) {
      return heightScale(d.value);
    })
    .style("fill", "steelblue")
    .style("stroke", "none")
    .attr("transform", function (d) {
      return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
    });

  // const maxCrashes = d3.max(data, (d) => d.crashCount);
  // const startHeight = height / 4;
  // const maxRingHeight = 30;
  // const spacing = 0;

  // const scaleX = d3
  //   .scaleBand()
  //   .domain(rings[0].map(({ index: i }) => i))
  //   .range([0, 2 * Math.PI])
  //   .align(0);

  // const color = d3.scaleSequential([0, maxCrashes], d3.interpolateBlues);
  // rings.forEach((ring, index) => {
  //   const scaleY = d3
  //     .scaleRadial()
  //     .domain([0, maxCrashes])
  //     .range([
  //       startHeight + (maxRingHeight + spacing) * index,
  //       startHeight + maxRingHeight * (index + 1) + spacing * index,
  //     ]);
  //   const arc = d3
  //     .arc()
  //     .innerRadius(startHeight + (maxRingHeight + spacing) * index)
  //     .outerRadius((d) => scaleY(d.value))
  //     .startAngle((d) => scaleX(d.index))
  //     .endAngle((d) => scaleX(d.index) + scaleX.bandwidth());

  //   svg
  //     .append("g")
  //     .classed(`ring-${index}`, true)
  //     .attr("transform", `translate(${width / 2}, ${height / 2})`)
  //     .selectAll("path")
  //     .data(ring)
  //     .join("path")
  //     .attr("fill", (d) => color(d.value))
  //     .classed("ring-bin", true)
  //     .attr("d", arc);

  //   //CIRCLE MAX
  //   svg
  //     .append("circle")
  //     .classed(`circle-max`, true)
  //     .attr("r", startHeight + maxRingHeight * (index + 1) + spacing * index)
  //     .attr("cx", width / 2)
  //     .attr("cy", height / 2);
  // });

  // const label = svg
  //   .append("text")
  //   .attr("text-anchor", "middle")
  //   .attr("fill", "#888")
  //   .attr("transform", `translate(${width / 2}, ${height / 2})`)
  //   .style("visibility", "hidden");

  // label
  //   .append("tspan")
  //   .attr("class", "crash-count")
  //   .attr("x", 0)
  //   .attr("y", 0)
  //   .attr("dy", "-0.1em")
  //   .attr("font-size", "3em");

  // label
  //   .append("tspan")
  //   .attr("class", "crash-time")
  //   .attr("x", 0)
  //   .attr("y", 0)
  //   .attr("dy", "1.5em");
  // const paths = svg.selectAll(".ring-bin");
  // paths
  //   .on("mouseleave", () => {
  //     paths.attr("fill-opacity", 1);
  //     label.style("visibility", "hidden");
  //   })
  //   .on("mouseenter", (event, d) => {
  //     paths.attr("fill-opacity", (bin) => (bin.name == d.name ? 1 : 0.3));
  //     label.style("visibility", null).select(".crash-count").text(d.value);
  //     label.select(".crash-time").text(`crashes in ${d.name}`);
  //   });
}
