import {measureText} from "./text.js";

export function auto(root, {padding = 5, margin = 10} = {}) {
  root.eachAfter((d) => {
    if (!d.children) {
      const {width, height} = measureText(d.data.label);
      d.w = width + padding * 2;
      d.h = height + padding * 2;
      return;
    }

    const {direction = "row", wrap = null} = d.data;
    const maxWidth = Math.max(...d.children.map((c) => c.w));
    const maxHeight = Math.max(...d.children.map((c) => c.h));

    let x = 0;
    let y = 0;

    for (const child of d.children) {
      child.x = x;
      child.y = y;
      child.w = maxWidth;
      child.h = maxHeight;

      if (direction === "row") {
        x += maxWidth + margin;
        if (wrap && x >= wrap * (maxWidth + margin)) {
          x = 0;
          y += maxHeight + margin;
        }
      } else {
        y += maxHeight + margin;
        if (wrap && y >= wrap * (maxHeight + margin)) {
          y = 0;
          x += maxWidth + margin;
        }
      }
    }

    if (direction === "row") {
      d.w = wrap ? Math.min(wrap, d.children.length) * (maxWidth + margin) - margin : x - margin;
      d.h = wrap ? y + maxHeight : maxHeight;
    } else {
      d.w = wrap ? x + maxWidth : maxWidth;
      d.h = wrap ? Math.min(wrap, d.children.length) * (maxHeight + margin) - margin : y - margin;
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
