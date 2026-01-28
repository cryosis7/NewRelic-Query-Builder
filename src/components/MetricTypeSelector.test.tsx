import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetricTypeSelector } from './MetricTypeSelector';

describe('MetricTypeSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all metric type options', () => {
    render(
      <MetricTypeSelector
        selectedMetricType="transaction-count"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Transaction')).toBeInTheDocument();
    expect(screen.getByText('2XX Count')).toBeInTheDocument();
    expect(screen.getByText('4XX Count')).toBeInTheDocument();
    expect(screen.getByText('5XX Count')).toBeInTheDocument();
  });

  it('calls onChange with duration when that option is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MetricTypeSelector
        selectedMetricType="transaction-count"
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByText('Duration'));
    expect(mockOnChange).toHaveBeenCalledWith('duration');
  });

  it('calls onChange with count when that option is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MetricTypeSelector
        selectedMetricType="duration"
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByText('Transaction'));
    expect(mockOnChange).toHaveBeenCalledWith('transaction-count');
  });

  it('calls onChange with status-4xx when that option is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MetricTypeSelector
        selectedMetricType="transaction-count"
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByText('4XX Count'));
    expect(mockOnChange).toHaveBeenCalledWith('status-4xx');
  });

  it('renders the Metric Type legend', () => {
    render(
      <MetricTypeSelector
        selectedMetricType="transaction-count"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Metric Type')).toBeInTheDocument();
  });
});
