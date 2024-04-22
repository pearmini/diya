import { load } from "js-yaml";
import { create, schemeObservable10, scaleOrdinal, sort, hsl, hierarchy, treemap } from "d3";
import { treemapFlex } from "d3-treemap-flex";

function isPlainObject(value) {
  return value && value.constructor === Object;
}

function tree(options) {
  const { root: _root, props } = options;
  const root = hierarchy({ root: _root }, children);
  root.each(bindData);

  function children(d) {
    if (typeof d === "string") return null;
    return d[Object.keys(d)[0]];
  }

  function bindData(d) {
    const { data } = d;
    const key = isPlainObject(data) ? Object.keys(data)[0] : data;
    const { label = key, visible = true, ...restProps } = props[key] || {};
    d.data = isPlainObject(data) ? data : {};
    Object.assign(d.data, { key, label, visible, ...restProps });
  }

  return root;
}

function visible(key, padding) {
  return (d) => d.data[key] ?? (d.data.visible ? padding : 0);
}

function renderJSON(options) {
  const { layout } = options;
  const {
    width,
    height,
    padding = 0,
    paddingInner = padding,
    paddingOuter = visible("paddingOuter", padding),
    paddingLeft = visible("paddingLeft", padding),
    paddingRight = visible("paddingRight", padding),
    paddingBottom = visible("paddingBottom", padding),
    paddingTop = visible("paddingTop", padding),
    round = false,
  } = layout;

  const root = treemap()
    .tile(treemapFlex())
    .size([width, height])
    .paddingInner(paddingInner)
    .paddingOuter(paddingOuter)
    .paddingTop(paddingTop)
    .paddingRight(paddingRight)
    .paddingBottom(paddingBottom)
    .paddingLeft(paddingLeft)
    .round(round)(tree(options));

  const nodes = root.descendants().filter((d) => d.data.visible);

  const color = scaleOrdinal()
    .domain(sort(Array.from(new Set(nodes.map((d) => d.height)))))
    .range(schemeObservable10);

  const svg = create("svg").attr("viewBox", `0 0 ${width} ${height}`);

  const g = svg
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

  g.append("rect")
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("fill", (d) => (d.data.key === "root" ? "#fff" : hsl(color(d.height)).brighter(1.2)))
    .attr("stroke", (d) => (d.data.key === "root" ? "#fff" : color(d.height)));

  g.filter((d) => !d.children)
    .append("text")
    .attr("x", (d) => (d.x1 - d.x0) / 2)
    .attr("y", (d) => (d.y1 - d.y0) / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .text((d) => d.data.label);

  return svg.node();
}

export function render(yaml) {
  const options = load(yaml);
  return renderJSON(options);
}
