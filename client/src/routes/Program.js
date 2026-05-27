import { useMemo, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Icon from "@mdi/react";
import { mdiTrashCan } from "@mdi/js";
import { useFilm } from "../providers/FilmProvider";
import { usePromitani } from "../providers/PromitaniProvider";
import Loading from "../common/loading";
import Error from "../common/error";
import FilmDetailModal from "../bricks/FilmDetailModal";
import PromitaniModal from "../bricks/PromitaniModal";
import FilmManagementModal from "../bricks/FilmManagementModal";
import DeletePromitaniModal from "../bricks/DeletePromitaniModal";

const FILTERS = ["VŠE", "Mládeži přístupno", "12+", "15+", "18+"];
const POSTER_PLACEHOLDER =
  "https://placehold.co/400x600?text=Bez+plak%C3%A1tu";

const THICK_DIVIDER = {
  width: "100%",
  height: "4px",
  backgroundColor: "#a0a0a0",
  margin: "2rem 0",
};

const SCREENING_DIVIDER = {
  width: "calc(100% - 5.5rem)",
  height: "2px",
  backgroundColor: "#cccccc",
  margin: "1.5rem 0 1.5rem 5.5rem",
};

function Program() {
  const { data: films } = useFilm();
  const { state, data: promitaniList, errorData, handlerMap } = usePromitani();
  const [ageFilter, setAgeFilter] = useState("VŠE");
  const [detailFilmId, setDetailFilmId] = useState(null);
  const [showPromitaniModal, setShowPromitaniModal] = useState(false);
  const [editingPromitani, setEditingPromitani] = useState(null);
  const [showFilmManagement, setShowFilmManagement] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filmMap = useMemo(
    () => Object.fromEntries(films.map((f) => [f.id, f])),
    [films]
  );

  const grouped = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const filtered = promitaniList
      .filter((p) => p.datum >= today)
      .filter((p) => {
        const film = filmMap[p.filmId];
        if (!film) return false;
        if (ageFilter === "VŠE") return true;
        return film.vekovaKategorie === ageFilter;
      });

    const groups = {};
    filtered.forEach((p) => {
      if (!groups[p.datum]) groups[p.datum] = [];
      groups[p.datum].push(p);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [promitaniList, filmMap, ageFilter]);

  const handleEdit = (promitani) => {
    setEditingPromitani(promitani);
    setShowPromitaniModal(true);
  };

  const closePromitaniModal = () => {
    setShowPromitaniModal(false);
    setEditingPromitani(null);
  };

  return (
    <Container fluid className="program-page py-4 px-4">
      <header className="program-header">
        <Row className="align-items-start">
          <Col xs={12} md={4} className="d-flex align-items-center program-header-brand">
            <img src="/logo.png" alt="Logo" className="program-logo-img" />
            <h1 className="program-title mb-0">Program kina</h1>
          </Col>
          <Col
            xs={12}
            md={8}
            className="d-flex flex-wrap justify-content-md-end gap-2 mt-3 mt-md-0"
          >
            <Button variant="dark" onClick={() => setShowFilmManagement(true)}>
              Správa filmů
            </Button>
            <Button
              variant="dark"
              onClick={() => {
                setEditingPromitani(null);
                setShowPromitaniModal(true);
              }}
            >
              Přidat promítání
            </Button>
          </Col>
        </Row>
        <div className="filter-bar mt-3">
          {FILTERS.map((filter) => (
            <Button
              key={filter}
              size="sm"
              variant={ageFilter === filter ? "dark" : "outline-secondary"}
              className="me-1 mb-1"
              onClick={() => setAgeFilter(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>
      </header>
      <div style={THICK_DIVIDER} />

      {state === "pending" && (
        <div className="text-center py-5">
          <Loading size={2} />
        </div>
      )}
      {state === "error" && <Error errorData={errorData} />}
      {state === "ready" && grouped.length === 0 && (
        <p className="text-muted">Žádná nadcházející promítání.</p>
      )}

      {state === "ready" &&
        grouped.map(([datum, items], dayIndex) => {
          const screenings = [...items].sort((a, b) =>
            a.cas.localeCompare(b.cas)
          );
          return (
            <section key={datum}>
              {dayIndex > 0 && <div style={THICK_DIVIDER} />}
              <h5 className="date-heading mt-4 mb-3">
                {formatDateHeading(datum)}
              </h5>
              {screenings.map((promitani, index) => {
                const film = filmMap[promitani.filmId];
                if (!film) return null;
                return (
                  <div key={promitani.id}>
                    <div className="d-flex flex-row align-items-center">
                      <div className="screening-time me-3">{promitani.cas}</div>
                      <img
                        src={film.plakat}
                        alt=""
                        className="screening-thumb flex-shrink-0"
                        style={{
                          width: "120px",
                          height: "180px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = POSTER_PLACEHOLDER;
                        }}
                      />
                      <div
                        className="ms-3 flex-grow-1 screening-card"
                        role="button"
                        tabIndex={0}
                        onClick={() => setDetailFilmId(film.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setDetailFilmId(film.id);
                        }}
                      >
                        <h5 className="film-title mb-1">{film.nazev}</h5>
                        <p className="film-desc mb-2">{film.popis}</p>
                        <div>
                          <Badge bg="light" text="dark" className="me-1 border">
                            {film.zanr}
                          </Badge>
                          <Badge bg="light" text="dark" className="border">
                            {film.vekovaKategorie}
                          </Badge>
                        </div>
                      </div>
                      <div className="d-flex flex-shrink-0 gap-2 ms-3">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(promitani);
                          }}
                        >
                          Upravit
                        </Button>
                        <Button
                          variant="secondary"
                          className="rounded-circle btn-delete-screening"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget({ promitani, film });
                          }}
                          aria-label="Smazat promítání"
                        >
                          <Icon path={mdiTrashCan} size={0.7} color="white" />
                        </Button>
                      </div>
                    </div>
                    {index < screenings.length - 1 && (
                      <div style={SCREENING_DIVIDER} />
                    )}
                  </div>
                );
              })}
            </section>
          );
        })}

      <FilmDetailModal
        show={Boolean(detailFilmId)}
        filmId={detailFilmId}
        onHide={() => setDetailFilmId(null)}
      />
      <PromitaniModal
        key={editingPromitani?.id ?? "create"}
        show={showPromitaniModal}
        promitani={editingPromitani}
        onHide={closePromitaniModal}
      />
      <FilmManagementModal
        show={showFilmManagement}
        onHide={() => setShowFilmManagement(false)}
      />
      <DeletePromitaniModal
        show={Boolean(deleteTarget)}
        title="Smazat promítání"
        message={
          deleteTarget
            ? `Opravdu chcete trvale smazat promítání filmu ${deleteTarget.film.nazev} (${formatDateHeading(deleteTarget.promitani.datum)}, ${deleteTarget.promitani.cas})?`
            : ""
        }
        onConfirm={() =>
          handlerMap.deleteItem({
            id: deleteTarget.promitani.id,
          })
        }
        onHide={() => setDeleteTarget(null)}
      />
    </Container>
  );
}

function formatDateHeading(isoDate) {
  const date = new Date(isoDate + "T00:00:00");
  const days = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];
  return `${days[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
}

export default Program;
