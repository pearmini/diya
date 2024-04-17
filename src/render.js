import { load } from "js-yaml";
import {
  create,
  range,
  sum,
  schemeObservable10,
  scaleOrdinal,
  sort,
  hsl,
} from "d3";

function isPlainObject(value) {
  return value && value.constructor === Object;
}

function compute(nodes, options, props, config, depth, cells) {
  const { width: globalWidth, height: globalHeight } = config;
  const {
    x,
    y,
    width,
    height,
    direction = "row",
    count,
    flex: F = range(nodes.length).map(() => 1),
  } = options;
  const { padding = Math.min(globalWidth, globalHeight) * 0.02 } = config;
  const mainCount = count || nodes.length;

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

  let y0 = crossStart + padding;
  const crossCount = Math.ceil(nodes.length / mainCount);
  const unitWidth = (mainSize - padding * (mainCount + 1)) / mainCount;
  const totalWidth = unitWidth * nodes.length;
  const totalHeight = crossSize - padding * (crossCount + 1);
  const cellHeight = totalHeight / crossCount;
  const totalFlex = sum(F);
  for (let i = 0; i < crossCount; i++) {
    let x0 = mainStart + padding;
    for (let j = 0; j < mainCount; j++) {
      const index = i * mainCount + j;
      const node = nodes[index];
      const hasChildren = typeof node !== "string";
      if (!node) return;
      const cellX = x0;
      const cellY = y0;
      const cellWidth = (totalWidth * (F[index] ?? 1)) / totalFlex;
      const cellName = isPlainObject(node) ? Object.keys(node)[0] : node;
      const cellProps = props[cellName] || {};
      const { show = true, ...restCellProps } = cellProps;
      const cell = {
        [mainStartKey]: cellX,
        [crossStartKey]: cellY,
        [mainSizeKey]: cellWidth,
        [crossSizeKey]: cellHeight,
        leave: !hasChildren,
        title: cellName,
        depth,
        ...restCellProps,
      };
      x0 += cellWidth + padding;
      if (show) cells.push(cell);
      if (hasChildren) {
        const children = node[cellName];
        const newOptions = Object.assign({}, cell);
        if (!show) {
          newOptions[mainStartKey] -= padding;
          newOptions[mainSizeKey] += 2 * padding;
          newOptions[crossStartKey] -= padding;
          newOptions[crossSizeKey] += 2 * padding;
        }
        compute(
          children,
          newOptions,
          props,
          config,
          show ? depth + 1 : depth,
          cells
        );
      }
    }
    y0 += cellHeight + padding;
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

  const scaleColor = scaleOrdinal(
    [0, ...sort(Array.from(new Set(cells.map((d) => d.depth))))],
    ["#fff", ...schemeObservable10]
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
    .attr("fill", (d) => hsl(scaleColor(d.depth)).brighter(1.2))
    .attr("stroke", (d) => scaleColor(d.depth));

  g.filter((d) => d.leave)
    .append("text")
    .attr("x", (d) => d.width / 2)
    .attr("y", (d) => d.height / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .text((d) => d.title);

  return svg.node();
}
