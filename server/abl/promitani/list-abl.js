const promitaniDao = require("../../dao/promitani-dao");

async function ListAbl(req, res) {
  try {
    return res.json(promitaniDao.listScheduled());
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

module.exports = ListAbl;
