const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const folderPath = path.join(__dirname, "..", "storage", "filmList");

function getFilePath(id) {
  return path.join(folderPath, `${id}.json`);
}

function ensureFolder() {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
}

function get(id) {
  const filePath = getFilePath(id);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function list() {
  ensureFolder();
  return fs
    .readdirSync(folderPath)
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => JSON.parse(fs.readFileSync(path.join(folderPath, fileName), "utf8")));
}

function validateUniqueName(nazev, ignoreId = null) {
  const existing = list().find((film) => film.nazev === nazev && film.id !== ignoreId);
  if (existing) throw { code: "uniqueNameAlreadyExists", message: "Film with this name already exists." };
}

function create(film) {
  ensureFolder();
  validateUniqueName(film.nazev);
  const id = crypto.randomBytes(16).toString("hex");
  const newFilm = { ...film, id };
  fs.writeFileSync(getFilePath(id), JSON.stringify(newFilm, null, 2), "utf8");
  return newFilm;
}

function update(film) {
  ensureFolder();
  const existing = get(film.id);
  if (!existing) throw { code: "filmDoesNotExist", message: "Film does not exist." };
  validateUniqueName(film.nazev, film.id);
  const updatedFilm = { ...existing, ...film };
  fs.writeFileSync(getFilePath(film.id), JSON.stringify(updatedFilm, null, 2), "utf8");
  return updatedFilm;
}

function remove(id) {
  const filePath = getFilePath(id);
  if (!fs.existsSync(filePath)) throw { code: "filmDoesNotExist", message: "Film does not exist." };
  const film = get(id);
  fs.unlinkSync(filePath);
  return film;
}

module.exports = { get, list, create, update, remove };
