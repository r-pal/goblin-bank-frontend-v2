import { Navigate } from "react-router-dom";
import { defaultOfficePath, getOfficeRole } from "./auth";

export function OfficeIndex() {
  const role = getOfficeRole();
  if (!role) return <Navigate to="/office/login" replace />;
  return <Navigate to={defaultOfficePath(role)} replace />;
}
