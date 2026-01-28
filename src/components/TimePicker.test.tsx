import { render, screen, fireEvent } from '@testing-library/react';
import { TimePicker } from './TimePicker';

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

  it('renders optional label when provided', () => {
    render(<TimePicker value="08:00" onChange={mockOnChange} label="Start Time" />);

    expect(screen.getByText('Start Time')).toBeInTheDocument();
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
