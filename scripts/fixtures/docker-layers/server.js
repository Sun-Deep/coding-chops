const express = require("express");

const app = express();
const port = 3000;

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/orders", (req, res) => {
  res.json({ orders: [] });
});

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
