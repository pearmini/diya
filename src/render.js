import { load } from "js-yaml";
import { create, range, sum, schemeObservable10, scaleOrdinal, sort, hsl, hierarchy } from "d3";

function isPlainObject(value) {
  return value && value.constructor === Object;
}

function compute(node, dimensions) {
  const nodes = node.children;
  if (!nodes) return;

  const { x, y, width, height } = dimensions;
  const { direction = "row", count, flex: F0 = range(nodes.length).map(() => 1), padding } = node.data;

  const mainCount = count || nodes.length;
  const F = range(nodes.length).map((i) => F0[i] ?? 1);

  const [mainStartKey, crossStartKey, mainSizeKey, crossSizeKey, mainSize, crossSize, mainStart, crossStart] =
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
      if (!node) return;
      const { data } = node;
      const cellX = x0;
      const cellY = y0;
      const cellWidth = (totalWidth * (F[index] ?? 1)) / totalFlex;
      const dimensions = {
        [mainStartKey]: cellX,
        [crossStartKey]: cellY,
        [mainSizeKey]: cellWidth,
        [crossSizeKey]: cellHeight,
      };
      Object.assign(node, { dimensions });

      x0 += cellWidth + padding;

      const subdimensions = Object.assign({}, dimensions);
      const { show } = data;
      if (!show) {
        subdimensions[mainStartKey] -= padding;
        subdimensions[mainSizeKey] += 2 * padding;
        subdimensions[crossStartKey] -= padding;
        subdimensions[crossSizeKey] += 2 * padding;
      }
      compute(node, subdimensions);
    }
    y0 += cellHeight + padding;
  }
}

function layout(root, config) {
  const { width, height } = config;
  const dimensions = { x: 0, y: 0, width, height };
  Object.assign(root, { dimensions });
  compute(root, dimensions);
}

function tree(options) {
  const { config, root: _root, props } = options;
  const { width, height } = config;
  const root = hierarchy({ root: _root }, (d) => {
    if (typeof d === "string") return null;
    return d[Object.keys(d)[0]];
  });
  root.each((d) => {
    const { data } = d;
    const key = isPlainObject(data) ? Object.keys(data)[0] : data;
    const { title = key, padding = Math.min(width, height) * 0.02, show = true, ...restProps } = props[key] || {};
    d.data = isPlainObject(data) ? data : {};
    Object.assign(d.data, { key, title, padding, show, ...restProps });
  });
  return root;
}

function renderJSON(options) {
  const { config } = options;
  const { width, height } = config;

  const root = tree(options);
  layout(root, config);

  const cells = root.descendants().filter((d) => d.data.show);

  const scaleColor = scaleOrdinal()
    .domain(sort(Array.from(new Set(cells.map((d) => d.height)))))
    .range(schemeObservable10);

  const svg = create("svg").attr("viewBox", `0 0 ${width} ${height}`);

  const g = svg
    .selectAll("g")
    .data(cells)
    .join("g")
    .attr("transform", (d) => `translate(${d.dimensions.x},${d.dimensions.y})`);

  g.append("rect")
    .attr("width", (d) => d.dimensions.width)
    .attr("height", (d) => d.dimensions.height)
    .attr("fill", (d) => (d.data.key === "root" ? "#fff" : hsl(scaleColor(d.height)).brighter(1.2)))
    .attr("stroke", (d) => (d.data.key === "root" ? "#fff" : scaleColor(d.height)));

  g.filter((d) => !d.children)
    .append("text")
    .attr("x", (d) => d.dimensions.width / 2)
    .attr("y", (d) => d.dimensions.height / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .text((d) => d.data.title);

  return svg.node();
}

export function render(yaml) {
  const options = load(yaml);
  return renderJSON(options);
}
