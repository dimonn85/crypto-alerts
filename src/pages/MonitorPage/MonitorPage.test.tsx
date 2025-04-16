import { render, screen } from '@testing-library/react';
import { describe, test, expect, beforeEach } from 'vitest';
import { MonitorPage } from './MonitorPage';
import { OrderMessage } from '../../types/orders-types';

const mockOrders: OrderMessage[] = [
  {
    ACTION: 0,
    CCSEQ: 0,
    DELAYNS: 0,
    FSYM: 'BTC',
    M: 'Binance',
    P: 50000,
    Q: 0.25,
    REPORTEDNS: Date.now() * 1000000,
    SEQ: 12345,
    SIDE: 0,
    TSYM: 'USDT',
    TYPE: '8',
  },
];

describe('MonitorPage', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 800 });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 800 });
  });

  test('renders order items when orders are provided', () => {
    render(<MonitorPage orders={mockOrders} disableVirtualization />);
    expect(screen.getAllByTestId('order-item')).toHaveLength(mockOrders.length);
    expect(screen.getByTestId('pair-name')).toHaveTextContent('BTC/USDT');
    expect(screen.getByTestId('exchange')).toHaveTextContent('Binance');
    expect(screen.getByTestId('price')).toHaveTextContent('50000.00');
    expect(screen.getByTestId('quantity')).toHaveTextContent('0.250000');
    expect(screen.getByTestId('total')).toHaveTextContent('$12,500.00');
    expect(screen.getByTestId('side')).toHaveTextContent('BUY');
  });

  test('renders empty state message when no orders', () => {
    render(<MonitorPage orders={[]} disableVirtualization />);
    expect(screen.getByText('No orders to display')).toBeInTheDocument();
    expect(screen.getByText(/Start the stream/i)).toBeInTheDocument();
  });

  test('renders SELL side indicator', () => {
    const sellOrder = [{ ...mockOrders[0], SIDE: 1 }];
    render(<MonitorPage orders={sellOrder} disableVirtualization />);
    expect(screen.getByTestId('side')).toHaveTextContent('SELL');
  });

  test('renders correct timestamp', () => {
    const fixedTime = new Date('2025-04-15T15:30:00Z').getTime();
    const orderWithTimestamp = [{ ...mockOrders[0], REPORTEDNS: fixedTime * 1000000 }];
    render(<MonitorPage orders={orderWithTimestamp} disableVirtualization />);
    const expectedTime = new Date(fixedTime).toLocaleTimeString();
    expect(screen.getByTestId('timestamp')).toHaveTextContent(expectedTime);
  });
});
