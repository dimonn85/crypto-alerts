import { FC } from "react";
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import styles from './Navigation.module.scss';

interface NavigationProps {
  streamStarted: boolean;
  onToggleStream: () => void;
}

export const Navigation: FC<NavigationProps> = ({ streamStarted, onToggleStream }) => {
  return (
    <nav className={styles.navbar}>
      <div className="container">
        <div className={styles.navbarInner}>
          <ul className={styles.navLinks}>
            <li>
              <NavLink
                to="/monitor"
                className={({ isActive }) =>
                  classNames(styles.link, { [styles.active]: isActive })
                }
              >
                Monitor
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/alerts"
                className={({ isActive }) =>
                  classNames(styles.link, { [styles.active]: isActive })
                }
              >
                Alerts
              </NavLink>
            </li>
          </ul>
          <button onClick={onToggleStream} className={styles.toggleButton}>
            {streamStarted ? 'Stop Stream' : 'Start Stream'}
          </button>
        </div>
      </div>
    </nav>
  );
};
