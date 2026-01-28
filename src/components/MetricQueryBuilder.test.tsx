import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetricQueryBuilder } from './MetricQueryBuilder';
import type { MetricQueryItem } from '../types/query';

function createItem(overrides: Partial<MetricQueryItem> = {}): MetricQueryItem {
  return {
    id: 'metric-1',
    metricType: 'transaction-count',
    aggregationType: 'count',
    filters: [],
    ...overrides,
  };
}

describe('MetricQueryBuilder', () => {
  const onAddItem = vi.fn();
  const onRemoveItem = vi.fn();
  const onUpdateItem = vi.fn();
  const onAddFilter = vi.fn();
  const onUpdateFilter = vi.fn();
  const onRemoveFilter = vi.fn();

  beforeEach(() => {
    onAddItem.mockClear();
    onRemoveItem.mockClear();
    onUpdateItem.mockClear();
    onAddFilter.mockClear();
    onUpdateFilter.mockClear();
    onRemoveFilter.mockClear();
  });

  it('renders the Metric Queries label', () => {
    render(
      <MetricQueryBuilder
        items={[createItem()]}
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
        onAddFilter={onAddFilter}
        onUpdateFilter={onUpdateFilter}
        onRemoveFilter={onRemoveFilter}
      />
    );

    expect(screen.getByText('Metric Queries')).toBeInTheDocument();
  });

  it('disables remove when only one item is present', () => {
    render(
      <MetricQueryBuilder
        items={[createItem()]}
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
        onAddFilter={onAddFilter}
        onUpdateFilter={onUpdateFilter}
        onRemoveFilter={onRemoveFilter}
      />
    );

    expect(screen.getByRole('button', { name: /remove/i })).toBeDisabled();
  });

  it('calls onAddItem when Add metric is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MetricQueryBuilder
        items={[createItem()]}
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
        onAddFilter={onAddFilter}
        onUpdateFilter={onUpdateFilter}
        onRemoveFilter={onRemoveFilter}
      />
    );

    await user.click(screen.getByRole('button', { name: /add metric/i }));
    expect(onAddItem).toHaveBeenCalledTimes(1);
  });

  it('renders multiple metric items', () => {
    render(
      <MetricQueryBuilder
        items={[
          createItem({ id: 'metric-1' }),
          createItem({ id: 'metric-2' }),
        ]}
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
        onAddFilter={onAddFilter}
        onUpdateFilter={onUpdateFilter}
        onRemoveFilter={onRemoveFilter}
      />
    );

    expect(screen.getByText('Metric 1')).toBeInTheDocument();
    expect(screen.getByText('Metric 2')).toBeInTheDocument();
  });
});
