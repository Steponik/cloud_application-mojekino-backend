const Ajv = require("ajv");
const ajv = new Ajv();
const promitaniDao = require("../../dao/promitani-dao");
const filmDao = require("../../dao/film-dao");

const schema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 1 },
    filmId: { type: "string", minLength: 1 },
    datum: { type: "string", minLength: 10 },
    cas: { type: "string", minLength: 1 }
  },
  required: ["id", "filmId", "datum", "cas"],
  additionalProperties: false
};

const Errors = {
  update: {
    screeningTimeAlreadyTaken: {
      code: "screeningTimeAlreadyTaken",
      message: "another screening is already scheduled for this date and time."
    }
  }
};

async function UpdateAbl(req, res) {
  try {
    let data = req.body;
    const valid = ajv.validate(schema, data);
    if (!valid) {
      return res.status(400).json({
        code: "invalidDtoIn",
        message: "dtoIn is not valid",
        validationError: ajv.errors
      });
    }

    const existingPromitani = promitaniDao.get(data.id);
    if (!existingPromitani) {
      return res.status(400).json({
        code: "promitaniDoesNotExist",
        message: "screening with id dtoIn.id does not exist."
      });
    }

    const film = filmDao.get(data.filmId);
    if (!film) {
      return res.status(400).json({
        code: "filmDoesNotExist",
        message: "Referenced film does not exist."
      });
    }

    try {
      const existingScreenings = promitaniDao.list();
      const screeningTimeTaken = existingScreenings.some(
        (screening) =>
          screening.id !== data.id &&
          screening.datum === data.datum &&
          screening.cas === data.cas
      );
      if (screeningTimeTaken) throw Errors.update.screeningTimeAlreadyTaken;
      data = promitaniDao.update(data);
    } catch (e) {
      return res.status(400).json({ ...e });
    }
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

module.exports = UpdateAbl;
