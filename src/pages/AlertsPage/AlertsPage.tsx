import { FC } from 'react';
import classNames from 'classnames';
import styles from './AlertsPage.module.scss';
import { useAlerts } from '../../context/AlertContext';
import { AlertRule } from "../../types/alert-types.ts";

export const AlertsPage: FC = () => {
  const { alerts, counts } = useAlerts();

  const rules: AlertRule[] = ['Cheap order', 'Solid order', 'Big biznis here'];

  return (
    <div className="container">
      <h2 className={styles.title}>Alert Summary</h2>
      <ul className={styles.counterList}>
        {rules.map(rule => (
          <li key={rule}>
            {rule}: <span>{counts[rule]}</span>
          </li>
        ))}
      </ul>

      <hr className={styles.separator} />

      {rules.map(rule => {
        const ruleAlerts = alerts.filter(a => a.rule === rule);

        return (
          <div key={rule} className={styles.alertBlock}>
            <h4 className={styles.subtitle}>{rule}</h4>
            {ruleAlerts.length > 0 ? (
              <table className={styles.table}>
                <thead>
                <tr>
                  <th>Alert</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
                </thead>
                <tbody>
                {ruleAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className={classNames(styles.alertRow, styles[alert.type], {
                      [styles.newAlert]: alert.isNew,
                    })}
                    data-testid={alert.isNew ? 'new-alert' : 'alert-row'}
                  >
                    <td>{alert.alertMessage}</td>
                    <td>${alert.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td>{alert.quantity.toLocaleString(undefined, { minimumFractionDigits: 8 })}</td>
                    <td>${alert.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.noAlerts}>No alerts for this rule in the last minute.</div>
            )}
          </div>
        );
      })}
    </div>
  );
};
