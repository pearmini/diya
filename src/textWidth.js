// https://github.com/observablehq/plot/blob/main/src/marks/text.js
//
// Copyright 2020-2023 Observable, Inc.

// Permission to use, copy, modify, and/or distribute this software for any purpose
// with or without fee is hereby granted, provided that the above copyright notice
// and this permission notice appear in all copies.

// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
// REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
// INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
// OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
// TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
// THIS SOFTWARE.

// Computed as round(measureText(text).width * 10) at 10px system-ui. For
// characters that are not represented in this map, we’d ideally want to use a
// weighted average of what we expect to see. But since we don’t really know
// what that is, using “e” seems reasonable.
const defaultWidthMap = {
  a: 56,
  b: 63,
  c: 57,
  d: 63,
  e: 58,
  f: 37,
  g: 62,
  h: 60,
  i: 26,
  j: 26,
  k: 55,
  l: 26,
  m: 88,
  n: 60,
  o: 60,
  p: 62,
  q: 62,
  r: 39,
  s: 54,
  t: 38,
  u: 60,
  v: 55,
  w: 79,
  x: 54,
  y: 55,
  z: 55,
  A: 69,
  B: 67,
  C: 73,
  D: 74,
  E: 61,
  F: 58,
  G: 76,
  H: 75,
  I: 28,
  J: 55,
  K: 67,
  L: 58,
  M: 89,
  N: 75,
  O: 78,
  P: 65,
  Q: 78,
  R: 67,
  S: 65,
  T: 65,
  U: 75,
  V: 69,
  W: 98,
  X: 69,
  Y: 67,
  Z: 67,
  0: 64,
  1: 48,
  2: 62,
  3: 64,
  4: 66,
  5: 63,
  6: 65,
  7: 58,
  8: 65,
  9: 65,
  " ": 29,
  "!": 32,
  '"': 49,
  "'": 31,
  "(": 39,
  ")": 39,
  ",": 31,
  "-": 48,
  ".": 31,
  "/": 32,
  ":": 31,
  ";": 31,
  "?": 52,
  "‘": 31,
  "’": 31,
  "“": 47,
  "”": 47,
  "…": 82,
};

// Reads a single “character” element from the given text starting at the given
// index, returning the index after the read character. Ideally, this implements
// the Unicode text segmentation algorithm and understands grapheme cluster
// boundaries, etc., but in practice this is only smart enough to detect UTF-16
// surrogate pairs, combining marks, and zero-width joiner (zwj) sequences such
// as emoji skin color modifiers. https://unicode.org/reports/tr29/
export function readCharacter(text, i) {
  i += isSurrogatePair(text, i) ? 2 : 1;
  if (isCombiner(text, i)) i = reCombiner.lastIndex;
  if (isZeroWidthJoiner(text, i)) return readCharacter(text, i + 1);
  return i;
}

// This is a rudimentary (and U.S.-centric) algorithm for measuring the width of
// a string based on a technique of Gregor Aisch; it assumes that individual
// characters are laid out independently and does not implement the Unicode
// grapheme cluster breaking algorithm. It does understand code points, though,
// and so treats things like emoji as having the width of a lowercase e (and
// should be equivalent to using for-of to iterate over code points, while also
// being fast). TODO Optimize this by noting that we often re-measure characters
// that were previously measured?
// http://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundaries
// https://exploringjs.com/impatient-js/ch_strings.html#atoms-of-text
export function defaultWidth(text, start = 0, end = text.length) {
  let sum = 0;
  for (let i = start; i < end; i = readCharacter(text, i)) {
    sum += defaultWidthMap[text[i]] ?? (isPictographic(text, i) ? 120 : defaultWidthMap.e);
  }
  return sum;
}

// Even for monospaced text, we can’t assume that the number of UTF-16 code
// points (i.e., the length of a string) corresponds to the number of visible
// characters; we still have to count graphemes. And note that pictographic
// characters such as emojis are typically not monospaced!
export function monospaceWidth(text, start = 0, end = text.length) {
  let sum = 0;
  for (let i = start; i < end; i = readCharacter(text, i)) {
    sum += isPictographic(text, i) ? 126 : 63;
  }
  return sum;
}

function isSurrogatePair(text, i) {
  const hi = text.charCodeAt(i);
  if (hi >= 0xd800 && hi < 0xdc00) {
    const lo = text.charCodeAt(i + 1);
    return lo >= 0xdc00 && lo < 0xe000;
  }
  return false;
}

function isZeroWidthJoiner(text, i) {
  return text.charCodeAt(i) === 0x200d;
}

function isCombiner(text, i) {
  return isAscii(text, i) ? false : ((reCombiner.lastIndex = i), reCombiner.test(text));
}

function isPictographic(text, i) {
  return isAscii(text, i) ? false : ((rePictographic.lastIndex = i), rePictographic.test(text));
}
