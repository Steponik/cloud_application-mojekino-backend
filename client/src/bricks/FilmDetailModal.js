import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";
import FetchHelper from "../fetch-helper";
import Loading from "../common/loading";
import Error from "../common/error";
import { usePromitani } from "../providers/PromitaniProvider";

function FilmDetailModal({ filmId, show, onHide }) {
  const [state, setState] = useState("pending");
  const [film, setFilm] = useState(null);
  const [errorData, setErrorData] = useState(null);
  const { data: screenings = [] } = usePromitani();

  useEffect(() => {
    if (!show || !filmId) return;
    setState("pending");
    setErrorData(null);
    FetchHelper.film.get({ id: filmId }).then((result) => {
      if (result.ok) {
        setFilm(result.data);
        setState("ready");
      } else {
        setErrorData(result.data);
        setState("error");
      }
    });
  }, [show, filmId]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{film?.nazev || "Detail filmu"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {state === "pending" && (
          <div className="text-center py-4">
            <Loading size={2} />
          </div>
        )}
        {state === "error" && <Error errorData={errorData} />}
        {state === "ready" && film && (
          <div className="row g-3">
            <div className="col-md-4">
              <img
                src={film.plakat}
                alt={film.nazev}
                className="img-fluid"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "600px",
                  objectFit: "contain",
                  borderRadius: "12px",
                }}
              />
            </div>
            <div className="col-md-8">
              <p>{film.popis}</p>
              <p className="mb-2">
                <strong>Délka:</strong> {film.delkaMinuty} min
              </p>
              <div className="mb-2">
                <Badge bg="light" text="dark" className="me-1 border">
                  {film.zanr}
                </Badge>
                <Badge bg="light" text="dark" className="border">
                  {film.vekovaKategorie}
                </Badge>
              </div>
              <h6>Obsazení</h6>
              <ul className="mb-0">
                {film.obsazeni.map((herec) => (
                  <li key={herec}>{herec}</li>
                ))}
              </ul>
              <h6 className="mt-3 mb-2">Naplánovaná promítání tohoto filmu</h6>
              {getFutureScreeningsForFilm(screenings, film.id).length ? (
                <div className="d-flex flex-wrap gap-2">
                  {getFutureScreeningsForFilm(screenings, film.id).map((screening) => (
                    <Badge bg="secondary" key={screening.id}>
                      {formatDateLabel(screening.datum)} - {screening.cas}
                    </Badge>
                  ))}
                </div>
              ) : (
                <small className="text-muted">Zatím žádná další promítání</small>
              )}
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
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

export default FilmDetailModal;
