import { render, screen, fireEvent } from '@testing-library/react';
import { TimePeriodSelector, TimePicker, DateTimeInput } from './TimePeriodSelector';

describe('TimePicker', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders a time input', () => {
    render(<TimePicker value="14:30" onChange={mockOnChange} />);

    const timeInput = screen.getByDisplayValue('14:30');
    expect(timeInput).toHaveAttribute('type', 'time');
  });

  it('displays the provided time value', () => {
    render(<TimePicker value="14:30" onChange={mockOnChange} />);

    expect(screen.getByDisplayValue('14:30')).toBeInTheDocument();
  });

  it('renders Time label', () => {
    render(<TimePicker value="08:00" onChange={mockOnChange} />);

    expect(screen.getByText('Time')).toBeInTheDocument();
  });

  it('calls onChange when time is changed', async () => {
    render(<TimePicker value="14:30" onChange={mockOnChange} />);

    const timeInput = screen.getByDisplayValue('14:30');
    fireEvent.change(timeInput, { target: { value: '09:45' } });

    expect(mockOnChange).toHaveBeenLastCalledWith('09:45');
  });

  it('defaults to 00:00 when invalid value provided', () => {
    render(<TimePicker value="" onChange={mockOnChange} />);

    expect(screen.getByDisplayValue('00:00')).toBeInTheDocument();
  });
});

describe('DateTimeInput', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders the label', () => {
    render(<DateTimeInput value="2026-01-28T14:30" onChange={mockOnChange} label="Since" />);

    expect(screen.getByText('Since')).toBeInTheDocument();
  });

  it('renders time sub-label', () => {
    render(<DateTimeInput value="2026-01-28T14:30" onChange={mockOnChange} label="Since" />);

    expect(screen.getByText('Time')).toBeInTheDocument();
  });

  it('displays the provided time values', () => {
    render(<DateTimeInput value="2026-01-28T14:30" onChange={mockOnChange} label="Since" />);

    expect(screen.getByLabelText('Time', { selector: 'input' })).toHaveValue('14:30');
  });

  it('calls onChange with updated time when changed', () => {
    render(<DateTimeInput value="2026-01-28T14:30" onChange={mockOnChange} label="Since" />);

    const timeInput = screen.getByLabelText('Time', { selector: 'input' });
    fireEvent.change(timeInput, { target: { value: '09:30' } });

    expect(mockOnChange).toHaveBeenLastCalledWith('2026-01-28T09:30');
  });

  it('handles empty value gracefully', () => {
    render(<DateTimeInput value="" onChange={mockOnChange} label="Since" />);

    expect(screen.getByText('Since')).toBeInTheDocument();
    expect(screen.getByLabelText('Time', { selector: 'input' })).toHaveValue('00:00');
  });

  it('applies the provided id to the container', () => {
    const { container } = render(
      <DateTimeInput value="2026-01-28T14:30" onChange={mockOnChange} label="Since" id="since-input" />
    );

    expect(container.querySelector('#since-input')).toBeInTheDocument();
  });
});

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
