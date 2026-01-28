import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetricQueryBuilder } from './MetricQueryBuilder';
import type { MetricQueryItem } from '../types/query';

function createItem(overrides: Partial<MetricQueryItem> = {}): MetricQueryItem {
  return {
    id: 'metric-1',
    metricType: 'transaction-count',
    aggregationType: 'count',
    filter: {
      isEnabled: false,
      operator: '>',
      value: '',
    },
    ...overrides,
  };
}

describe('MetricQueryBuilder', () => {
  const onAddItem = vi.fn();
  const onRemoveItem = vi.fn();
  const onUpdateItem = vi.fn();

  beforeEach(() => {
    onAddItem.mockClear();
    onRemoveItem.mockClear();
    onUpdateItem.mockClear();
  });

  it('renders the Metric Queries label', () => {
    render(
      <MetricQueryBuilder
        items={[createItem()]}
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
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
      />
    );

    await user.click(screen.getByRole('button', { name: /add metric/i }));
    expect(onAddItem).toHaveBeenCalledTimes(1);
  });

  it('updates filter state when checkbox toggled', async () => {
    const user = userEvent.setup();
    render(
      <MetricQueryBuilder
        items={[createItem()]}
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
      />
    );

    await user.click(screen.getByLabelText(/where duration/i));
    expect(onUpdateItem).toHaveBeenCalledWith('metric-1', expect.objectContaining({
      filter: expect.objectContaining({ isEnabled: true }),
    }));
  });
});
