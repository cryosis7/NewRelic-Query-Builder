import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { FacetSelector } from './FacetSelector';
import { facetAtom } from '../atoms';

describe('FacetSelector', () => {
  it('renders all facet options', async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(facetAtom, 'request.uri');
    render(
      <Provider store={store}>
        <FacetSelector />
      </Provider>
    );

    // Open the dropdown first
    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('option', { name: 'No Facet' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Request URI' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Response Status' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Request Method' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Application' })).toBeInTheDocument();
  });

  it('updates atom when a facet option is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(facetAtom, 'request.uri');
    render(
      <Provider store={store}>
        <FacetSelector />
      </Provider>
    );

    // Open the dropdown first
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Request Method' }));

    expect(store.get(facetAtom)).toBe('request.method');
  });

  it('handles "none" selection', async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(facetAtom, 'request.uri');
    render(
      <Provider store={store}>
        <FacetSelector />
      </Provider>
    );

    // Open the dropdown first
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'No Facet' }));

    expect(store.get(facetAtom)).toBe('none');
  });
});
