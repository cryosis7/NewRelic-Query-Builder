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

  it('renders Since and Until input fields', () => {
    render(
      <TimePeriodSelector {...defaultProps} />
    );

    expect(screen.getByLabelText('Since')).toBeInTheDocument();
    expect(screen.getByLabelText('Until')).toBeInTheDocument();
  });

  it('displays the provided since value', () => {
    render(
      <TimePeriodSelector {...defaultProps} />
    );

    expect(screen.getByLabelText('Since')).toHaveValue('2026-01-28T08:00');
  });

  it('displays the provided until value', () => {
    render(
      <TimePeriodSelector {...defaultProps} />
    );

    expect(screen.getByLabelText('Until')).toHaveValue('2026-01-28T09:00');
  });

  it('calls onSinceChange when since input value changes', () => {
    render(
      <TimePeriodSelector {...defaultProps} />
    );

    fireEvent.change(screen.getByLabelText('Since'), { target: { value: '2026-01-28T10:00' } });
    expect(mockOnSinceChange).toHaveBeenCalledWith('2026-01-28T10:00');
  });

  it('calls onUntilChange when until input value changes', () => {
    render(
      <TimePeriodSelector {...defaultProps} />
    );

    fireEvent.change(screen.getByLabelText('Until'), { target: { value: '2026-01-28T12:00' } });
    expect(mockOnUntilChange).toHaveBeenCalledWith('2026-01-28T12:00');
  });

  it('renders the Time Period legend', () => {
    render(
      <TimePeriodSelector {...defaultProps} />
    );

    expect(screen.getByText('Time Period')).toBeInTheDocument();
  });

  it('uses text input type', () => {
    render(
      <TimePeriodSelector {...defaultProps} />
    );

    expect(screen.getByLabelText('Since')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Until')).toHaveAttribute('type', 'text');
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
