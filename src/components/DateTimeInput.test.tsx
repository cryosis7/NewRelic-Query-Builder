import { render, screen, fireEvent } from '@testing-library/react';
import { DateTimeInput } from './DateTimeInput';

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
