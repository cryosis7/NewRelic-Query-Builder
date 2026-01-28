import { render, screen, fireEvent } from '@testing-library/react';
import { TimePeriodSelector } from './TimePeriodSelector';

describe('TimePeriodSelector', () => {
  const mockOnSinceChange = vi.fn();
  const mockOnUntilChange = vi.fn();
  const mockOnModeChange = vi.fn();
  const mockOnRelativeChange = vi.fn();
  const defaultProps = {
    mode: 'absolute' as const,
    since: '2026-01-28T08:00',
    until: '2026-01-28T09:00',
    relative: '1h ago',
    onModeChange: mockOnModeChange,
    onSinceChange: mockOnSinceChange,
    onUntilChange: mockOnUntilChange,
    onRelativeChange: mockOnRelativeChange,
  };

  beforeEach(() => {
    mockOnSinceChange.mockClear();
    mockOnUntilChange.mockClear();
    mockOnModeChange.mockClear();
    mockOnRelativeChange.mockClear();
  });

  it('renders Since and Until labels', () => {
    render(
      <TimePeriodSelector {...defaultProps} />
    );

    expect(screen.getByText('Since')).toBeInTheDocument();
    expect(screen.getByText('Until')).toBeInTheDocument();
  });

  it('displays the provided since time values', () => {
    render(
      <TimePeriodSelector {...defaultProps} />
    );

    const timeInputs = screen.getAllByLabelText('Time', { selector: 'input' });
    expect(timeInputs[0]).toHaveValue('08:00');
  });

  it('displays the provided until time values', () => {
    render(
      <TimePeriodSelector {...defaultProps} />
    );

    const timeInputs = screen.getAllByLabelText('Time', { selector: 'input' });
    expect(timeInputs[1]).toHaveValue('09:00');
  });

  it('calls onSinceChange when since time is changed', () => {
    render(
      <TimePeriodSelector {...defaultProps} />
    );

    const timeInputs = screen.getAllByLabelText('Time', { selector: 'input' });
    fireEvent.change(timeInputs[0], { target: { value: '10:00' } });

    expect(mockOnSinceChange).toHaveBeenLastCalledWith('2026-01-28T10:00');
  });

  it('calls onUntilChange when until time is changed', () => {
    render(
      <TimePeriodSelector {...defaultProps} />
    );

    const timeInputs = screen.getAllByLabelText('Time', { selector: 'input' });
    fireEvent.change(timeInputs[1], { target: { value: '12:00' } });

    expect(mockOnUntilChange).toHaveBeenLastCalledWith('2026-01-28T12:00');
  });

  it('renders the Time Period legend', () => {
    render(
      <TimePeriodSelector {...defaultProps} />
    );

    expect(screen.getByText('Time Period')).toBeInTheDocument();
  });

  it('renders time pickers for absolute mode', () => {
    render(
      <TimePeriodSelector {...defaultProps} />
    );

    // Should have Time labels for both Since and Until
    expect(screen.getAllByLabelText('Time', { selector: 'input' })).toHaveLength(2);
  });

  it('renders mode options', () => {
    render(
      <TimePeriodSelector {...defaultProps} />
    );

    expect(screen.getByText('Exact')).toBeInTheDocument();
    expect(screen.getByText('Relative')).toBeInTheDocument();
  });

  it('calls onRelativeChange when relative input changes', () => {
    render(
      <TimePeriodSelector
        {...defaultProps}
        mode="relative"
      />
    );

    fireEvent.change(screen.getByLabelText('Relative', { selector: 'input[type="text"]' }), {
      target: { value: '3h ago' },
    });
    expect(mockOnRelativeChange).toHaveBeenCalledWith('3h ago');
  });
});
