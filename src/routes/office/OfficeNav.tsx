import { NavLink, useNavigate } from "react-router-dom";
import { canAccessOfficeBank, getOfficeRole, setOfficeSession } from "./auth";
import styles from "./OfficeNav.module.css";

export function OfficeNav() {
  const nav = useNavigate();
  const showBank = canAccessOfficeBank(getOfficeRole());

  return (
    <div className={styles.bar}>
      <div className={styles.links}>
        {showBank ? (
          <NavLink className={styles.link} to="/office/bank">
            Bank
          </NavLink>
        ) : null}
        <NavLink className={styles.link} to="/office/market">
          Market
        </NavLink>
        <NavLink className={styles.link} to="/office/messages">
          Messages
        </NavLink>
      </div>
      <button
        type="button"
        className={styles.logout}
        onClick={() => {
          setOfficeSession(null);
          nav("/office/login", { replace: true });
        }}
      >
        Log out
      </button>
    </div>
  );
}
