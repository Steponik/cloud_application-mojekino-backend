const Ajv = require("ajv");
const ajv = new Ajv();
const filmDao = require("../../dao/film-dao");

const schema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 1 }
  },
  required: ["id"],
  additionalProperties: false
};

async function GetAbl(req, res) {
  try {
    const dtoIn = req.query;
    const valid = ajv.validate(schema, dtoIn);
    if (!valid) {
      return res.status(400).json({
        code: "invalidDtoIn",
        message: "dtoIn is not valid",
        validationError: ajv.errors
      });
    }
    const film = filmDao.get(dtoIn.id);
    if (!film) return res.status(404).json({ code: "filmDoesNotExist", message: "Film does not exist." });
    return res.json(film);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

module.exports = GetAbl;
