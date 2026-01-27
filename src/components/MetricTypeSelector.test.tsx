import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetricTypeSelector } from './MetricTypeSelector';

describe('MetricTypeSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all three metric type options', () => {
    render(
      <MetricTypeSelector
        selectedMetricType="count-with-average"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText('Average Duration')).toBeInTheDocument();
    expect(screen.getByLabelText('Total Count')).toBeInTheDocument();
    expect(screen.getByLabelText('Count & Average Duration')).toBeInTheDocument();
  });

  it('shows correct option as checked based on selectedMetricType', () => {
    render(
      <MetricTypeSelector
        selectedMetricType="average-duration"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText('Average Duration')).toBeChecked();
    expect(screen.getByLabelText('Total Count')).not.toBeChecked();
    expect(screen.getByLabelText('Count & Average Duration')).not.toBeChecked();
  });

  it('calls onChange with average-duration when that option is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MetricTypeSelector
        selectedMetricType="count"
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByLabelText('Average Duration'));
    expect(mockOnChange).toHaveBeenCalledWith('average-duration');
  });

  it('calls onChange with count when that option is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MetricTypeSelector
        selectedMetricType="average-duration"
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByLabelText('Total Count'));
    expect(mockOnChange).toHaveBeenCalledWith('count');
  });

  it('calls onChange with count-with-average when that option is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MetricTypeSelector
        selectedMetricType="count"
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByLabelText('Count & Average Duration'));
    expect(mockOnChange).toHaveBeenCalledWith('count-with-average');
  });

  it('renders the Metric Type legend', () => {
    render(
      <MetricTypeSelector
        selectedMetricType="count"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Metric Type')).toBeInTheDocument();
  });

  it('uses radio buttons for single selection', () => {
    render(
      <MetricTypeSelector
        selectedMetricType="count"
        onChange={mockOnChange}
      />
    );

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    radios.forEach(radio => {
      expect(radio).toHaveAttribute('name', 'metricType');
    });
  });
});
