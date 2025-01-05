import {load} from "js-yaml";
import {create, hierarchy} from "d3";
import {auto} from "./auto.js";

function isPlainObject(value) {
  return value && value.constructor === Object;
}

function tree(spec) {
  const {root: r, config = {}} = spec;
  const root = hierarchy({root: r}, children).each(bind);

  function children(d) {
    if (typeof d === "string") return null;
    return d[Object.keys(d)[0]];
  }

  function bind(d) {
    const {data} = d;
    const id = isPlainObject(data) ? Object.keys(data)[0] : data;
    const options = config[id] || {};
    if (id === "root") options.visible ??= false;
    const {label = id, visible = true, ...restConfig} = options;
    d.data = {id, label, visible, ...restConfig};
  }

  return root;
}

function renderJSON(spec, options) {
  const root = tree(spec);

  const {width, height} = auto(root, options);

  const nodes = root.descendants().filter((d) => d.data.visible);

  const svg = create("svg").attr("viewBox", `0 0 ${width} ${height}`);

  const g = svg
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr("transform", (d) => {
      const strokeWidth = d.data["stroke-width"] ?? 1;
      return `translate(${d.x + strokeWidth / 2},${d.y + strokeWidth / 2})`;
    });

  g.append("rect")
    .attr("width", (d) => {
      const strokeWidth = d.data["stroke-width"] ?? 1;
      return d.w - strokeWidth;
    })
    .attr("height", (d) => {
      const strokeWidth = d.data["stroke-width"] ?? 1;
      return d.h - strokeWidth;
    })
    .attr("fill", "#fff")
    .attr("stroke", (d) => (d.data.id === "root" ? "none" : "#000"));

  g.filter((d) => d.data.label)
    .append("text")
    .attr("x", (d) => d.w / 2)
    .attr("y", (d) => d.h / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .text((d) => d.data.label);

  return svg.node();
}

export function render(yaml, options = {}) {
  const spec = load(yaml);
  return renderJSON(spec, options);
}
