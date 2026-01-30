import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterRow } from './FilterRow';
import type { MetricFilter } from '../types/query';

function createFilter(overrides: Partial<MetricFilter> = {}): MetricFilter {
  return {
    id: 'filter-1',
    field: 'duration',
    operator: '>',
    value: '',
    ...overrides,
  };
}

describe('FilterRow', () => {
  const onUpdate = vi.fn();
  const onRemove = vi.fn();

  beforeEach(() => {
    onUpdate.mockClear();
    onRemove.mockClear();
  });

  it('shows appropriate placeholder for response.status field', () => {
    render(
      <FilterRow
        filter={createFilter({ field: 'response.status', value: '' })}
        metricItemId="metric-1"
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );

    const input = screen.getByPlaceholderText(/e\.g\. 404, 503 or 4xx, 5xx/i);
    expect(input).toBeInTheDocument();
  });

  it('shows appropriate placeholder for duration field', () => {
    render(
      <FilterRow
        filter={createFilter({ field: 'duration', value: '' })}
        metricItemId="metric-1"
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );

    const input = screen.getByPlaceholderText(/e\.g\. 0\.5/i);
    expect(input).toBeInTheDocument();
  });

  it('hides operator dropdown for response.status field', () => {
    render(
      <FilterRow
        filter={createFilter({ field: 'response.status', value: '' })}
        metricItemId="metric-1"
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );

    expect(screen.queryByText('Operator')).not.toBeInTheDocument();
  });

  it('shows operator dropdown for duration field', () => {
    render(
      <FilterRow
        filter={createFilter({ field: 'duration', value: '' })}
        metricItemId="metric-1"
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );

    expect(screen.getByText('Operator')).toBeInTheDocument();
  });

  it('renders empty filter value input', () => {
    render(
      <FilterRow
        filter={createFilter({ value: '' })}
        metricItemId="metric-1"
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );

    const input = screen.getByPlaceholderText(/e\.g\. 0\.5/i);
    expect(input).toHaveValue('');
  });

  it('calls onRemove when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <FilterRow
        filter={createFilter()}
        metricItemId="metric-1"
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );

    await user.click(screen.getByRole('button', { name: /remove filter/i }));
    expect(onRemove).toHaveBeenCalledWith('metric-1', 'filter-1');
  });

  it('calls onUpdate when value changes', async () => {
    const user = userEvent.setup();
    render(
      <FilterRow
        filter={createFilter({ value: '' })}
        metricItemId="metric-1"
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );

    const input = screen.getByPlaceholderText(/e\.g\. 0\.5/i);
    await user.type(input, '2');

    // Verify the handler was called with correct parameters
    expect(onUpdate).toHaveBeenCalledWith('metric-1', 'filter-1', { value: '2' });
  });

  it('renders filter value', () => {
    render(
      <FilterRow
        filter={createFilter({ value: '0.5' })}
        metricItemId="metric-1"
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );

    expect(screen.getByDisplayValue('0.5')).toBeInTheDocument();
  });

  it('shows validation message when filter value is empty', () => {
    render(
      <FilterRow
        filter={createFilter({ value: '' })}
        metricItemId="metric-1"
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );

    expect(screen.getByText('Empty filter will be ignored')).toBeInTheDocument();
  });

  it('does not show validation message when filter value is not empty', () => {
    render(
      <FilterRow
        filter={createFilter({ value: '0.5' })}
        metricItemId="metric-1"
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );

    expect(screen.queryByText('Empty filter will be ignored')).not.toBeInTheDocument();
  });
});
