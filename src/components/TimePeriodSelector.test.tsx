import { render, screen, fireEvent } from '@testing-library/react';
import { TimePeriodSelector } from './TimePeriodSelector';

describe('TimePeriodSelector', () => {
  const mockOnSinceChange = vi.fn();
  const mockOnUntilChange = vi.fn();

  beforeEach(() => {
    mockOnSinceChange.mockClear();
    mockOnUntilChange.mockClear();
  });

  it('renders Since and Until input fields', () => {
    render(
      <TimePeriodSelector
        since="2026-01-28T08:00"
        until="2026-01-28T09:00"
        onSinceChange={mockOnSinceChange}
        onUntilChange={mockOnUntilChange}
      />
    );

    expect(screen.getByLabelText('Since')).toBeInTheDocument();
    expect(screen.getByLabelText('Until')).toBeInTheDocument();
  });

  it('displays the provided since value', () => {
    render(
      <TimePeriodSelector
        since="2026-01-28T08:00"
        until="2026-01-28T09:00"
        onSinceChange={mockOnSinceChange}
        onUntilChange={mockOnUntilChange}
      />
    );

    expect(screen.getByLabelText('Since')).toHaveValue('2026-01-28T08:00');
  });

  it('displays the provided until value', () => {
    render(
      <TimePeriodSelector
        since="2026-01-28T08:00"
        until="2026-01-28T09:00"
        onSinceChange={mockOnSinceChange}
        onUntilChange={mockOnUntilChange}
      />
    );

    expect(screen.getByLabelText('Until')).toHaveValue('2026-01-28T09:00');
  });

  it('calls onSinceChange when since input value changes', () => {
    render(
      <TimePeriodSelector
        since="2026-01-28T08:00"
        until="2026-01-28T09:00"
        onSinceChange={mockOnSinceChange}
        onUntilChange={mockOnUntilChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Since'), { target: { value: '2026-01-28T10:00' } });
    expect(mockOnSinceChange).toHaveBeenCalledWith('2026-01-28T10:00');
  });

  it('calls onUntilChange when until input value changes', () => {
    render(
      <TimePeriodSelector
        since="2026-01-28T08:00"
        until="2026-01-28T09:00"
        onSinceChange={mockOnSinceChange}
        onUntilChange={mockOnUntilChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Until'), { target: { value: '2026-01-28T12:00' } });
    expect(mockOnUntilChange).toHaveBeenCalledWith('2026-01-28T12:00');
  });

  it('renders the Time Period legend', () => {
    render(
      <TimePeriodSelector
        since="2026-01-28T08:00"
        until="2026-01-28T09:00"
        onSinceChange={mockOnSinceChange}
        onUntilChange={mockOnUntilChange}
      />
    );

    expect(screen.getByText('Time Period')).toBeInTheDocument();
  });

  it('uses text input type', () => {
    render(
      <TimePeriodSelector
        since="2026-01-28T08:00"
        until="2026-01-28T09:00"
        onSinceChange={mockOnSinceChange}
        onUntilChange={mockOnUntilChange}
      />
    );

    expect(screen.getByLabelText('Since')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Until')).toHaveAttribute('type', 'text');
  });
});
