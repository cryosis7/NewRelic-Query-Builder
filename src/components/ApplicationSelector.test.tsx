import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { ApplicationSelector } from './ApplicationSelector';
import { applicationsAtom } from '../atoms';

describe('ApplicationSelector', () => {
  it('renders all three application options', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <ApplicationSelector />
      </Provider>
    );

    expect(screen.getByLabelText('API')).toBeInTheDocument();
    expect(screen.getByLabelText('BFF')).toBeInTheDocument();
    expect(screen.getByLabelText('Integrator API')).toBeInTheDocument();
  });

  it('shows checkboxes as checked when applications are selected', () => {
    const store = createStore();
    store.set(applicationsAtom, ['global-tax-mapper-api', 'global-tax-mapper-bff']);
    render(
      <Provider store={store}>
        <ApplicationSelector />
      </Provider>
    );

    expect(screen.getByLabelText('API')).toBeChecked();
    expect(screen.getByLabelText('BFF')).toBeChecked();
    expect(screen.getByLabelText('Integrator API')).not.toBeChecked();
  });

  it('updates atom when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(applicationsAtom, []);
    render(
      <Provider store={store}>
        <ApplicationSelector />
      </Provider>
    );

    await user.click(screen.getByLabelText('API'));
    expect(store.get(applicationsAtom)).toContain('global-tax-mapper-api');
  });

  it('allows multiple applications to be selected', async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(applicationsAtom, ['global-tax-mapper-api']);
    render(
      <Provider store={store}>
        <ApplicationSelector />
      </Provider>
    );

    await user.click(screen.getByLabelText('BFF'));
    expect(store.get(applicationsAtom)).toContain('global-tax-mapper-api');
    expect(store.get(applicationsAtom)).toContain('global-tax-mapper-bff');
  });

  it('renders the Applications legend', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <ApplicationSelector />
      </Provider>
    );

    expect(screen.getByText('Applications')).toBeInTheDocument();
  });
});
