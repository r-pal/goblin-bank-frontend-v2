import { NavLink, useNavigate } from "react-router-dom";
import { setOfficeAuthed } from "./auth";
import styles from "./OfficeNav.module.css";

export function OfficeNav() {
  const nav = useNavigate();
  return (
    <div className={styles.bar}>
      <div className={styles.links}>
        <NavLink className={styles.link} to="/office/bank">
          Bank
        </NavLink>
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
          setOfficeAuthed(false);
          nav("/office/login", { replace: true });
        }}
      >
        Log out
      </button>
    </div>
  );
}

