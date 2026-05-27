const Ajv = require("ajv");
const ajv = new Ajv();
const filmDao = require("../../dao/film-dao");

const schema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 1 },
    nazev: { type: "string", minLength: 1 },
    popis: { type: "string" },
    obsazeni: { type: "array", items: { type: "string" } },
    plakat: { type: "string" },
    zanr: { type: "string" },
    vekovaKategorie: { type: "string" },
    delkaMinuty: { type: "number", minimum: 1 }
  },
  required: ["id", "nazev", "popis", "obsazeni", "plakat", "zanr", "vekovaKategorie", "delkaMinuty"],
  additionalProperties: false
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
    try {
      data = filmDao.update(data);
    } catch (e) {
      return res.status(400).json({ ...e });
    }
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

module.exports = UpdateAbl;
