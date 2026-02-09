import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { MetricItem } from './MetricItem';
import type { MetricFilter, MetricQueryItem } from '../types/query';
import { metricItemsAtom, addFilterAtom, removeMetricItemAtom } from '../atoms';

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

function createItem(overrides: Partial<MetricQueryItem> = {}): MetricQueryItem {
  return {
    id: 'metric-1',
    field: 'duration',
    aggregationType: 'count',
    filters: [],
    ...overrides,
  };
}

describe('MetricItem', () => {
  it('renders metric label with index', () => {
    const store = createStore();
    store.set(metricItemsAtom, [createItem()]);
    render(
      <Provider store={store}>
        <MetricItem
          item={createItem()}
          index={0}
          isSingleItem={false}
        />
      </Provider>
    );

    expect(screen.getByText('Metric 1')).toBeInTheDocument();
  });

  it('does not render remove button when isSingleItem is true', () => {
    const store = createStore();
    store.set(metricItemsAtom, [createItem()]);
    render(
      <Provider store={store}>
        <MetricItem
          item={createItem()}
          index={0}
          isSingleItem={true}
        />
      </Provider>
    );

    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
  });

  it('enables remove button when isSingleItem is false', () => {
    const store = createStore();
    store.set(metricItemsAtom, [createItem()]);
    render(
      <Provider store={store}>
        <MetricItem
          item={createItem()}
          index={0}
          isSingleItem={false}
        />
      </Provider>
    );

    expect(screen.getByRole('button', { name: /remove/i })).not.toBeDisabled();
  });

  it('adds filter when Add filter is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    const item = createItem();
    store.set(metricItemsAtom, [item]);
    render(
      <Provider store={store}>
        <MetricItem
          item={item}
          index={0}
          isSingleItem={false}
        />
      </Provider>
    );

    await user.click(screen.getByRole('button', { name: /add filter/i }));
    expect(store.get(metricItemsAtom)[0].filters.length).toBe(1);
  });

  it('renders filter rows when filters are present', () => {
    const store = createStore();
    const item = createItem({ filters: [createFilter({ value: '0.5' })] });
    store.set(metricItemsAtom, [item]);
    render(
      <Provider store={store}>
        <MetricItem
          item={item}
          index={0}
          isSingleItem={false}
        />
      </Provider>
    );

    expect(screen.getByDisplayValue('0.5')).toBeInTheDocument();
    expect(screen.getByLabelText('Field')).toBeInTheDocument();
  });

  it('does not render filter rows when no filters', () => {
    const store = createStore();
    const item = createItem({ filters: [] });
    store.set(metricItemsAtom, [item]);
    render(
      <Provider store={store}>
        <MetricItem
          item={item}
          index={0}
          isSingleItem={false}
        />
      </Provider>
    );

    expect(screen.queryByLabelText('Field')).not.toBeInTheDocument();
  });

  it('renders multiple filters', () => {
    const store = createStore();
    const item = createItem({
      filters: [
        createFilter({ id: 'filter-1', field: 'duration', value: '0.5' }),
        createFilter({ id: 'filter-2', field: 'response.status', value: '200' }),
      ],
    });
    store.set(metricItemsAtom, [item]);
    render(
      <Provider store={store}>
        <MetricItem
          item={item}
          index={0}
          isSingleItem={false}
        />
      </Provider>
    );

    expect(screen.getByDisplayValue('0.5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('200')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /remove filter/i })).toHaveLength(2);
  });

  it('removes item when remove button is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    const item = createItem();
    store.set(metricItemsAtom, [item]);
    render(
      <Provider store={store}>
        <MetricItem
          item={item}
          index={0}
          isSingleItem={false}
        />
      </Provider>
    );

    await user.click(screen.getByRole('button', { name: /remove/i }));
    expect(store.get(metricItemsAtom).length).toBe(0);
  });

  it('filters aggregation options for string field types', async () => {
    const user = userEvent.setup();
    const store = createStore();
    const item = createItem({ field: 'response.status', aggregationType: 'count' });
    store.set(metricItemsAtom, [item]);
    render(
      <Provider store={store}>
        <MetricItem
          item={item}
          index={0}
          isSingleItem={false}
        />
      </Provider>
    );

    // Open the aggregation dropdown
    const comboboxes = screen.getAllByRole('combobox');
    await user.click(comboboxes[1]);

    const options = screen.getAllByRole('option');
    const aggregationOptions = options.map((opt) => opt.textContent);
    expect(aggregationOptions).toContain('Count');
    expect(aggregationOptions).toContain('Unique List');
    expect(aggregationOptions).not.toContain('Average');
    expect(aggregationOptions).not.toContain('95th Percentile');
    expect(aggregationOptions).not.toContain('Median');
  });

  it('renders separator between multiple filters but not after the last', () => {
    const store = createStore();
    const item = createItem({
      filters: [
        createFilter({ id: 'filter-1', field: 'duration', value: '0.5' }),
        createFilter({ id: 'filter-2', field: 'response.status', value: '200' }),
        createFilter({ id: 'filter-3', field: 'request.uri', value: '/api' }),
      ],
    });
    store.set(metricItemsAtom, [item]);
    render(
      <Provider store={store}>
        <MetricItem
          item={item}
          index={0}
          isSingleItem={false}
        />
      </Provider>
    );

    // 3 filters should produce 2 separators (between filter 1-2 and filter 2-3)
    const separators = screen.getAllByRole('separator');
    expect(separators).toHaveLength(2);
  });

  it('renders remove button when isSingleItem is false', () => {
    const store = createStore();
    const item = createItem();
    store.set(metricItemsAtom, [item]);
    render(
      <Provider store={store}>
        <MetricItem
          item={item}
          index={0}
          isSingleItem={false}
        />
      </Provider>
    );

    const removeButton = screen.getByRole('button', { name: /^remove$/i });
    expect(removeButton).toBeInTheDocument();
    expect(removeButton).toHaveTextContent('Remove');
  });

  it('updates field when a different metric field is selected', async () => {
    const user = userEvent.setup();
    const store = createStore();
    const item = createItem({ field: 'duration', aggregationType: 'count' });
    store.set(metricItemsAtom, [item]);
    render(
      <Provider store={store}>
        <MetricItem item={item} index={0} isSingleItem={false} />
      </Provider>
    );
    const comboboxes = screen.getAllByRole('combobox');
    await user.click(comboboxes[0]);
    await user.click(screen.getByRole('option', { name: 'Response Status' }));
    expect(store.get(metricItemsAtom)[0].field).toBe('response.status');
  });

  it('updates aggregation type when a different aggregation is selected', async () => {
    const user = userEvent.setup();
    const store = createStore();
    const item = createItem({ field: 'duration', aggregationType: 'count' });
    store.set(metricItemsAtom, [item]);
    render(
      <Provider store={store}>
        <MetricItem item={item} index={0} isSingleItem={false} />
      </Provider>
    );
    const comboboxes = screen.getAllByRole('combobox');
    await user.click(comboboxes[1]);
    await user.click(screen.getByRole('option', { name: 'Average' }));
    expect(store.get(metricItemsAtom)[0].aggregationType).toBe('average');
  });

  it('updates a filter value through the onUpdate proxy', async () => {
    const user = userEvent.setup();
    const store = createStore();
    const item = createItem({
      filters: [createFilter({ id: 'filter-1', field: 'duration', value: '' })],
    });
    store.set(metricItemsAtom, [item]);
    render(
      <Provider store={store}>
        <MetricItem item={item} index={0} isSingleItem={false} />
      </Provider>
    );
    const valueInput = screen.getByLabelText('Value');
    await user.type(valueInput, '5');
    expect(store.get(metricItemsAtom)[0].filters[0].value).toBe('5');
  });

  it('removes a filter through the onRemove proxy', async () => {
    const user = userEvent.setup();
    const store = createStore();
    const item = createItem({
      filters: [createFilter({ id: 'filter-1', field: 'duration', value: '0.5' })],
    });
    store.set(metricItemsAtom, [item]);
    render(
      <Provider store={store}>
        <MetricItem item={item} index={0} isSingleItem={false} />
      </Provider>
    );
    await user.click(screen.getByRole('button', { name: /remove filter/i }));
    expect(store.get(metricItemsAtom)[0].filters.length).toBe(0);
  });

  it('throws when rendered with an unknown field value', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const store = createStore();
    const item = createItem({ field: 'nonexistent-field' });
    store.set(metricItemsAtom, [item]);
    expect(() =>
      render(
        <Provider store={store}>
          <MetricItem item={item} index={0} isSingleItem={false} />
        </Provider>
      )
    ).toThrow('Unknown metricType');
    consoleSpy.mockRestore();
  });

  it('shows all aggregation options for numeric fields', async () => {
    const user = userEvent.setup();
    const store = createStore();
    const item = createItem({ field: 'duration', aggregationType: 'count' });
    store.set(metricItemsAtom, [item]);
    render(
      <Provider store={store}>
        <MetricItem item={item} index={0} isSingleItem={false} />
      </Provider>
    );

    const comboboxes = screen.getAllByRole('combobox');
    await user.click(comboboxes[1]);

    const options = screen.getAllByRole('option');
    const aggregationOptions = options.map((opt) => opt.textContent);
    expect(aggregationOptions).toContain('Average');
    expect(aggregationOptions).toContain('95th Percentile');
    expect(aggregationOptions).toContain('Median');
    expect(aggregationOptions).toContain('Count');
    expect(aggregationOptions).toContain('Unique List');
  });
});
