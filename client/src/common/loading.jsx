import Icon from "@mdi/react";
import { mdiLoading } from "@mdi/js";

const Loading = ({ size = 1, spin = true }) => (
  <Icon path={mdiLoading} size={size} spin={spin} color="lightgrey" />
);

export default Loading;
