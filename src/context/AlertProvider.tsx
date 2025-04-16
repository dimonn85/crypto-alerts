import { useEffect, useRef, useState, ReactNode } from 'react';
import { AlertsContext } from './AlertContext';
import { getAlertRules } from '../utils/checkAlerts';
import { Alert } from "../types/alert-types.ts";
import { OrderMessage } from "../types/orders-types.ts";

interface AlertsProviderProps {
  children: ReactNode;
  orders: OrderMessage[];
}

export const AlertsProvider = ({ children, orders }: AlertsProviderProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    processOrders(orders);
  }, [orders]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(prev =>
        prev.filter(alert => Date.now() - alert.timestamp <= 60000)
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const seenAlertIdsRef = useRef<Set<string>>(new Set());

  const processOrders = (orders: OrderMessage[]) => {
    const newAlerts: Alert[] = [];

    orders.forEach((order) => {
      const rules = getAlertRules(order);
      if (rules.length === 0) return;

      const timestamp = Date.now();
      const price = order.P;
      const quantity = order.Q;
      const total = price * quantity;

      rules.forEach((rule) => {
        const id = `${rule}-${order.SEQ}-${order.REPORTEDNS}`;
        if (seenAlertIdsRef.current.has(id)) return;
        seenAlertIdsRef.current.add(id);

        newAlerts.push({
          id,
          alertMessage: rule,
          isNew: true,
          price,
          quantity,
          rule,
          timestamp,
          total,
          type: rule === 'Cheap order' ? 'cheap' : rule === 'Solid order' ? 'solid' : 'bigbiz',
        });
      });
    });

    if (newAlerts.length > 0) {
      setAlerts(prev =>
        [...newAlerts, ...prev].filter(a => Date.now() - a.timestamp <= 60000)
      );

      setTimeout(() => {
        setAlerts(prev => prev.map(a => ({ ...a, isNew: false })));
      }, 500);
    }
  };

  const counts = {
    'Cheap order': alerts.filter(a => a.rule === 'Cheap order').length,
    'Solid order': alerts.filter(a => a.rule === 'Solid order').length,
    'Big biznis here': alerts.filter(a => a.rule === 'Big biznis here').length
  };

  return (
    <AlertsContext.Provider value={{ alerts, counts, processOrders }}>
      {children}
    </AlertsContext.Provider>
  );
};
