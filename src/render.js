import { load } from "js-yaml";
import { create, interpolateGreys, scaleSequential, extent } from "d3";

function isPlainObject(value) {
  return value && value.constructor === Object;
}

function compute(nodes, options, props, config, depth, cells) {
  const { x, y, width, height, direction = "row" } = options;
  const { padding = 10 } = config;

  const [
    mainStartKey,
    crossStartKey,
    mainSizeKey,
    crossSizeKey,
    mainSize,
    crossSize,
    mainStart,
    crossStart,
  ] =
    direction === "row"
      ? ["x", "y", "width", "height", width, height, x, y]
      : ["y", "x", "height", "width", height, width, y, x];

  let x0 = mainStart + padding;
  const length = nodes.length;
  const cellWidth = (mainSize - padding * (length + 1)) / length;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const cellX = x0;
    const cellY = crossStart + padding;
    const cellHeight = crossSize - 2 * padding;
    const cellName = isPlainObject(node) ? Object.keys(node)[0] : node;
    const cellProps = props[cellName] || {};
    const { direction } = cellProps;
    const cell = {
      [mainStartKey]: cellX,
      [crossStartKey]: cellY,
      [mainSizeKey]: cellWidth,
      [crossSizeKey]: cellHeight,
      title: cellName,
      depth,
      direction,
    };
    x0 += cellWidth + padding;
    cells.push(cell);
    if (typeof node !== "string") {
      const children = node[cellName];
      compute(children, cell, props, config, depth + 1, cells);
    }
  }
}

function layout(options) {
  const { config, root, props } = options;
  const { width, height } = config;
  const cells = [];
  compute([{ root }], { x: 0, y: 0, width, height }, props, config, 0, cells);
  return cells;
}

export function render(code) {
  const options = load(code);
  const { config } = options;
  const { width, height } = config;

  const cells = layout(options);

  const color = scaleSequential(
    extent(cells.map((d) => d.depth)),
    interpolateGreys
  );

  const svg = create("svg").attr("viewBox", `0 0 ${width} ${height}`);

  const g = svg
    .selectAll("g")
    .data(cells)
    .join("g")
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  g.append("rect")
    .attr("width", (d) => d.width)
    .attr("height", (d) => d.height)
    .attr("fill", (d) => color(d.depth));

  return svg.node();
}
