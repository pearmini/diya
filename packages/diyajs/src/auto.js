import {measureText} from "./text.js";

export function auto(root, {padding = 5, margin = 10} = {}) {
  root.eachAfter((d) => {
    if (!d.children) {
      const {width, height} = measureText(d.data.label);
      d.w = width + padding * 2;
      d.h = height + padding * 2;
      return;
    }
    const maxWidth = Math.max(...d.children.map((c) => c.w));
    const maxHeight = Math.max(...d.children.map((c) => c.h));

    let x = 0;
    for (const child of d.children) {
      child.x = x;
      child.y = 0;
      child.w = maxWidth;
      child.h = maxHeight;
      x += maxWidth + margin;
    }

    d.w = x - margin;
    d.h = maxHeight;
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
