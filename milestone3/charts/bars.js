import * as d3 from "d3";
import "../assets/css/bars.css";

function bars(svg, prev, next, x, y, barCount) {
  let g = svg.append("g");
  return ([_, bars], transition) => {
    let barSelection = g
      .selectAll("rect")
      .data(bars.slice(0, barCount), (d) => d.model);

    barSelection
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("height", y.bandwidth())
      .attr("x", x(0))
      .attr("y", (d) => y((prev.get(d) || d).rank))
      .attr("width", (d) => x((prev.get(d) || d).value) - x(0));

    barSelection
      .exit()
      .transition(transition)
      .remove()
      .attr("y", (d) => y((next.get(d) || d).rank))
      .attr("width", (d) => x((next.get(d) || d).value) - x(0));

    barSelection.call((bar) =>
      bar
        .transition(transition)
        .attr("y", (d) => y(d.rank))
        .attr("width", (d) => x(d.value) - x(0))
    );
  };
}

function ticker(svg, barSize, barCount, width, margin) {
  const now = svg
    .append("text")
    .attr("class", "year")
    .attr("text-anchor", "end")
    .attr("x", width - 6)
    .attr("y", margin.top + barSize * (barCount - 0.45))
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

function labels(svg, barCount, x, y, prev, next) {
  let g = svg.append("g").attr("class", "bar-text").attr("text-anchor", "end");

  return ([_, data], transition) => {
    let labelJoin = g
      .selectAll("text")
      .data(data.slice(0, barCount), (d) => d.model);
    labelJoin
      .enter()
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
          .attr("class", "text-value")
          .attr("x", -6)
          .attr("dy", "1.15em")
      );

    labelJoin
      .exit()
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
          .tween("text", (d) => textTween(d.value, (next.get(d) || d).value))
      );

    labelJoin.call((bar) =>
      bar
        .transition(transition)
        .attr("transform", (d) => `translate(${x(d.value)},${y(d.rank)})`)
        .call((g) =>
          g
            .select("tspan")
            .tween("text", (d) => textTween((prev.get(d) || d).value, d.value))
        )
    );
  };
}

function axis(svg, barSize, barCount, x, y, margin, width) {
  const g = svg.append("g").attr("transform", `translate(0,${margin.top})`);

  const axis = d3
    .axisTop(x)
    .ticks(width / 120)
    .tickSizeOuter(0)
    .tickSizeInner(-barSize * (barCount + y.padding()));

  return (_, transition) => {
    g.transition(transition).call(axis);
    g.select(".tick:first-of-type text").remove();
    g.selectAll(".tick:not(:first-of-type) line").attr("class", "axis");
    g.select(".domain").remove();
  };
}

function addRank(cur, barCount) {
  return cur
    .sort((a, b) => b.value - a.value)
    .map((x, index) => {
      return {
        model: x.model,
        value: x.value,
        rank: Math.min(index, barCount),
      };
    });
}

export default async function bootstrapBars(data) {
  const models = Object.keys(data);
  const svg = d3.select("#bars");
  const width = +svg.attr("width");
  const height = +svg.attr("height");

  const BAR_COUNT = 10;
  const DURATION = 50;
  const FRAME_COUNT = 10;
  const START_YEAR = 1982;
  const END_YEAR = 2022;
  const PADDING = 0.1;
  const MARGIN = { top: 16, right: 6, bottom: 6, left: 0 };

  let timepoints = [];
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    for (let i = 0; i < FRAME_COUNT; i++) {
      let currentCrashesForModel = [];
      if (year == END_YEAR) {
        for (let model of models) {
          currentCrashesForModel.push({
            model: model,
            value: data[model][year].count,
          });
        }
        timepoints.push([
          { year: year },
          addRank(currentCrashesForModel, BAR_COUNT),
        ]);
        break;
      } else {
        for (let model of models) {
          currentCrashesForModel.push({
            model: model,
            value:
              ((FRAME_COUNT - i) * data[model][year].count +
                i * data[model][year + 1].count) /
              FRAME_COUNT,
          });
        }
        timepoints.push([
          { year: year },
          addRank(currentCrashesForModel, BAR_COUNT),
        ]);
      }
    }
  }

  let nameFrames = d3.groups(
    timepoints.flatMap(([, data]) => data),
    (d) => d.model
  );
  let previous = new Map(
    nameFrames.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a]))
  );
  let next = new Map(nameFrames.flatMap(([, data]) => d3.pairs(data)));
  let x = d3.scaleLinear([0, 1], [MARGIN.left, width - MARGIN.right]);

  let barHeight = (height - MARGIN.top - MARGIN.bottom) / (BAR_COUNT + 1);
  let y = d3
    .scaleBand()
    .domain(d3.range(BAR_COUNT + 1))
    .rangeRound([
      MARGIN.top,
      MARGIN.top + barHeight * (BAR_COUNT + 1 + PADDING),
    ])
    .padding(PADDING);

  const updateBars = bars(svg, previous, next, x, y, BAR_COUNT);
  const updateAxis = axis(svg, barHeight, BAR_COUNT, x, y, MARGIN, width);
  const updateLabels = labels(svg, BAR_COUNT, x, y, previous, next);
  const updateTicker = ticker(svg, barHeight, BAR_COUNT, width, MARGIN);

  for (const timepoint of timepoints) {
    const transition = svg.transition().duration(DURATION).ease(d3.easeLinear);

    x.domain([0, timepoint[1][0].value]);
    updateAxis(timepoint, transition);
    updateBars(timepoint, transition);
    updateLabels(timepoint, transition);
    updateTicker(timepoint, transition);

    await transition.end();
  }
}
