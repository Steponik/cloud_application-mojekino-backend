import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import ApiErrorAlert from "../common/ApiErrorAlert";

const ZANRY = ["Komedie", "Drama", "Sci-Fi", "Horror", "Animovaný", "Dokument", "Akční"];
const VEKOVE_KATEGORIE = ["Mládeži přístupno", "12+", "15+", "18+"];

function FilmForm({ film, onSubmit, onCancel, submitting }) {
  const [errorData, setErrorData] = useState(null);
  const [obsazeniText, setObsazeniText] = useState(
    film?.obsazeni?.join(", ") || ""
  );

  return (
    <Form
      onSubmit={async (e) => {
        e.preventDefault();
        setErrorData(null);
        const formData = new FormData(e.target);
        const dtoIn = {
          nazev: formData.get("nazev").trim(),
          popis: formData.get("popis").trim(),
          obsazeni: obsazeniText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          plakat: formData.get("plakat").trim(),
          zanr: formData.get("zanr"),
          vekovaKategorie: formData.get("vekovaKategorie"),
          delkaMinuty: Number(formData.get("delkaMinuty")),
        };
        if (film?.id) dtoIn.id = film.id;

        const result = await onSubmit(dtoIn);
        if (!result.ok) setErrorData(result.errorData);
      }}
    >
      <ApiErrorAlert errorData={errorData} onClose={() => setErrorData(null)} />

      <Form.Group className="mb-3">
        <Form.Label>Název</Form.Label>
        <Form.Control
          name="nazev"
          defaultValue={film?.nazev}
          required
          disabled={submitting}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Popis</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="popis"
          defaultValue={film?.popis}
          required
          disabled={submitting}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Obsazení</Form.Label>
        <Form.Control
          value={obsazeniText}
          onChange={(e) => setObsazeniText(e.target.value)}
          placeholder="Jména oddělená čárkou"
          required
          disabled={submitting}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Plakát (URL)</Form.Label>
        <Form.Control
          name="plakat"
          type="url"
          defaultValue={film?.plakat}
          required
          disabled={submitting}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Žánr</Form.Label>
        <Form.Select
          name="zanr"
          defaultValue={film?.zanr || ZANRY[0]}
          required
          disabled={submitting}
        >
          {ZANRY.map((zanr) => (
            <option key={zanr} value={zanr}>
              {zanr}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Věková kategorie</Form.Label>
        <Form.Select
          name="vekovaKategorie"
          defaultValue={film?.vekovaKategorie || VEKOVE_KATEGORIE[0]}
          required
          disabled={submitting}
        >
          {VEKOVE_KATEGORIE.map((kat) => (
            <option key={kat} value={kat}>
              {kat}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Délka (minuty)</Form.Label>
        <Form.Control
          type="number"
          name="delkaMinuty"
          min={1}
          step={1}
          defaultValue={film?.delkaMinuty}
          required
          disabled={submitting}
        />
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Zrušit
        </Button>
        <Button variant="success" type="submit" disabled={submitting}>
          Uložit
        </Button>
      </div>
    </Form>
  );
}

export default FilmForm;
