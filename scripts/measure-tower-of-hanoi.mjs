#!/usr/bin/env node

const towers = { A: [4, 3, 2, 1], B: [], C: [] };
const moves = [];
let calls = 0;
let maxDepth = 0;

const hanoi = (n, from, to, spare, depth = 1) => {
  calls += 1;
  maxDepth = Math.max(maxDepth, depth);
  if (n === 0) return;

  hanoi(n - 1, from, spare, to, depth + 1);

  const disk = towers[from].pop();
  const targetTop = towers[to].at(-1);
  if (disk !== n || (targetTop !== undefined && targetTop < disk)) {
    throw new Error(`illegal move: disk ${disk} from ${from} to ${to}`);
  }
  towers[to].push(disk);
  moves.push({ disk, from, to });

  hanoi(n - 1, spare, to, from, depth + 1);
};

hanoi(4, "A", "C", "B");

console.log("input_disks=4");
console.log(`moves=${moves.length}`);
console.log(`calls=${calls}`);
console.log(`max_depth=${maxDepth}`);
for (const [index, move] of moves.entries()) {
  console.log(`${index + 1}: disk ${move.disk} ${move.from}->${move.to}`);
}
console.log(`final_A=${JSON.stringify(towers.A)}`);
console.log(`final_B=${JSON.stringify(towers.B)}`);
console.log(`final_C=${JSON.stringify(towers.C)}`);
