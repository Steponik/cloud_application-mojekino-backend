const ERROR_MESSAGES = {
  screeningTimeAlreadyTaken:
    "V tomto termínu je již naplánováno jiné promítání.",
  screeningTimeOverlap:
    "Nelze uložit, čas se překrývá s jiným promítáním.",
  filmHasScheduledScreenings:
    "Nelze smazat film, který má naplánovaná budoucí promítání.",
  uniqueNameAlreadyExists: "Film s tímto názvem již existuje.",
  promitaniDoesNotExist: "Promítání neexistuje.",
  filmDoesNotExist: "Zvolený film neexistuje.",
  invalidDtoIn: "Neplatná data formuláře.",
};

export function getApiErrorMessage(errorData) {
  if (!errorData) return "Došlo k chybě.";
  return ERROR_MESSAGES[errorData.code] || errorData.message || "Došlo k chybě.";
}

export default ERROR_MESSAGES;
