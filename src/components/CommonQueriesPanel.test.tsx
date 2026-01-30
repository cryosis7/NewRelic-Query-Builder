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

  it('updates atoms when API Prod button is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>
    );
    
    await user.click(screen.getByRole('button', { name: 'API Prod - Last Hour' }));
    
    expect(store.get(applicationsAtom)).toEqual(['global-tax-mapper-api']);
    expect(store.get(environmentAtom)).toBe('prod');
    expect(store.get(excludeHealthChecksAtom)).toBe(true);
    expect(store.get(metricItemsAtom)?.[0]?.metricType).toBe('transaction-count');
  });

  it('updates atoms with all apps when All Apps button is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>
    );
    
    await user.click(screen.getByRole('button', { name: 'All Apps Prod - Last Hour' }));
    
    expect(store.get(applicationsAtom)).toEqual([
      'global-tax-mapper-api',
      'global-tax-mapper-bff', 
      'global-tax-mapper-integrator-api'
    ]);
  });

  it('updates atoms with UAT environment when UAT button is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>
    );
    
    await user.click(screen.getByRole('button', { name: 'API UAT - Last Hour' }));
    
    expect(store.get(environmentAtom)).toBe('uat');
  });

  it('updates timePeriod atom when preset is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>
    );
    
    await user.click(screen.getByRole('button', { name: 'API Prod - Last Hour' }));
    
    const timePeriod = store.get(timePeriodAtom);
    expect(timePeriod).toBeDefined();
    expect(timePeriod.mode).toBeDefined();
    expect(timePeriod.relative).toBeDefined();
    // since/until are now optional and not required for relative mode
  });

  it('renders exactly 8 preset buttons (7 presets + 1 reset)', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(8);
  });
});
