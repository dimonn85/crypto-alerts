import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { within } from '@testing-library/react';
import { AlertsPage } from './AlertsPage';
import { AlertsContext } from '../../context/AlertContext';
import { Alert } from '../../types/alert-types';

const mockAlerts: Alert[] = [
  {
    id: 'cheap-1',
    rule: 'Cheap order',
    alertMessage: 'Cheap order',
    price: 48000,
    quantity: 1,
    total: 48000,
    timestamp: Date.now(),
    type: 'cheap',
    isNew: true,
  },
  {
    id: 'solid-2',
    rule: 'Solid order',
    alertMessage: 'Solid order',
    price: 52000,
    quantity: 12,
    total: 624000,
    timestamp: Date.now(),
    type: 'solid',
    isNew: false,
  },
];

const renderWithProvider = (alerts: Alert[] = []) => {
  return render(
    <AlertsContext.Provider
      value={{
        alerts,
        counts: {
          'Cheap order': alerts.filter((a) => a.rule === 'Cheap order').length,
          'Solid order': alerts.filter((a) => a.rule === 'Solid order').length,
          'Big biznis here': alerts.filter((a) => a.rule === 'Big biznis here').length,
        },
        processOrders: () => {},
      }}
    >
      <AlertsPage />
    </AlertsContext.Provider>
  );
};

describe('AlertsPage', () => {
  test('renders headings and alert summary', () => {
    renderWithProvider(mockAlerts);
    expect(screen.getByText('Alert Summary')).toBeInTheDocument();
    expect(screen.getByText('Cheap order:')).toBeInTheDocument();
    expect(screen.getByText('Solid order:')).toBeInTheDocument();
    expect(screen.getByText('Big biznis here:')).toBeInTheDocument();
  });

  test('renders alerts grouped by rule', () => {
    renderWithProvider(mockAlerts);

    const cheapBlock = screen.getByRole('heading', { name: 'Cheap order' }).closest('div');
    const solidBlock = screen.getByRole('heading', { name: 'Solid order' }).closest('div');

    const cheapRow = within(cheapBlock!).getByRole('row', {
      name: /cheap order.*\$48,000\.00.*1\.00000000.*\$48,000\.00/i,
    });

    const cells = within(cheapRow).getAllByRole('cell');
    expect(cells[1]).toHaveTextContent('$48,000.00');
    expect(cells[2]).toHaveTextContent('1.00000000');
    expect(cells[3]).toHaveTextContent('$48,000.00');

    const solidRow = within(solidBlock!).getByRole('row', {
      name: /solid order.*\$52,000\.00.*12\.00000000.*\$624,000\.00/i,
    });

    const solidCells = within(solidRow).getAllByRole('cell');
    expect(solidCells[1]).toHaveTextContent('$52,000.00');
    expect(solidCells[2]).toHaveTextContent('12.00000000');
    expect(solidCells[3]).toHaveTextContent('$624,000.00');
  });

  test('renders "no alerts" message three times if all rules are empty', () => {
    renderWithProvider([]);

    const messages = screen.getAllByText(/no alerts for this rule/i);
    expect(messages).toHaveLength(3);
  });

  test('applies newAlert class to new alerts', () => {
    renderWithProvider(mockAlerts);
    const newAlertRow = screen.getByTestId('new-alert');
    expect(newAlertRow).toBeInTheDocument();
  });

  test('displays correct alert counts in summary', () => {
    renderWithProvider(mockAlerts);

    const listItems = screen.getAllByRole('listitem');
    const cheap = listItems.find(li => li.textContent?.includes('Cheap order'));
    const solid = listItems.find(li => li.textContent?.includes('Solid order'));
    const bigbiz = listItems.find(li => li.textContent?.includes('Big biznis here'));

    expect(cheap).toHaveTextContent('Cheap order: 1');
    expect(solid).toHaveTextContent('Solid order: 1');
    expect(bigbiz).toHaveTextContent('Big biznis here: 0');
  });

});
