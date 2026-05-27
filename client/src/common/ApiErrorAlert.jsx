import Alert from "react-bootstrap/Alert";
import { getApiErrorMessage } from "./api-error-messages";

const ApiErrorAlert = ({ errorData, onClose }) => {
  if (!errorData) return null;
  return (
    <Alert variant="danger" dismissible={!!onClose} onClose={onClose}>
      {getApiErrorMessage(errorData)}
    </Alert>
  );
};

export default ApiErrorAlert;
