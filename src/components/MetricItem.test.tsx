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
});
