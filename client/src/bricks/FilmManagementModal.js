import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Icon from "@mdi/react";
import { mdiArrowLeft, mdiPencil, mdiTrashCan } from "@mdi/js";
import { useFilm } from "../providers/FilmProvider";
import FilmForm from "./FilmForm";
import Loading from "../common/loading";
import DeletePromitaniModal from "./DeletePromitaniModal";

function FilmManagementModal({ show, onHide }) {
  const { state, data, handlerMap } = useFilm();
  const [view, setView] = useState("list");
  const [editingFilm, setEditingFilm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteFilmTarget, setDeleteFilmTarget] = useState(null);

  const closeModal = () => {
    setView("list");
    setEditingFilm(null);
    setDeleteFilmTarget(null);
    onHide();
  };

  const openCreate = () => {
    setEditingFilm(null);
    setView("form");
  };

  const openEdit = (film) => {
    setEditingFilm(film);
    setView("form");
  };

  const title =
    view === "list"
      ? "Správa filmů"
      : editingFilm
        ? "Upravit film"
        : "Přidat film";

  return (
    <Modal show={show} onHide={closeModal} size="lg" centered>
      <Modal.Header closeButton>
        {view === "form" && (
          <Button
            variant="link"
            className="p-0 me-2 text-secondary"
            onClick={() => {
              setView("list");
              setEditingFilm(null);
            }}
            aria-label="Zpět"
          >
            <Icon path={mdiArrowLeft} size={1} />
          </Button>
        )}
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {view === "list" ? (
          <>
            <div className="mb-3">
              <Button variant="dark" onClick={openCreate}>
                Přidat nový film
              </Button>
            </div>
            {state === "pending" ? (
              <div className="text-center py-4">
                <Loading size={2} />
              </div>
            ) : (
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Plakát</th>
                    <th>Název</th>
                    <th>Žánr</th>
                    <th>Věk</th>
                    <th className="text-end">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((film) => (
                    <tr key={film.id}>
                      <td>
                        <img
                          src={film.plakat}
                          alt={film.nazev}
                          style={{
                            width: "50px",
                            height: "70px",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://placehold.co/400x600?text=Bez+plak%C3%A1tu";
                          }}
                        />
                      </td>
                      <td>{film.nazev}</td>
                      <td>
                        <span className="badge rounded-pill border text-dark">
                          {film.zanr}
                        </span>
                      </td>
                      <td>{film.vekovaKategorie}</td>
                      <td className="text-end">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-1"
                          onClick={() => openEdit(film)}
                          aria-label="Upravit"
                        >
                          <Icon path={mdiPencil} size={0.8} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setDeleteFilmTarget(film)}
                          aria-label="Smazat"
                        >
                          <Icon path={mdiTrashCan} size={0.8} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        ) : (
          <FilmForm
            film={editingFilm}
            submitting={submitting}
            onCancel={() => {
              setView("list");
              setEditingFilm(null);
            }}
            onSubmit={async (dtoIn) => {
              setSubmitting(true);
              const result = editingFilm
                ? await handlerMap.updateItem(dtoIn)
                : await handlerMap.createItem(dtoIn);
              setSubmitting(false);
              if (result.ok) {
                setView("list");
                setEditingFilm(null);
              }
              return result;
            }}
          />
        )}
      </Modal.Body>
      <DeletePromitaniModal
        show={Boolean(deleteFilmTarget)}
        title="Smazat film"
        message={
          deleteFilmTarget
            ? `Opravdu chcete trvale smazat film ${deleteFilmTarget.nazev} včetně všech jeho historických promítání?`
            : ""
        }
        onConfirm={() => handlerMap.deleteItem({ id: deleteFilmTarget.id })}
        onHide={() => setDeleteFilmTarget(null)}
      />
    </Modal>
  );
}

export default FilmManagementModal;
