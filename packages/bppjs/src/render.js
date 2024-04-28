import {load} from "js-yaml";
import {create, hierarchy, treemap} from "d3";
import {treemapFlex} from "d3-treemap-flex";

function isPlainObject(value) {
  return value && value.constructor === Object;
}

function tree(config) {
  const {root: _root, props} = config;
  const root = hierarchy({root: _root}, children);

  root.each(data).each(flex);

  function children(d) {
    if (typeof d === "string") return null;
    return d[Object.keys(d)[0]];
  }

  function data(d) {
    const {data} = d;
    const key = isPlainObject(data) ? Object.keys(data)[0] : data;
    const {label = key, visible = true, ...restProps} = props[key] || {};
    d.data = isPlainObject(data) ? data : {};
    Object.assign(d.data, {key, label, visible, ...restProps});
  }

  function flex(d) {
    if (!Array.isArray(d.data.flex) || !Array.isArray(d.children)) return;
    for (let i = 0; i < d.children.length; i++) {
      d.children[i].data.value = d.data.flex[i] ?? 1;
    }
  }

  return root;
}

function visible(key, padding) {
  const p = typeof padding === "function" ? padding : () => padding;
  return (d) => d.data[key] ?? (d.data.visible ? p(d) : 0);
}

function labelHeight(d) {
  return 18;
}

function renderJSON(options, config) {
  const {layout} = options;
  const {treemap: t = treemap()} = config;
  const {width, height, padding = 0, paddingTop = padding * 2 + labelHeight()} = layout;

  const labelX = (d) => (d.children ? 0 : (d.x1 - d.x0) / 2);
  const labelY = (d) => (d.children ? 0 : (d.y1 - d.y0) / 2);
  const labelTextAnchor = (d) => (d.children ? "start" : "middle");
  const labelDominantBaseline = (d) => (d.children ? "middle" : "middle");
  const labelDx = (d) => (d.children ? padding : 0);
  const labelDy = (d) => (d.children ? paddingTop / 2 : 0);
  const hasLabel = (d) => d.data.label && d.children && d.data.key !== "root";

  const root = t
    .tile(treemapFlex())
    .size([width, height])
    .paddingInner(padding)
    .paddingOuter(visible("paddingOuter", padding))
    .paddingTop(visible("paddingTop", (d) => (hasLabel(d) ? paddingTop : padding)))
    .paddingRight(visible("paddingRight", padding))
    .paddingBottom(visible("paddingBottom", padding))
    .paddingLeft(visible("paddingLeft", padding))(tree(options));

  const nodes = root.descendants().filter((d) => d.data.visible);

  const svg = create("svg").attr("viewBox", `0 0 ${width} ${height}`);

  const g = svg
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

  g.append("rect")
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("fill", "#fff")
    .attr("stroke", (d) => (d.data.key === "root" ? "none" : "#000"));

  g.filter((d) => d.data.label && d.data.key !== "root")
    .append("text")
    .attr("x", labelX)
    .attr("y", labelY)
    .attr("text-anchor", labelTextAnchor)
    .attr("dominant-baseline", labelDominantBaseline)
    .attr("dx", labelDx)
    .attr("dy", labelDy)
    .text((d) => d.data.label);

  return svg.node();
}

export function render(yaml, config = {}) {
  const options = load(yaml);
  return renderJSON(options, config);
}
