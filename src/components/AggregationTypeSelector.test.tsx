import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AggregationTypeSelector } from './AggregationTypeSelector';

describe('AggregationTypeSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all aggregation options for numeric metrics', async () => {
    const user = userEvent.setup();
    render(
      <AggregationTypeSelector
        metricType="duration"
        selectedAggregationType="average"
        onChange={mockOnChange}
      />
    );

    // Open the dropdown first
    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('option', { name: 'Count' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Average' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '95th Percentile' })).toBeInTheDocument();
  });

  it('shows only non-numeric metrics for string-based metrics', () => {
    render(
      <AggregationTypeSelector
        metricType="response.status"
        selectedAggregationType="count"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Count')).toBeInTheDocument();
    expect(screen.queryByText('Average')).not.toBeInTheDocument();
    expect(screen.queryByText('95th Percentile')).not.toBeInTheDocument();
  });

  it('calls onChange with p95 when that option is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AggregationTypeSelector
        metricType="duration"
        selectedAggregationType="average"
        onChange={mockOnChange}
      />
    );

    // Open the dropdown first
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '95th Percentile' }));
    expect(mockOnChange).toHaveBeenCalledWith('p95');
  });

  it('renders the Aggregation Type legend', () => {
    render(
      <AggregationTypeSelector
        metricType="duration"
        selectedAggregationType="average"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Aggregation Type')).toBeInTheDocument();
  });

  it('falls back to first available aggregation when selected type is not available for string fields', async () => {
    const user = userEvent.setup();
    render(
      <AggregationTypeSelector
        metricType="response.status"
        selectedAggregationType="average"
        onChange={mockOnChange}
      />
    );

    // 'average' is numerical-only and not available for string fields,
    // so it should fall back to the first available aggregation ('count')
    await user.click(screen.getByRole('combobox'));

    const options = screen.getAllByRole('option');
    const optionTexts = options.map((opt) => opt.textContent);
    expect(optionTexts).toContain('Count');
    expect(optionTexts).toContain('Unique List');
    expect(optionTexts).not.toContain('Average');
    expect(optionTexts).not.toContain('95th Percentile');
    expect(optionTexts).not.toContain('Median');
  });

  it('throws when given an unknown metricType', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() =>
      render(
        <AggregationTypeSelector
          metricType="nonexistent"
          selectedAggregationType="count"
          onChange={mockOnChange}
        />
      )
    ).toThrow('Unknown metricType');

    spy.mockRestore();
  });
});
