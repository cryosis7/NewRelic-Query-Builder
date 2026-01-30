import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { QueryPreview } from './QueryPreview';
import { applicationsAtom, environmentAtom, metricItemsAtom, timePeriodAtom, excludeHealthChecksAtom, useTimeseriesAtom, facetAtom } from '../atoms';
import { createMetricItem } from '../lib/buildNrqlQuery';

describe('QueryPreview', () => {
  it('renders the query preview', () => {
    const store = createStore();
    // Set up minimal state to generate a valid query
    store.set(applicationsAtom, ['global-tax-mapper-api']);
    store.set(environmentAtom, 'prod');
    store.set(metricItemsAtom, [createMetricItem('duration', 'count')]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>
    );
    
    // Query should be rendered in a pre element
    expect(screen.getByText(/SELECT count\(duration\)/)).toBeInTheDocument();
  });

  it('displays the provided query text', () => {
    const store = createStore();
    store.set(applicationsAtom, ['global-tax-mapper-api']);
    store.set(environmentAtom, 'prod');
    store.set(metricItemsAtom, [createMetricItem('duration', 'count')]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>
    );
    
    // Query should contain SELECT count(duration)
    expect(screen.getByText(/SELECT count\(duration\)/)).toBeInTheDocument();
  });

  it('renders the Copy Query button', () => {
    const store = createStore();
    store.set(applicationsAtom, ['global-tax-mapper-api']);
    store.set(environmentAtom, 'prod');
    store.set(metricItemsAtom, [createMetricItem('duration', 'count')]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>
    );
    
    expect(screen.getByRole('button', { name: /copy query/i })).toBeInTheDocument();
  });

  it('copies query to clipboard when Copy button is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(applicationsAtom, ['global-tax-mapper-api']);
    store.set(environmentAtom, 'prod');
    store.set(metricItemsAtom, [createMetricItem('duration', 'count')]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>
    );
    
    await user.click(screen.getByRole('button', { name: /copy query/i }));
    
    // Verify the copy succeeded by checking the button changed to "Copied!"
    // The button only shows "Copied!" after a successful clipboard write
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
    });
  });

  it('shows Copied! feedback after successful copy', async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(applicationsAtom, ['global-tax-mapper-api']);
    store.set(environmentAtom, 'prod');
    store.set(metricItemsAtom, [createMetricItem('duration', 'count')]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>
    );
    
    await user.click(screen.getByRole('button', { name: /copy query/i }));
    
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
  });

  it('reverts button text back to Copy Query after 2 seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const store = createStore();
    store.set(applicationsAtom, ['global-tax-mapper-api']);
    store.set(environmentAtom, 'prod');
    store.set(metricItemsAtom, [createMetricItem('duration', 'count')]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>
    );
    
    await user.click(screen.getByRole('button', { name: /copy query/i }));
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
    
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copy query/i })).toBeInTheDocument();
    });
    
    vi.useRealTimers();
  });

  it('disables Copy button when query is invalid (starts with --)', () => {
    const store = createStore();
    // Set up invalid state (no applications)
    store.set(applicationsAtom, []);
    store.set(environmentAtom, 'prod');
    store.set(metricItemsAtom, [createMetricItem('duration', 'count')]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>
    );
    
    expect(screen.getByRole('button', { name: /copy query/i })).toBeDisabled();
  });

  it('enables Copy button when query is valid', () => {
    const store = createStore();
    store.set(applicationsAtom, ['global-tax-mapper-api']);
    store.set(environmentAtom, 'prod');
    store.set(metricItemsAtom, [createMetricItem('duration', 'count')]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>
    );
    
    expect(screen.getByRole('button', { name: /copy query/i })).toBeEnabled();
  });

  it('displays invalid query with warning styling', () => {
    const store = createStore();
    store.set(applicationsAtom, []);
    store.set(environmentAtom, 'prod');
    store.set(metricItemsAtom, [createMetricItem('duration', 'count')]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>
    );
    
    const pre = screen.getByText('-- Select at least one application');
    expect(pre).toHaveStyle({ backgroundColor: '#fff3cd' });
  });

  it('displays valid query with standard styling', () => {
    const store = createStore();
    store.set(applicationsAtom, ['global-tax-mapper-api']);
    store.set(environmentAtom, 'prod');
    store.set(metricItemsAtom, [createMetricItem('duration', 'count')]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>
    );
    
    const pre = screen.getByText(/SELECT count\(duration\)/);
    expect(pre).toHaveStyle({ backgroundColor: '#f5f5f5' });
  });
});
