const Ajv = require("ajv");
const ajv = new Ajv();
const filmDao = require("../../dao/film-dao");
const promitaniDao = require("../../dao/promitani-dao");

const schema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 1 }
  },
  required: ["id"],
  additionalProperties: false
};

async function DeleteAbl(req, res) {
  try {
    const dtoIn = req.body;
    const valid = ajv.validate(schema, dtoIn);
    if (!valid) {
      return res.status(400).json({
        code: "invalidDtoIn",
        message: "dtoIn is not valid",
        validationError: ajv.errors
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    const filmScreenings = promitaniDao
      .list()
      .filter((promitani) => promitani.filmId === dtoIn.id);

    const hasFutureScreenings = filmScreenings.some(
      (promitani) => promitani.datum >= today
    );
    if (hasFutureScreenings) {
      return res.status(400).json({
        code: "filmHasScheduledScreenings",
        message:
          "Nelze smazat film, který má naplánovaná budoucí promítání."
      });
    }

    try {
      filmScreenings.forEach((promitani) => promitaniDao.remove(promitani.id));
      const deleted = filmDao.remove(dtoIn.id);
      return res.json(deleted);
    } catch (e) {
      return res.status(400).json({ ...e });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

module.exports = DeleteAbl;
