import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { CommonQueriesPanelSection } from './CommonQueriesPanelSection.tsx';
import { QUERY_PRESETS } from '../data/presets';
import { applicationsAtom, environmentAtom, metricItemsAtom, timePeriodAtom, excludeHealthChecksAtom } from '../atoms';

describe('CommonQueriesPanel', () => {
  it('renders the Common Queries heading', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>
    );
    
    expect(screen.getByText('Common Queries')).toBeInTheDocument();
  });

  it('renders all preset buttons', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>
    );
    
    QUERY_PRESETS.forEach((preset) => {
      expect(screen.getByRole('button', { name: preset.name })).toBeInTheDocument();
    });
  });

  it('renders buttons with title attribute containing description', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>
    );
    
    QUERY_PRESETS.forEach((preset) => {
      const button = screen.getByRole('button', { name: preset.name });
      expect(button).toHaveAttribute('title', preset.description);
    });
  });

  it('updates atoms when API Throughput button is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>
    );
    
    await user.click(screen.getByRole('button', { name: 'API Throughput - Last 3 Hours' }));
    
    expect(store.get(applicationsAtom)).toEqual(['global-tax-mapper-api']);
    expect(store.get(environmentAtom)).toBe('prod');
    expect(store.get(excludeHealthChecksAtom)).toBe(true);
    expect(store.get(metricItemsAtom)?.[0]?.field).toBe('response.status');
  });

  it('updates atoms when API Latency button is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>
    );
    
    await user.click(screen.getByRole('button', { name: 'API Latency - Last 3 Hours' }));
    
    expect(store.get(applicationsAtom)).toEqual(['global-tax-mapper-api']);
  });

  it('updates metricItems atom when API Error Count button is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>
    );
    
    await user.click(screen.getByRole('button', { name: 'API Error Count' }));
    
    expect(store.get(applicationsAtom)).toEqual(['global-tax-mapper-api']);
    // Should have two metric items for 4xx and 5xx errors
    expect(store.get(metricItemsAtom)?.length).toBe(2);
  });

  it('updates timePeriod atom when preset is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>
    );
    
    await user.click(screen.getByRole('button', { name: 'API Throughput - Last 3 Hours' }));
    
    const timePeriod = store.get(timePeriodAtom);
    expect(timePeriod).toBeDefined();
    expect(timePeriod.mode).toBe('relative');
    expect(timePeriod.relative).toBe('3h ago');
  });

  it('renders exactly 4 buttons (3 presets + 1 reset)', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });
});
