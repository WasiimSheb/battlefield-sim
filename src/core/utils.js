export const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const inBounds = (x, y, size) =>
  x >= 0 && y >= 0 && x < size && y < size;
