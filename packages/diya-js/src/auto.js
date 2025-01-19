import {measureText} from "./text.js";

export function auto(root, {padding = 5, margin = 10} = {}) {
  root.eachAfter((d) => {
    if (!d.children) {
      const {width, height} = measureText(d.data.label);
      d.w = width + padding * 2;
      d.h = height + padding * 2;
      return;
    }

    const {direction = "row", wrap = d.children.length, flex = d.children.map(() => 1)} = d.data;
    const maxWidth = Math.max(...d.children.map((c) => c.w));
    const maxHeight = Math.max(...d.children.map((c) => c.h));

    let sizes = [];
    if (direction === "row") {
      const widths = d.children.map((c, i) => c.w * flex[i] + margin * (flex[i] - 1));
      const maxIndex = widths.indexOf(Math.max(...widths));
      const maxWidth = widths[maxIndex];
      const step = (maxWidth + margin) / flex[maxIndex];
      sizes = flex.map((f) => f * (step - margin));
    } else {
      const heights = d.children.map((c, i) => c.h * flex[i] + margin * (flex[i] - 1));
      const maxIndex = heights.indexOf(Math.max(...heights));
      const maxHeight = heights[maxIndex];
      const step = (maxHeight + margin) / flex[maxIndex];
      sizes = flex.map((f) => f * (step - margin));
    }

    let x = 0;
    let y = 0;
    let wrapCount = 0;

    for (let i = 0; i < d.children.length; i++) {
      const child = d.children[i];
      child.x = x;
      child.y = y;

      if (direction === "row") {
        child.w = sizes[i];
        child.h = maxHeight;

        x += child.w + margin;
        if (++wrapCount >= wrap) {
          x = 0;
          y += maxHeight + margin;
          wrapCount = 0;
        }
      } else {
        child.h = sizes[i];
        child.w = maxWidth;

        y += child.h + margin;
        if (++wrapCount >= wrap) {
          y = 0;
          x += maxWidth + margin;
          wrapCount = 0;
        }
      }
    }

    d.w = 0;
    d.h = 0;
    for (const child of d.children) {
      d.w = Math.max(d.w, child.x + child.w);
      d.h = Math.max(d.h, child.y + child.h);
    }
  });

  root.eachBefore((d) => {
    if (d.parent) {
      d.x += d.parent.x;
      d.y += d.parent.y;
    } else {
      d.x = 0;
      d.y = 0;
    }
  });

  return {
    width: root.w,
    height: root.h,
  };
}
