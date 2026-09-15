# Measurement run

Run this twice. It prints loop-operation counts, not timings.

```bash
node scripts/measure-big-o-cheat-sheet.mjs
```

The final line is:

```text
n=1024 O(1)=1 O(log n)=11 O(n)=1024 O(n log n)=11264 O(n²)=1048576
```

The cut advances through the measured range from 1 through 1,024. `countForInput()` supplies the displayed values. The script independently runs the same loop shapes for all 1,024 inputs and fails if any count changes.
