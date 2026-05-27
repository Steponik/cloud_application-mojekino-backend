const express = require("express");
const cors = require("cors");
const filmController = require("./api/controllers/film-controller");
const promitaniController = require("./api/controllers/promitani-controller");

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());
app.use("/film", filmController);
app.use("/promitani", promitaniController);

app.listen(port, () => {
  console.log(`MojeKino backend listening on port ${port}`);
});
