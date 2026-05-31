import { Navigate } from "react-router-dom";
import { canAccessOfficeBank } from "./auth";

type Props = {
  children: React.ReactNode;
};

export function OfficeBankGuard({ children }: Props) {
  if (!canAccessOfficeBank()) {
    return <Navigate to="/office/market" replace />;
  }
  return <>{children}</>;
}
