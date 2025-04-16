import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import { Navigation } from './Navigation';

describe('Navigation', () => {
  test('renders Monitor and Alerts links', () => {
    render(<Navigation streamStarted={false} onToggleStream={() => {}} />, {
      wrapper: MemoryRouter,
    });

    expect(screen.getByText('Monitor')).toBeInTheDocument();
    expect(screen.getByText('Alerts')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Stream/i })).toBeInTheDocument();
  });

  test('renders Stop Stream button if stream is active', () => {
    render(<Navigation streamStarted={true} onToggleStream={() => {}} />, {
      wrapper: MemoryRouter,
    });

    expect(screen.getByRole('button', { name: /Stop Stream/i })).toBeInTheDocument();
  });

  test('calls onToggleStream when stream button clicked', () => {
    const onToggle = vi.fn();

    render(<Navigation streamStarted={false} onToggleStream={onToggle} />, {
      wrapper: MemoryRouter,
    });

    fireEvent.click(screen.getByRole('button', { name: /Start Stream/i }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
