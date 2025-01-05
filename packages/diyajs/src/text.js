function createSpan(text) {
  const span = document.createElement("span");
  span.style.position = "absolute";
  span.style.visibility = "hidden";
  span.style.whiteSpace = "pre";
  span.textContent = text;
  return span;
}

export function measureText(text) {
  const span = createSpan(text);
  document.body.appendChild(span);
  const {width, height} = span.getBoundingClientRect();
  document.body.removeChild(span);
  return {width, height};
}
