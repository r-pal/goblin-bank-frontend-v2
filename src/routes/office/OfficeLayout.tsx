import { Navigate, Outlet, useLocation } from "react-router-dom";
import { OfficeNav } from "./OfficeNav";
import { isOfficeAuthed } from "./auth";

export function OfficeLayout() {
  const loc = useLocation();
  const isLogin = loc.pathname === "/office/login";
  const authed = isOfficeAuthed();

  if (!authed && !isLogin) return <Navigate to="/office/login" replace />;

  return (
    <div>
      {!isLogin ? <OfficeNav /> : null}
      <Outlet />
    </div>
  );
}

