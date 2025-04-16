import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import OrderItem from './OrderItem';
import { OrderMessage } from '../../types/orders-types';
import styles from './OrderItem.module.scss';

describe('OrderItem', () => {
  const baseOrder: OrderMessage = {
    ACTION: 0,
    CCSEQ: 0,
    DELAYNS: 0,
    FSYM: 'BTC',
    M: 'Binance',
    P: 51000.25,
    Q: 0.5,
    REPORTEDNS: Date.now() * 1000000,
    SEQ: 12345,
    SIDE: 0,
    TSYM: 'USDT',
    TYPE: '8',
  };

  test('renders pair and exchange name', () => {
    render(<OrderItem order={baseOrder} />);
    expect(screen.getByTestId('pair-name')).toHaveTextContent('BTC/USDT');
    expect(screen.getByTestId('exchange')).toHaveTextContent('Binance');
  });

  test('shows BUY label for SIDE 0', () => {
    render(<OrderItem order={baseOrder} />);
    expect(screen.getByText('BUY')).toBeInTheDocument();
  });

  test('shows SELL label for SIDE 1', () => {
    const sellOrder = { ...baseOrder, SIDE: 1 };
    render(<OrderItem order={sellOrder} />);
    expect(screen.getByText('SELL')).toBeInTheDocument();
  });

  test('formats price, quantity and total', () => {
    render(<OrderItem order={baseOrder} />);
    expect(screen.getByTestId('price')).toHaveTextContent('51000.25');
    expect(screen.getByTestId('quantity')).toHaveTextContent('0.500000');
    expect(screen.getByTestId('total')).toHaveTextContent('$25,500.13');
  });

  test('adds alerting class if alert rule triggered', () => {
    const alertOrder = { ...baseOrder, P: 49000 };
    const { container } = render(<OrderItem order={alertOrder} />);
    expect(container.firstChild).toHaveClass(styles.alerting);
  });

  test('displays formatted timestamp', () => {
    const fixedTime = new Date('2025-04-15T15:30:00Z').getTime();
    const orderWithTimestamp = { ...baseOrder, REPORTEDNS: fixedTime * 1000000 };

    render(<OrderItem order={orderWithTimestamp} />);
    const expectedTime = new Date(fixedTime).toLocaleTimeString();
    expect(screen.getByText(expectedTime)).toBeInTheDocument();
  });

  test('applies buyOrder class for SIDE 0', () => {
    const { container } = render(<OrderItem order={baseOrder} />);
    expect(container.firstChild).toHaveClass(styles.buyOrder);
  });

  test('applies sellOrder class for SIDE 1', () => {
    const sellOrder = { ...baseOrder, SIDE: 1 };
    const { container } = render(<OrderItem order={sellOrder} />);
    expect(container.firstChild).toHaveClass(styles.sellOrder);
  });

  test('displays alert rules if present', () => {
    const alertOrder = { ...baseOrder, P: 49000, Q: 12 };

    render(<OrderItem order={alertOrder} />);
    const rulesContainer = screen.getByTestId('rules');

    expect(rulesContainer).toBeInTheDocument();
    expect(rulesContainer).toHaveTextContent('Cheap order');
    expect(rulesContainer).toHaveTextContent('Solid order');
  });
});
