const Ajv = require("ajv");
const ajv = new Ajv();
const promitaniDao = require("../../dao/promitani-dao");
const filmDao = require("../../dao/film-dao");

const schema = {
  type: "object",
  properties: {
    filmId: { type: "string", minLength: 1 },
    datum: { type: "string", minLength: 10 },
    cas: { type: "string", minLength: 1 }
  },
  required: ["filmId", "datum", "cas"],
  additionalProperties: false
};

const Errors = {
  create: {
    screeningTimeAlreadyTaken: {
      code: "screeningTimeAlreadyTaken",
      message: "another screening is already scheduled for this date and time."
    },
    screeningTimeOverlap: {
      code: "screeningTimeOverlap",
      message: "screening time overlaps with another screening."
    }
  }
};

async function CreateAbl(req, res) {
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

    const film = filmDao.get(data.filmId);
    if (!film) {
      return res.status(400).json({
        code: "filmDoesNotExist",
        message: "Referenced film does not exist."
      });
    }

    try {
      const existingScreenings = promitaniDao.list();
      const newStartTime = toMinutes(data.cas);
      const newEndTime = newStartTime + Number(film.delkaMinuty);
      const screeningTimeTaken = existingScreenings.some((screening) => {
        if (screening.datum !== data.datum) return false;
        const screeningFilm = filmDao.get(screening.filmId);
        if (!screeningFilm) return false;
        const existingStartTime = toMinutes(screening.cas);
        const existingEndTime = existingStartTime + Number(screeningFilm.delkaMinuty);
        return (
          newStartTime < existingEndTime &&
          newEndTime > existingStartTime
        );
      });
      if (screeningTimeTaken) throw Errors.create.screeningTimeOverlap;
      const screeningSameStartTime = existingScreenings.some(
        (screening) => screening.datum === data.datum && screening.cas === data.cas
      );
      if (screeningSameStartTime) throw Errors.create.screeningTimeAlreadyTaken;
      data = promitaniDao.create(data);
    } catch (e) {
      return res.status(400).json({ ...e });
    }
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

module.exports = CreateAbl;
