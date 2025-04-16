import { createContext, useContext } from 'react';
import { Alert, AlertRule } from "../types/alert-types.ts";
import { OrderMessage } from "../types/orders-types.ts";

export interface AlertsContextProps {
  alerts: Alert[];
  counts: Record<AlertRule, number>;
  processOrders: (orders: OrderMessage[]) => void;
}

export const AlertsContext = createContext<AlertsContextProps | null>(null);

export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within AlertsProvider');
  }
  return context;
};
