const promitaniDao = require("../../dao/promitani-dao");

async function ListAbl(req, res) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const list = promitaniDao.list().filter((promitani) => promitani.datum >= today);
    return res.json(list);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

module.exports = ListAbl;
