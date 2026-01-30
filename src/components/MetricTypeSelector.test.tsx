import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetricTypeSelector } from './MetricTypeSelector';

describe('MetricTypeSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all metric type options', async () => {
    const user = userEvent.setup();
    render(
      <MetricTypeSelector
        selectedMetricType="duration"
        onChange={mockOnChange}
      />
    );

    // Open the dropdown first
    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('option', { name: 'Duration' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Response Status' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Request URI' })).toBeInTheDocument();
  });

  it('calls onChange with duration when that option is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MetricTypeSelector
        selectedMetricType="response.status"
        onChange={mockOnChange}
      />
    );

    // Open the dropdown first
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Duration' }));
    expect(mockOnChange).toHaveBeenCalledWith('duration');
  });

  it('calls onChange with request.uri when that option is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MetricTypeSelector
        selectedMetricType="duration"
        onChange={mockOnChange}
      />
    );

    // Open the dropdown first
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Request URI' }));
    expect(mockOnChange).toHaveBeenCalledWith('request.uri');
  });

  it('calls onChange with response.status when that option is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MetricTypeSelector
        selectedMetricType="duration"
        onChange={mockOnChange}
      />
    );

    // Open the dropdown first
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Response Status' }));
    expect(mockOnChange).toHaveBeenCalledWith('response.status');
  });

  it('renders the Metric Type legend', () => {
    render(
      <MetricTypeSelector
        selectedMetricType="duration"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Metric Type')).toBeInTheDocument();
  });
});
