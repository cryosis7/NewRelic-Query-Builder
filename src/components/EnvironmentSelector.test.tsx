import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { EnvironmentSelector } from './EnvironmentSelector';
import { environmentAtom } from '../atoms';

describe('EnvironmentSelector', () => {
  it('renders Production and UAT options', async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(environmentAtom, 'prod');
    render(
      <Provider store={store}>
        <EnvironmentSelector />
      </Provider>
    );

    // Open the dropdown first
    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('option', { name: 'Production' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'UAT' })).toBeInTheDocument();
  });

  it('updates atom when Production is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(environmentAtom, 'uat');
    render(
      <Provider store={store}>
        <EnvironmentSelector />
      </Provider>
    );

    // Open the dropdown first
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Production' }));
    expect(store.get(environmentAtom)).toBe('prod');
  });

  it('updates atom when UAT is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(environmentAtom, 'prod');
    render(
      <Provider store={store}>
        <EnvironmentSelector />
      </Provider>
    );

    // Open the dropdown first
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'UAT' }));
    expect(store.get(environmentAtom)).toBe('uat');
  });

  it('renders the Environment legend', () => {
    const store = createStore();
    store.set(environmentAtom, 'prod');
    render(
      <Provider store={store}>
        <EnvironmentSelector />
      </Provider>
    );

    expect(screen.getByText('Environment')).toBeInTheDocument();
  });
});
