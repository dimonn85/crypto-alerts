import { render, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { AlertsProvider } from './AlertProvider';
import { AlertsContext, AlertsContextProps } from './AlertContext';
import { OrderMessage } from '../types/orders-types';

vi.mock('../utils/checkAlerts', () => ({
  getAlertRules: (order: OrderMessage) => {
    const rules = [];
    if (order.P < 50000) rules.push('Cheap order');
    if (order.Q > 10) rules.push('Solid order');
    if (order.P * order.Q > 1_000_000) rules.push('Big biznis here');
    return rules;
  },
}));

const generateOrder = (price: number, quantity: number): OrderMessage => ({
  ACTION: 0,
  CCSEQ: 0,
  DELAYNS: 0,
  FSYM: 'BTC',
  M: 'Binance',
  P: price,
  Q: quantity,
  REPORTEDNS: Date.now() * 1000000,
  SEQ: Math.floor(Math.random() * 100000),
  SIDE: 0,
  TSYM: 'USDT',
  TYPE: '8',
});

describe('AlertsProvider', () => {
  let context: AlertsContextProps;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('generates all 3 types of alerts and updates counters correctly', () => {
    const order = generateOrder(49000, 25);

    render(
      <AlertsProvider orders={[order]}>
        <AlertsContext.Consumer>
          {value => {
            if (value) context = value;
            return <div>Test</div>;
          }}
        </AlertsContext.Consumer>
      </AlertsProvider>
    );

    expect(context.alerts).toHaveLength(3);
    expect(context.counts['Cheap order']).toBe(1);
    expect(context.counts['Solid order']).toBe(1);
    expect(context.counts['Big biznis here']).toBe(1);
    expect(context.alerts.every(a => a.isNew)).toBe(true);
  });

  test('removes isNew flag after 500ms', () => {
    const order = generateOrder(40000, 5);

    render(
      <AlertsProvider orders={[order]}>
        <AlertsContext.Consumer>
          {value => {
            if (value) context = value;
            return <div>Test</div>;
          }}
        </AlertsContext.Consumer>
      </AlertsProvider>
    );

    expect(context.alerts[0].isNew).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(context.alerts[0].isNew).toBe(false);
  });

  test('removes alerts after 60 seconds', () => {
    const order = generateOrder(45000, 12);

    render(
      <AlertsProvider orders={[order]}>
        <AlertsContext.Consumer>
          {value => {
            if (value) context = value;
            return <div>Test</div>;
          }}
        </AlertsContext.Consumer>
      </AlertsProvider>
    );

    expect(context.alerts).toHaveLength(2);

    act(() => {
      vi.advanceTimersByTime(61000);
    });

    expect(context.alerts).toHaveLength(0);
    expect(context.counts['Cheap order']).toBe(0);
    expect(context.counts['Solid order']).toBe(0);
  });

  test('does not create duplicate alerts for the same order', () => {
    const order = generateOrder(49000, 25);

    render(
      <AlertsProvider orders={[order, order]}>
        <AlertsContext.Consumer>
          {value => {
            if (value) context = value;
            return <div>Test</div>;
          }}
        </AlertsContext.Consumer>
      </AlertsProvider>
    );

    expect(context.alerts).toHaveLength(3);
  });
});
