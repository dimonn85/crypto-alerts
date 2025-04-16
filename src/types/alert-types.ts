export type AlertRule = 'Cheap order' | 'Solid order' | 'Big biznis here';

export type AlertType = 'cheap' | 'solid' | 'bigbiz';

export interface Alert {
  id: string;
  alertMessage: string;
  isNew?: boolean;
  price: number;
  quantity: number;
  rule: AlertRule;
  timestamp: number;
  total: number;
  type: AlertType;
}
