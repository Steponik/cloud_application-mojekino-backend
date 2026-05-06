const express = require("express");
const router = express.Router();

const createAbl = require("../../abl/film/create-abl");
const getAbl = require("../../abl/film/get-abl");
const listAbl = require("../../abl/film/list-abl");
const updateAbl = require("../../abl/film/update-abl");
const deleteAbl = require("../../abl/film/delete-abl");

router.post("/create", createAbl);
router.get("/get", getAbl);
router.get("/list", listAbl);
router.post("/update", updateAbl);
router.post("/delete", deleteAbl);

module.exports = router;
