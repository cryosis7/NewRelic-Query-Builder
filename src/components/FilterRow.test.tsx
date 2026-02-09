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
    negated: false,
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

  it('shows operator dropdown for all fields', () => {
    render(
      <FilterRow
        filter={createFilter({ field: 'response.status', value: '' })}
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

  it('renders filter value input when value is empty', () => {
    render(
      <FilterRow
        filter={createFilter({ value: '' })}
        metricItemId="metric-1"
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );

    const input = screen.getByLabelText('Value');
    expect(input).toHaveValue('');
  });

  it('renders filter value input when value is not empty', () => {
    render(
      <FilterRow
        filter={createFilter({ value: '0.5' })}
        metricItemId="metric-1"
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );

    const input = screen.getByLabelText('Value');
    expect(input).toHaveValue('0.5');
  });

  it('renders NOT toggle button', () => {
    render(
      <FilterRow
        filter={createFilter()}
        metricItemId="metric-1"
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /toggle not/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('calls onUpdate with negated toggle when NOT button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <FilterRow
        filter={createFilter({ negated: false })}
        metricItemId="metric-1"
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /toggle not/i });
    await user.click(toggleButton);

    expect(onUpdate).toHaveBeenCalledWith('metric-1', 'filter-1', { negated: true });
  });

  it('toggles negated from true to false when NOT button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <FilterRow
        filter={createFilter({ negated: true })}
        metricItemId="metric-1"
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /toggle not/i });
    await user.click(toggleButton);

    expect(onUpdate).toHaveBeenCalledWith('metric-1', 'filter-1', { negated: false });
  });

  it('shows appropriate placeholder for request.uri field', () => {
    render(
      <FilterRow
        filter={createFilter({ field: 'request.uri', operator: '=' })}
        metricItemId="metric-1"
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );
    const input = screen.getByPlaceholderText(/e\.g\. \/api\/endpoint/i);
    expect(input).toBeInTheDocument();
  });

  it('calls onUpdate with new field when a different field is selected', async () => {
    const user = userEvent.setup();
    render(
      <FilterRow
        filter={createFilter({ field: 'duration' })}
        metricItemId="metric-1"
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );
    const comboboxes = screen.getAllByRole('combobox');
    await user.click(comboboxes[0]);
    await user.click(screen.getByRole('option', { name: 'Response Status' }));
    expect(onUpdate).toHaveBeenCalledWith('metric-1', 'filter-1', { field: 'response.status' });
  });

  it('calls onUpdate with new operator when a different operator is selected', async () => {
    const user = userEvent.setup();
    render(
      <FilterRow
        filter={createFilter({ field: 'duration', operator: '>' })}
        metricItemId="metric-1"
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );
    const comboboxes = screen.getAllByRole('combobox');
    await user.click(comboboxes[1]);
    await user.click(screen.getByRole('option', { name: '>=' }));
    expect(onUpdate).toHaveBeenCalledWith('metric-1', 'filter-1', { operator: '>=' });
  });
});
