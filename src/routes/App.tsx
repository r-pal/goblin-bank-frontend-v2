import { Navigate, Route, Routes } from "react-router-dom";
import { ThemeOverrideButton } from "../components/ThemeOverrideButton";
import { TvScreen } from "./tv/TvScreen";
import { OfficeLayout } from "./office/OfficeLayout";
import { OfficeLogin } from "./office/OfficeLogin";
import { OfficeBank } from "./office/OfficeBank";
import { OfficeBankGuard } from "./office/OfficeBankGuard";
import { OfficeIndex } from "./office/OfficeIndex";
import { OfficeMarket } from "./office/OfficeMarket";
import { OfficeMessages } from "./office/OfficeMessages";

export function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/tv" replace />} />
        <Route path="/tv" element={<TvScreen />} />

        <Route path="/office" element={<OfficeLayout />}>
          <Route index element={<OfficeIndex />} />
          <Route path="login" element={<OfficeLogin />} />
          <Route
            path="bank"
            element={
              <OfficeBankGuard>
                <OfficeBank />
              </OfficeBankGuard>
            }
          />
          <Route path="market" element={<OfficeMarket />} />
          <Route path="messages" element={<OfficeMessages />} />
        </Route>

        <Route path="*" element={<Navigate to="/tv" replace />} />
      </Routes>
      <ThemeOverrideButton />
    </>
  );
}

