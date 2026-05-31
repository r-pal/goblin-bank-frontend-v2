import { Navigate, Outlet, useLocation } from "react-router-dom";
import { OfficeNav } from "./OfficeNav";
import { isOfficeAuthed } from "./auth";
import { ToastProvider } from "./toast/ToastProvider";

export function OfficeLayout() {
  const loc = useLocation();
  const isLogin = loc.pathname === "/office/login";
  const authed = isOfficeAuthed();

  if (!authed && !isLogin) return <Navigate to="/office/login" replace />;

  return (
    <ToastProvider>
      <div>
        {!isLogin ? <OfficeNav /> : null}
        <Outlet />
      </div>
    </ToastProvider>
  );
}

