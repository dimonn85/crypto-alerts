import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

vi.mock('./hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    isConnected: false,
    orders: [],
    startStream: vi.fn(),
    stopStream: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('App', () => {
  test('renders MonitorPage by default', () => {
    render(<App />);
    expect(screen.getByText('No orders to display')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start stream/i })).toBeInTheDocument();
  });

  test('renders Navigation with links', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /monitor/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /alerts/i })).toBeInTheDocument();
  });

  test('navigates to AlertsPage after clicking Alerts link', async () => {
    const user = userEvent.setup();
    render(<App />);

    const alertsLink = screen.getByRole('link', { name: /alerts/i });
    await user.click(alertsLink);

    expect(await screen.findByText('Alert Summary')).toBeInTheDocument();
  });
});
