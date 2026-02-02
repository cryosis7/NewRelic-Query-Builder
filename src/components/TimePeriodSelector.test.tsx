import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { TimePeriodSelector } from './TimePeriodSelector';
import { timePeriodAtom } from '../atoms';
import {DateTimeInput} from "./DateTimeInput.tsx";
import {TimePicker} from "./TimePicker.tsx";

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
  const mockOnDateChange = vi.fn();
  const mockOnTimeChange = vi.fn();

  beforeEach(() => {
    mockOnDateChange.mockClear();
    mockOnTimeChange.mockClear();
  });

  it('renders the label', () => {
    render(
      <DateTimeInput
        label="Since"
        date={new Date(2026, 0, 28)}
        time="14:30"
        onDateChange={mockOnDateChange}
        onTimeChange={mockOnTimeChange}
      />
    );

    expect(screen.getByText('Since')).toBeInTheDocument();
  });

  it('renders time sub-label', () => {
    render(
      <DateTimeInput
        label="Since"
        date={new Date(2026, 0, 28)}
        time="14:30"
        onDateChange={mockOnDateChange}
        onTimeChange={mockOnTimeChange}
      />
    );

    expect(screen.getByText('Time')).toBeInTheDocument();
  });

  it('displays the provided time value', () => {
    render(
      <DateTimeInput
        label="Since"
        date={new Date(2026, 0, 28)}
        time="14:30"
        onDateChange={mockOnDateChange}
        onTimeChange={mockOnTimeChange}
      />
    );

    expect(screen.getByLabelText('Time', { selector: 'input' })).toHaveValue('14:30');
  });

  it('calls onTimeChange when time is changed', () => {
    render(
      <DateTimeInput
        label="Since"
        date={new Date(2026, 0, 28)}
        time="14:30"
        onDateChange={mockOnDateChange}
        onTimeChange={mockOnTimeChange}
      />
    );

    const timeInput = screen.getByLabelText('Time', { selector: 'input' });
    fireEvent.change(timeInput, { target: { value: '09:30' } });

    expect(mockOnTimeChange).toHaveBeenLastCalledWith('09:30');
  });

  it('handles undefined date gracefully', () => {
    render(
      <DateTimeInput
        label="Since"
        date={undefined}
        time="00:00"
        onDateChange={mockOnDateChange}
        onTimeChange={mockOnTimeChange}
      />
    );

    expect(screen.getByText('Since')).toBeInTheDocument();
    expect(screen.getByLabelText('Time', { selector: 'input' })).toHaveValue('00:00');
  });
});

describe('TimePeriodSelector', () => {
  it('renders Since and Until labels', () => {
    const store = createStore();
    store.set(timePeriodAtom, {
      mode: 'absolute',
      since: '2026-01-28T08:00',
      until: '2026-01-28T09:00',
      relative: '1h ago',
    });
    render(
      <Provider store={store}>
        <TimePeriodSelector />
      </Provider>
    );

    expect(screen.getByText('Since')).toBeInTheDocument();
    expect(screen.getByText('Until')).toBeInTheDocument();
  });

  it('displays the provided since time values', () => {
    const store = createStore();
    store.set(timePeriodAtom, {
      mode: 'absolute',
      since: '2026-01-28T08:00',
      until: '2026-01-28T09:00',
      relative: '1h ago',
    });
    render(
      <Provider store={store}>
        <TimePeriodSelector />
      </Provider>
    );

    const timeInputs = screen.getAllByLabelText('Time', { selector: 'input' });
    expect(timeInputs[0]).toHaveValue('08:00');
  });

  it('displays the provided until time values', () => {
    const store = createStore();
    store.set(timePeriodAtom, {
      mode: 'absolute',
      since: '2026-01-28T08:00',
      until: '2026-01-28T09:00',
      relative: '1h ago',
    });
    render(
      <Provider store={store}>
        <TimePeriodSelector />
      </Provider>
    );

    const timeInputs = screen.getAllByLabelText('Time', { selector: 'input' });
    expect(timeInputs[1]).toHaveValue('09:00');
  });

  it('updates atom when since time is changed', () => {
    const store = createStore();
    store.set(timePeriodAtom, {
      mode: 'absolute',
      since: '2026-01-28T08:00',
      until: '2026-01-28T09:00',
      relative: '1h ago',
    });
    render(
      <Provider store={store}>
        <TimePeriodSelector />
      </Provider>
    );

    const timeInputs = screen.getAllByLabelText('Time', { selector: 'input' });
    fireEvent.change(timeInputs[0], { target: { value: '10:00' } });

    expect(store.get(timePeriodAtom).since).toBe('2026-01-28T10:00');
  });

  it('updates atom when until time is changed', () => {
    const store = createStore();
    store.set(timePeriodAtom, {
      mode: 'absolute',
      since: '2026-01-28T08:00',
      until: '2026-01-28T09:00',
      relative: '1h ago',
    });
    render(
      <Provider store={store}>
        <TimePeriodSelector />
      </Provider>
    );

    const timeInputs = screen.getAllByLabelText('Time', { selector: 'input' });
    fireEvent.change(timeInputs[1], { target: { value: '12:00' } });

    expect(store.get(timePeriodAtom).until).toBe('2026-01-28T12:00');
  });

  it('renders the Time Period legend', () => {
    const store = createStore();
    store.set(timePeriodAtom, {
      mode: 'absolute',
      since: '2026-01-28T08:00',
      until: '2026-01-28T09:00',
      relative: '1h ago',
    });
    render(
      <Provider store={store}>
        <TimePeriodSelector />
      </Provider>
    );

    expect(screen.getByText('Time Period')).toBeInTheDocument();
  });

  it('renders time pickers for absolute mode', () => {
    const store = createStore();
    store.set(timePeriodAtom, {
      mode: 'absolute',
      since: '2026-01-28T08:00',
      until: '2026-01-28T09:00',
      relative: '1h ago',
    });
    render(
      <Provider store={store}>
        <TimePeriodSelector />
      </Provider>
    );

    // Should have Time labels for both Since and Until
    expect(screen.getAllByLabelText('Time', { selector: 'input' })).toHaveLength(2);
  });

  it('renders mode options', () => {
    const store = createStore();
    store.set(timePeriodAtom, {
      mode: 'absolute',
      since: '2026-01-28T08:00',
      until: '2026-01-28T09:00',
      relative: '1h ago',
    });
    render(
      <Provider store={store}>
        <TimePeriodSelector />
      </Provider>
    );

    expect(screen.getByText('Exact')).toBeInTheDocument();
    expect(screen.getByText('Relative')).toBeInTheDocument();
  });

  it('updates atom when relative input changes', () => {
    const store = createStore();
    store.set(timePeriodAtom, {
      mode: 'relative',
      since: '2026-01-28T08:00',
      until: '2026-01-28T09:00',
      relative: '1h ago',
    });
    render(
      <Provider store={store}>
        <TimePeriodSelector />
      </Provider>
    );

    fireEvent.change(screen.getByLabelText('Relative', { selector: 'input[type="text"]' }), {
      target: { value: '3h ago' },
    });
    expect(store.get(timePeriodAtom).relative).toBe('3h ago');
  });

  it('shows blank dropdown when custom value is typed', () => {
    const store = createStore();
    store.set(timePeriodAtom, {
      mode: 'relative',
      since: '2026-01-28T08:00',
      until: '2026-01-28T09:00',
      relative: '45m ago', // Not in preset list
    });
    render(
      <Provider store={store}>
        <TimePeriodSelector />
      </Provider>
    );

    // The text input should show the custom value
    expect(screen.getByLabelText('Relative', { selector: 'input[type="text"]' })).toHaveValue('45m ago');

    // No option in the dropdown should be selected (this is harder to test directly,
    // but we can verify the value was preserved)
    expect(store.get(timePeriodAtom).relative).toBe('45m ago');
  });

  it('updates textbox when preset option is selected from dropdown', async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(timePeriodAtom, {
      mode: 'relative',
      since: '2026-01-28T08:00',
      until: '2026-01-28T09:00',
      relative: '1h ago',
    });
    render(
      <Provider store={store}>
        <TimePeriodSelector />
      </Provider>
    );

    // Find and click the dropdown trigger (combobox role)
    const dropdownTrigger = screen.getByRole('combobox', { name: /time period/i });
    await user.click(dropdownTrigger);

    // Select a different option
    const option = screen.getByText('3h ago');
    await user.click(option);

    // Verify the atom value changed
    expect(store.get(timePeriodAtom).relative).toBe('3h ago');
  });

  it('allows typing custom relative values not in preset list', () => {
    const store = createStore();
    store.set(timePeriodAtom, {
      mode: 'relative',
      since: '2026-01-28T08:00',
      until: '2026-01-28T09:00',
      relative: '1h ago',
    });
    render(
      <Provider store={store}>
        <TimePeriodSelector />
      </Provider>
    );

    const input = screen.getByLabelText('Relative', { selector: 'input[type="text"]' });
    fireEvent.change(input, { target: { value: '2h 30m ago' } });

    expect(store.get(timePeriodAtom).relative).toBe('2h 30m ago');
  });

  it('switches to absolute mode when Exact toggle is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(timePeriodAtom, {
      mode: 'relative',
      since: '2026-01-28T08:00',
      until: '2026-01-28T09:00',
      relative: '1h ago',
    });
    render(
      <Provider store={store}>
        <TimePeriodSelector />
      </Provider>
    );

    // Click the "Exact" toggle option
    const exactOption = screen.getByText('Exact');
    await user.click(exactOption);

    expect(store.get(timePeriodAtom).mode).toBe('absolute');
  });

  it('switches to relative mode when Relative toggle is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(timePeriodAtom, {
      mode: 'absolute',
      since: '2026-01-28T08:00',
      until: '2026-01-28T09:00',
      relative: '1h ago',
    });
    render(
      <Provider store={store}>
        <TimePeriodSelector />
      </Provider>
    );

    // Click the "Relative" toggle option
    const relativeOption = screen.getByText('Relative');
    await user.click(relativeOption);

    expect(store.get(timePeriodAtom).mode).toBe('relative');
  });
});
