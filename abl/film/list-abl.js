const filmDao = require("../../dao/film-dao");

async function ListAbl(req, res) {
  try {
    const list = filmDao.list();
    return res.json(list);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

module.exports = ListAbl;
