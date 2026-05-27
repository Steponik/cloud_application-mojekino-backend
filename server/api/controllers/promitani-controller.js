const express = require("express");
const router = express.Router();

const createAbl = require("../../abl/promitani/create-abl");
const getAbl = require("../../abl/promitani/get-abl");
const listAbl = require("../../abl/promitani/list-abl");
const updateAbl = require("../../abl/promitani/update-abl");
const deleteAbl = require("../../abl/promitani/delete-abl");

router.post("/create", createAbl);
router.get("/get", getAbl);
router.get("/list", listAbl);
router.post("/update", updateAbl);
router.post("/delete", deleteAbl);

module.exports = router;
