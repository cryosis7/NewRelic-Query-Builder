import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AggregationTypeSelector } from './AggregationTypeSelector';

describe('AggregationTypeSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all aggregation options', async () => {
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

  it('shows only Count for non-duration metrics', () => {
    render(
      <AggregationTypeSelector
        metricType="transaction-count"
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
});
