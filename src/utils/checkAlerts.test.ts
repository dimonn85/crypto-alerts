import { describe, test, expect } from 'vitest';
import { getAlertRules } from './checkAlerts';
import { OrderMessage } from '../types/orders-types';

const baseOrder: OrderMessage = {
  ACTION: 0,
  CCSEQ: 0,
  DELAYNS: 0,
  FSYM: 'BTC',
  M: 'Binance',
  P: 50000,
  Q: 1,
  REPORTEDNS: Date.now() * 1000000,
  SEQ: 12345,
  SIDE: 0,
  TSYM: 'USDT',
  TYPE: '8',
};

describe('getAlertRules', () => {
  test('returns Cheap order when price is below 50000', () => {
    const order = { ...baseOrder, P: 49999.99 };
    const rules = getAlertRules(order);
    expect(rules).toEqual(['Cheap order']);
  });

  test('does not return Cheap order when price is exactly 50000', () => {
    const order = { ...baseOrder, P: 50000 };
    const rules = getAlertRules(order);
    expect(rules).not.toContain('Cheap order');
  });

  test('returns Solid order when quantity is greater than 10', () => {
    const order = { ...baseOrder, Q: 10.01 };
    const rules = getAlertRules(order);
    expect(rules).toEqual(['Solid order']);
  });

  test('does not return Solid order when quantity is exactly 10', () => {
    const order = { ...baseOrder, Q: 10 };
    const rules = getAlertRules(order);
    expect(rules).not.toContain('Solid order');
  });

  test('returns Big biznis here and Solid order when total is over 1,000,000 and quantity > 10', () => {
    const order = { ...baseOrder, P: 50001, Q: 20 };
    const rules = getAlertRules(order);
    expect(rules).toEqual(expect.arrayContaining(['Solid order', 'Big biznis here']));
    expect(rules).toHaveLength(2);
  });

  test('does not return Big biznis here when total is exactly 1,000,000', () => {
    const order = { ...baseOrder, P: 50000, Q: 20 };
    const rules = getAlertRules(order);
    expect(rules).not.toContain('Big biznis here');
  });

  test('returns all rules when all conditions met', () => {
    const order = { ...baseOrder, P: 49000, Q: 25 };
    const rules = getAlertRules(order);
    expect(rules).toEqual(expect.arrayContaining(['Cheap order', 'Solid order', 'Big biznis here']));
    expect(rules).toHaveLength(3);
  });

  test('returns only Cheap and Solid when total is low', () => {
    const order = { ...baseOrder, P: 49000, Q: 10.5 };
    const rules = getAlertRules(order);
    expect(rules).toEqual(expect.arrayContaining(['Cheap order', 'Solid order']));
    expect(rules).not.toContain('Big biznis here');
  });

  test('returns only Solid and Big biznis when price is high', () => {
    const order = { ...baseOrder, P: 60000, Q: 20 };
    const rules = getAlertRules(order);
    expect(rules).toEqual(expect.arrayContaining(['Solid order', 'Big biznis here']));
    expect(rules).not.toContain('Cheap order');
  });

  test('returns empty array if no conditions met', () => {
    const order = { ...baseOrder, P: 50000, Q: 1 };
    const rules = getAlertRules(order);
    expect(rules).toEqual([]);
  });
});
