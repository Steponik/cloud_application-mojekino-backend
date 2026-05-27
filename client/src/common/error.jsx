import Icon from "@mdi/react";
import { mdiAlertCircle } from "@mdi/js";
import { getApiErrorMessage } from "./api-error-messages";

const Error = ({ errorData }) => (
  <div className="text-center py-4">
    <Icon path={mdiAlertCircle} size={2} color="red" />
    <p className="mt-2 mb-0">{getApiErrorMessage(errorData)}</p>
  </div>
);

export default Error;
