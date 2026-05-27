import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ApiErrorAlert from "../common/ApiErrorAlert";

function DeletePromitaniModal({ show, onHide, title, message, onConfirm }) {
  const [errorData, setErrorData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setErrorData(null);
    setSubmitting(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ApiErrorAlert errorData={errorData} onClose={() => setErrorData(null)} />
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button variant="secondary" onClick={handleClose} disabled={submitting}>
          Zrušit
        </Button>
        <Button
          variant="danger"
          disabled={submitting}
          onClick={async () => {
            setErrorData(null);
            setSubmitting(true);
            const result = await onConfirm();
            setSubmitting(false);
            if (result.ok) handleClose();
            else setErrorData(result.errorData);
          }}
        >
          Smazat
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeletePromitaniModal;
