import * as d3 from "d3";

function bars(svg, prev, next, x, y, bar_count) {
  let bar = svg.append("g").attr("fill-opacity", 0.6).selectAll("rect");
  return ([_, data], transition) =>
    (bar = bar
      .data(data.slice(0, bar_count), (d) => d.model)
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("fill", "green")
            .attr("height", y.bandwidth())
            .attr("x", x(0))
            .attr("y", (d) => y((prev.get(d) || d).rank))
            .attr("width", (d) => x((prev.get(d) || d).value) - x(0)),
        (update) => update,
        (exit) =>
          exit
            .transition(transition)
            .remove()
            .attr("y", (d) => y((next.get(d) || d).rank))
            .attr("width", (d) => x((next.get(d) || d).value) - x(0))
      )
      .call((bar) =>
        bar
          .transition(transition)
          .attr("y", (d) => y(d.rank))
          .attr("width", (d) => x(d.value) - x(0))
      ));
}

function ticker(svg, bar_size, bar_count, width, margin) {
  const now = svg
    .append("text")
    .style("font", `bold ${bar_size}px var(--sans-serif)`)
    .style("font-variant-numeric", "tabular-nums")
    .attr("text-anchor", "end")
    .attr("x", width - 6)
    .attr("y", margin.top + bar_size * (bar_count - 0.45))
    .attr("dy", "0.32em")
    .text(1982);

  return ([year, data], transition) => {
    transition.end().then(() => now.text(year.year));
  };
}

function textTween(a, b) {
  const i = d3.interpolateNumber(a, b);
  return function (t) {
    this.textContent = d3.format(",d")(i(t));
  };
}

function labels(svg, bar_count, x, y, prev, next) {
  let label = svg
    .append("g")
    .style("font", "bold 12px var(--sans-serif)")
    .style("font-variant-numeric", "tabular-nums")
    .attr("text-anchor", "end")
    .selectAll("text");

  return ([date, data], transition) =>
    (label = label
      .data(data.slice(0, bar_count), (d) => d.model)
      .join(
        (enter) =>
          enter
            .append("text")
            .attr(
              "transform",
              (d) =>
                `translate(${x((prev.get(d) || d).value)},${y(
                  (prev.get(d) || d).rank
                )})`
            )
            .attr("y", y.bandwidth() / 2)
            .attr("x", -6)
            .attr("dy", "-0.25em")
            .text((d) => d.model)
            .call((text) =>
              text
                .append("tspan")
                .attr("fill-opacity", 0.7)
                .attr("font-weight", "normal")
                .attr("x", -6)
                .attr("dy", "1.15em")
            ),
        (update) => update,
        (exit) =>
          exit
            .transition(transition)
            .remove()
            .attr(
              "transform",
              (d) =>
                `translate(${x((next.get(d) || d).value)},${y(
                  (next.get(d) || d).rank
                )})`
            )
            .call((g) =>
              g
                .select("tspan")
                .tween("text", (d) =>
                  textTween(d.value, (next.get(d) || d).value)
                )
            )
      )
      .call((bar) =>
        bar
          .transition(transition)
          .attr("transform", (d) => `translate(${x(d.value)},${y(d.rank)})`)
          .call((g) =>
            g
              .select("tspan")
              .tween("text", (d) =>
                textTween((prev.get(d) || d).value, d.value)
              )
          )
      ));
}

function axis(svg, bar_size, bar_count, x, y, margin, width) {
  const g = svg.append("g").attr("transform", `translate(0,${margin.top})`);

  const axis = d3
    .axisTop(x)
    .ticks(width / 160)
    .tickSizeOuter(0)
    .tickSizeInner(-bar_size * (bar_count + y.padding()));

  return (_, transition) => {
    g.transition(transition).call(axis);
    g.select(".tick:first-of-type text").remove();
    g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
    g.select(".domain").remove();
  };
}

function add_rank(cur, n) {
  //console.log(cur.sort((a, b) => b.value - a.value));

  return cur
    .sort((a, b) => b.value - a.value)
    .map((x, index) => {
      return { model: x.model, value: x.value, rank: Math.min(index, n) };
    });
}

export default async function bootstrapBars(data) {
  const models = Object.keys(data);
  //return;
  const svg = d3.select("#bars");
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const bar_count = 10;
  const duration = 50;
  const frame_count = 10;
  const startYear = 1982;
  const endYear = 2022;
  let full_data = [];
  for (let year = startYear; year <= endYear; year++) {
    for (let i = 0; i < frame_count; i++) {
      if (year == endYear) {
        //console.log("start");
        let cur = [];
        for (let it = 0; it < models.length; it++) {
          let model = models[it];
          cur.push({ model: model, value: data[model][year].crashes });
        }
        full_data.push([{ year: year }, add_rank(cur, bar_count)]);
        break;
      } else {
        //console.log("okt");
        //console.log(models);
        let cur = [];
        for (let it = 0; it < models.length; it++) {
          let model = models[it];
          //console.log(model);
          //console.log(data[model][year]);
          //console.log(data[model][year + 1]);
          cur.push({
            model: model,
            value:
              ((frame_count - i) * data[model][year].crashes +
                i * data[model][year + 1].crashes) /
              frame_count,
          });
        }
        full_data.push([{ year: year }, add_rank(cur, bar_count)]);
        //console.log("okt");
      }
    }
  }
  //console.log("OK");

  let name_frames = d3.groups(
    full_data.flatMap(([, data]) => data),
    (d) => d.model
  );
  let prev = new Map(
    name_frames.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a]))
  );
  let next = new Map(name_frames.flatMap(([, data]) => d3.pairs(data)));
  //console.log(prev);
  //console.log(next);
  //console.log(width);
  let margin = { top: 16, right: 6, bottom: 6, left: 0 };
  let x = d3.scaleLinear([0, 1], [margin.left, width - margin.right]);
  //console.log(x);
  let bar_size = (height - margin.top - margin.bottom) / (bar_count + 1);
  let y = d3
    .scaleBand()
    .domain(d3.range(bar_count + 1))
    .rangeRound([margin.top, margin.top + bar_size * (bar_count + 1 + 0.1)])
    .padding(0.1);
  //console.log(y);
  //console.log("Nani");

  const updateBars = bars(svg, prev, next, x, y, bar_count);
  const updateAxis = axis(svg, bar_size, bar_count, x, y, margin, width);
  const updateLabels = labels(svg, bar_count, x, y, prev, next);
  const updateTicker = ticker(svg, bar_size, bar_count, width, margin);

  console.log(full_data);

  for (const keyframe of full_data) {
    const transition = svg.transition().duration(duration).ease(d3.easeLinear);

    // Extract the top bar’s value.
    x.domain([0, keyframe[1][0].value]);
    updateAxis(keyframe, transition);
    updateBars(keyframe, transition);
    updateLabels(keyframe, transition);
    updateTicker(keyframe, transition);

    await transition.end();
  }
}
