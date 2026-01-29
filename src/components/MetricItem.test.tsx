import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetricItem } from './MetricItem';
import type { MetricFilter, MetricQueryItem } from '../types/query';

function createFilter(overrides: Partial<MetricFilter> = {}): MetricFilter {
  return {
    id: 'filter-1',
    field: 'duration',
    operator: '>',
    value: '',
    ...overrides,
  };
}

function createItem(overrides: Partial<MetricQueryItem> = {}): MetricQueryItem {
  return {
    id: 'metric-1',
    metricType: 'transaction-count',
    aggregationType: 'count',
    filters: [],
    ...overrides,
  };
}

describe('MetricItem', () => {
  const onRemoveItem = vi.fn();
  const onUpdateItem = vi.fn();
  const onAddFilter = vi.fn();
  const onUpdateFilter = vi.fn();
  const onRemoveFilter = vi.fn();

  beforeEach(() => {
    onRemoveItem.mockClear();
    onUpdateItem.mockClear();
    onAddFilter.mockClear();
    onUpdateFilter.mockClear();
    onRemoveFilter.mockClear();
  });

  it('renders metric label with index', () => {
    render(
      <MetricItem
        item={createItem()}
        index={0}
        isSingleItem={false}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
        onAddFilter={onAddFilter}
        onUpdateFilter={onUpdateFilter}
        onRemoveFilter={onRemoveFilter}
      />
    );

    expect(screen.getByText('Metric 1')).toBeInTheDocument();
  });

  it('does not render remove button when isSingleItem is true', () => {
    render(
      <MetricItem
        item={createItem()}
        index={0}
        isSingleItem={true}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
        onAddFilter={onAddFilter}
        onUpdateFilter={onUpdateFilter}
        onRemoveFilter={onRemoveFilter}
      />
    );

    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
  });

  it('enables remove button when isSingleItem is false', () => {
    render(
      <MetricItem
        item={createItem()}
        index={0}
        isSingleItem={false}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
        onAddFilter={onAddFilter}
        onUpdateFilter={onUpdateFilter}
        onRemoveFilter={onRemoveFilter}
      />
    );

    expect(screen.getByRole('button', { name: /remove/i })).not.toBeDisabled();
  });

  it('calls onAddFilter when Add filter is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MetricItem
        item={createItem()}
        index={0}
        isSingleItem={false}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
        onAddFilter={onAddFilter}
        onUpdateFilter={onUpdateFilter}
        onRemoveFilter={onRemoveFilter}
      />
    );

    await user.click(screen.getByRole('button', { name: /add filter/i }));
    expect(onAddFilter).toHaveBeenCalledWith('metric-1');
  });

  it('renders filter rows when filters are present', () => {
    render(
      <MetricItem
        item={createItem({ filters: [createFilter({ value: '0.5' })] })}
        index={0}
        isSingleItem={false}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
        onAddFilter={onAddFilter}
        onUpdateFilter={onUpdateFilter}
        onRemoveFilter={onRemoveFilter}
      />
    );

    expect(screen.getByDisplayValue('0.5')).toBeInTheDocument();
    expect(screen.getByLabelText('Field')).toBeInTheDocument();
  });

  it('does not render filter rows when no filters', () => {
    render(
      <MetricItem
        item={createItem({ filters: [] })}
        index={0}
        isSingleItem={false}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
        onAddFilter={onAddFilter}
        onUpdateFilter={onUpdateFilter}
        onRemoveFilter={onRemoveFilter}
      />
    );

    expect(screen.queryByLabelText('Field')).not.toBeInTheDocument();
  });

  it('renders multiple filters', () => {
    render(
      <MetricItem
        item={createItem({
          filters: [
            createFilter({ id: 'filter-1', field: 'duration', value: '0.5' }),
            createFilter({ id: 'filter-2', field: 'response.status', value: '200' }),
          ],
        })}
        index={0}
        isSingleItem={false}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
        onAddFilter={onAddFilter}
        onUpdateFilter={onUpdateFilter}
        onRemoveFilter={onRemoveFilter}
      />
    );

    expect(screen.getByDisplayValue('0.5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('200')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /remove filter/i })).toHaveLength(2);
  });

  it('calls onRemoveItem when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MetricItem
        item={createItem()}
        index={0}
        isSingleItem={false}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
        onAddFilter={onAddFilter}
        onUpdateFilter={onUpdateFilter}
        onRemoveFilter={onRemoveFilter}
      />
    );

    await user.click(screen.getByRole('button', { name: /remove/i }));
    expect(onRemoveItem).toHaveBeenCalledWith('metric-1');
  });
});
