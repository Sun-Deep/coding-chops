#!/usr/bin/env node

const MAX_INPUT_SIZE = 1024;
const SIZES = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, MAX_INPUT_SIZE];

const countConstant = () => 1;

const countLogarithmic = (n) => {
  let steps = 0;
  for (let span = n; span >= 1; span = Math.floor(span / 2)) steps++;
  return steps;
};

const countLinear = (n) => {
  let steps = 0;
  for (let index = 0; index < n; index++) steps++;
  return steps;
};

const countLinearithmic = (n) => {
  let steps = 0;
  for (let index = 0; index < n; index++) {
    for (let span = n; span >= 1; span = Math.floor(span / 2)) steps++;
  }
  return steps;
};

const countQuadratic = (n) => {
  let steps = 0;
  for (let row = 0; row < n; row++) {
    for (let column = 0; column < n; column++) steps++;
  }
  return steps;
};

const counts = SIZES.map((n) => ({
  n,
  constant: countConstant(),
  logarithmic: countLogarithmic(n),
  linear: countLinear(n),
  linearithmic: countLinearithmic(n),
  quadratic: countQuadratic(n),
}));

const expectedFinal = {
  n: MAX_INPUT_SIZE,
  constant: 1,
  logarithmic: 11,
  linear: 1024,
  linearithmic: 11264,
  quadratic: 1048576,
};

const final = counts.at(-1);
if (JSON.stringify(final) !== JSON.stringify(expectedFinal)) {
  throw new Error("time-complexity counts changed");
}

for (let n = 1; n <= MAX_INPUT_SIZE; n++) {
  const logarithmic = Math.floor(Math.log2(n)) + 1;
  const expected = {
    constant: 1,
    logarithmic,
    linear: n,
    linearithmic: n * logarithmic,
    quadratic: n * n,
  };
  const actual = {
    constant: countConstant(),
    logarithmic: countLogarithmic(n),
    linear: countLinear(n),
    linearithmic: countLinearithmic(n),
    quadratic: countQuadratic(n),
  };

  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`time-complexity counts changed at n=${n}`);
  }
}

for (const count of counts) {
  console.log(
    `n=${count.n} O(1)=${count.constant} O(log n)=${count.logarithmic} O(n)=${count.linear} O(n log n)=${count.linearithmic} O(n²)=${count.quadratic}`,
  );
}

console.log(`verified every integer input from 1 through ${MAX_INPUT_SIZE}`);
