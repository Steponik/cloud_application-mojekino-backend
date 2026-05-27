const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const folderPath = path.join(__dirname, "..", "storage", "promitaniList");

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
    .map((fileName) =>
      JSON.parse(fs.readFileSync(path.join(folderPath, fileName), "utf8"))
    );
}

function listScheduled() {
  const today = new Date().toISOString().slice(0, 10);
  return list().filter((promitani) => promitani.datum >= today);
}

function create(promitani) {
  ensureFolder();
  const id = crypto.randomBytes(16).toString("hex");
  const newPromitani = { ...promitani, id };
  fs.writeFileSync(getFilePath(id), JSON.stringify(newPromitani, null, 2), "utf8");
  return newPromitani;
}

function update(promitani) {
  ensureFolder();
  const existing = get(promitani.id);
  if (!existing) throw { code: "promitaniDoesNotExist", message: "Promitani does not exist." };
  const updatedPromitani = { ...existing, ...promitani };
  fs.writeFileSync(getFilePath(promitani.id), JSON.stringify(updatedPromitani, null, 2), "utf8");
  return updatedPromitani;
}

function remove(id) {
  const filePath = getFilePath(id);
  if (!fs.existsSync(filePath)) throw { code: "promitaniDoesNotExist", message: "Promitani does not exist." };
  const promitani = get(id);
  fs.unlinkSync(filePath);
  return promitani;
}

module.exports = { get, list, listScheduled, create, update, remove };
