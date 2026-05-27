import { useEffect, useMemo, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import { useFilm } from "../providers/FilmProvider";
import { usePromitani } from "../providers/PromitaniProvider";
import Loading from "../common/loading";
import ApiErrorAlert from "../common/ApiErrorAlert";

function PromitaniModal({ show, onHide, promitani }) {
  const { state: filmState, data: films } = useFilm();
  const { data: screenings, handlerMap } = usePromitani();
  const [errorData, setErrorData] = useState(null);
  const [overlapError, setOverlapError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFilmId, setSelectedFilmId] = useState(
    promitani?.filmId || films[0]?.id || ""
  );

  const isEdit = Boolean(promitani?.id);
  const filmMap = useMemo(
    () => Object.fromEntries(films.map((film) => [film.id, film])),
    [films]
  );
  const plannedScreenings = getFutureScreeningsForFilm(screenings, selectedFilmId);

  useEffect(() => {
    if (!show) return;
    setSelectedFilmId(promitani?.filmId || films[0]?.id || "");
    setOverlapError(null);
  }, [show, promitani?.filmId, films]);

  const handleClose = () => {
    setOverlapError(null);
    setErrorData(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Form
        onSubmit={async (e) => {
          e.preventDefault();
          setErrorData(null);
          setOverlapError(null);
          setSubmitting(true);
          const formData = new FormData(e.target);
          const dtoIn = {
            filmId: formData.get("filmId"),
            datum: formData.get("datum"),
            cas: formData.get("cas"),
          };
          if (isEdit) dtoIn.id = promitani.id;
          const overlap = hasOverlap(dtoIn, screenings, filmMap);
          if (overlap) {
            setOverlapError("Nelze uložit, čas se překrývá s jiným promítáním.");
            setSubmitting(false);
            return;
          }

          const result = isEdit
            ? await handlerMap.updateItem(dtoIn)
            : await handlerMap.createItem(dtoIn);
          setSubmitting(false);
          if (result.ok) handleClose();
          else setErrorData(result.errorData);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEdit ? "Upravit promítání" : "Naplánovat nové promítání"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ApiErrorAlert
            errorData={errorData}
            onClose={() => setErrorData(null)}
          />

          {filmState === "pending" ? (
            <div className="text-center py-3">
              <Loading size={1.5} />
            </div>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Vybrat film</Form.Label>
                <Form.Select
                  name="filmId"
                  value={selectedFilmId}
                  onChange={(e) => {
                    setSelectedFilmId(e.target.value);
                    setOverlapError(null);
                  }}
                  required
                  disabled={submitting || films.length === 0}
                >
                  {films.map((film) => (
                    <option key={film.id} value={film.id}>
                      {film.nazev}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Datum promítání</Form.Label>
                <Form.Control
                  type="date"
                  name="datum"
                  defaultValue={promitani?.datum}
                  onChange={() => setOverlapError(null)}
                  required
                  disabled={submitting}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Čas promítání</Form.Label>
                <Form.Control
                  type="time"
                  name="cas"
                  defaultValue={promitani?.cas}
                  onChange={() => setOverlapError(null)}
                  required
                  disabled={submitting}
                />
              </Form.Group>

              <h6 className="mt-2 mb-2">Naplánovaná promítání tohoto filmu</h6>
              {plannedScreenings.length ? (
                <div className="d-flex flex-wrap gap-2">
                  {plannedScreenings.map((screening) => (
                    <span className="badge bg-secondary" key={screening.id}>
                      {formatDateLabel(screening.datum)} - {screening.cas}
                    </span>
                  ))}
                </div>
              ) : (
                <small className="text-muted">Zatím žádná další promítání</small>
              )}
              {overlapError && (
                <Alert variant="danger" className="mt-3">
                  {overlapError}
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Zrušit
          </Button>
          <Button
            variant="success"
            type="submit"
            disabled={submitting || filmState !== "ready" || films.length === 0}
          >
            Uložit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

function hasOverlap(dtoIn, screenings, filmMap) {
  const selectedFilm = filmMap[dtoIn.filmId];
  if (!selectedFilm) return false;
  const newStartTime = toMinutes(dtoIn.cas);
  const newEndTime = newStartTime + Number(selectedFilm.delkaMinuty);
  return screenings
    .filter((screening) => screening.datum === dtoIn.datum)
    .filter((screening) => (dtoIn.id ? screening.id !== dtoIn.id : true))
    .some((screening) => {
      const film = filmMap[screening.filmId];
      if (!film) return false;
      const existingStartTime = toMinutes(screening.cas);
      const existingEndTime = existingStartTime + Number(film.delkaMinuty);
      return newStartTime < existingEndTime && newEndTime > existingStartTime;
    });
}

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getFutureScreeningsForFilm(screenings, filmId) {
  const today = new Date().toISOString().slice(0, 10);
  return screenings
    .filter((screening) => screening.filmId === filmId && screening.datum >= today)
    .sort((a, b) => (a.datum + a.cas).localeCompare(b.datum + b.cas));
}

function formatDateLabel(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  const days = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];
  return `${days[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
}

export default PromitaniModal;
