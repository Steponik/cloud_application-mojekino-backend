const Ajv = require("ajv");
const ajv = new Ajv();
const promitaniDao = require("../../dao/promitani-dao");

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
    const promitani = promitaniDao.get(dtoIn.id);
    if (!promitani) {
      return res.status(404).json({
        code: "promitaniDoesNotExist",
        message: "Promitani does not exist."
      });
    }
    return res.json(promitani);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

module.exports = GetAbl;
