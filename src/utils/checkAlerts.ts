import { AlertRule } from "../types/alert-types.ts";
import { OrderMessage } from "../types/orders-types.ts";

export function getAlertRules(order: OrderMessage): AlertRule[] {
  const price = order.P;
  const quantity = order.Q;
  const total = price * quantity;
  const rules: AlertRule[] = [];

  if (price < 50000) rules.push('Cheap order');
  if (quantity > 10) rules.push('Solid order');
  if (total > 1_000_000) rules.push('Big biznis here');

  return rules;
}
