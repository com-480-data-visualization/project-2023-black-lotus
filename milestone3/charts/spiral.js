import * as d3 from "d3";

function drawSpiral(data, svg, width, height) {
  const maxRadius = d3.min([width, height]) / 2 - 50;

  const radius = d3
    .scaleLinear()
    .domain([0, data.length])
    .range([maxRadius, 100]);

  const numSpirals = 4;
  const angle = d3
    .scaleLinear()
    .domain([0, data.length])
    .range([0, 2 * (numSpirals + 1 / 10 + 1 / 120) * Math.PI]);

  const radial = d3
    .lineRadial()
    .angle((d, i) => angle(i))
    .radius((d, i) => radius(i))
    .curve(d3.curveCardinal);

  const spiral = svg
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "none")
    .attr("stroke-width", "0.5")
    .attr("d", radial(data));

  const maxCrashes = d3.max(data, (d) => d.value);
  const spiralLength = spiral.node().getTotalLength();
  const barWidth = spiralLength / data.length - 1;
  const heightScale = d3.scaleLinear().domain([0, maxCrashes]).range([0, 50]);

  const years = [...new Set(data.map((d) => d.date.getFullYear()))];
  const timeScale = d3.scaleLinear([0, data.length], [0, spiralLength]);
  const color = d3.scaleSequential(
    [d3.min(years), d3.max(years)],
    d3.interpolateRainbow
  );

  svg
    .append("g")
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "ring-bar")
    .attr("x", function (d, i) {
      const linePer = timeScale(i + 1),
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
      return barWidth;
    })
    .attr("rx", 2)
    .attr("ry", 2)
    .style("fill", (d) => color(d.date.getFullYear()))
    .style("stroke", "none")
    .attr("transform", function (d) {
      return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
    })
    .transition()
    .attr("height", function (d) {
      return heightScale(d.value);
    })
    .delay((d, i) => i * 10);

  return svg.selectAll(".ring-bar");
}

function drawLabel(svg) {
  const label = svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("fill", "#888");

  label
    .append("tspan")
    .attr("class", "crash-count")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "-0.5em")
    .attr("font-size", "3em");

  label
    .append("tspan")
    .attr("class", "crash-text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "0.85em")
    .attr("font-size", "1.5em");

  label
    .append("tspan")
    .attr("class", "crash-time")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "2.25em");

  return label;
}

function drawAxisTicks(svg, data, spacingFromDots = 10) {
  const offset = 20;
  const axisTicks = svg
    .selectAll(".tick")
    .data(data.filter((d) => d.date.getMonth() == 0))
    .join("g")
    .attr("class", "tick")
    .attr("fill", "var(--color)")
    .attr("font-size", "0.8rem")
    .call((g) =>
      g
        .append("line")
        .attr("stroke", "var(--color)")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "1,1")
        .attr("x1", (d) => d.x + spacingFromDots)
        .attr("y1", (d) => d.y)
        .attr("x2", (d) => d.x + spacingFromDots)
        .attr("y2", (d) => d.y - offset)
        .attr("transform", (d) => `rotate(${d.a},${d.x},${d.y})`)
    );

  axisTicks
    .append("text")
    .attr("dy", "1em")
    .attr("x", (d, i) => d.x - spacingFromDots / 2)
    .attr("y", (d, i) => d.y)
    .attr("transform", (d, i) => `rotate(${d.a + 180},${d.x},${d.y})`)
    .text((d) => "'" + `${d.date.getFullYear()}`.slice(2));
}

function addSpiralHoverEffects(bars, label) {
  bars
    .on("mouseleave", () => {
      bars.attr("fill-opacity", 1);
      label.style("fill-opacity", 0);
    })
    .on("mouseenter", (event, d) => {
      bars.attr("fill-opacity", (bin) => (bin.date == d.date ? 1 : 0.3));
      label.style("fill-opacity", 1).select(".crash-count").text(d.value);
      label.select(".crash-text").text("crashes in");
      label.select(".crash-time").text(
        `${d.date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        })}`
      );
    });
}

export default function bootstrapSpiral(data, cleanup) {
  const svg = d3.select("#ring");
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const label = drawLabel(g);
  const bars = drawSpiral(data, g, width, height);
  addSpiralHoverEffects(bars, label);
  drawAxisTicks(g, data);
  cleanup();
}
