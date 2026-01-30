import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { QueryOptions } from './QueryOptions';
import { excludeHealthChecksAtom, useTimeseriesAtom } from '../atoms';

describe('QueryOptions', () => {
  it('renders the exclude health checks checkbox', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <QueryOptions />
      </Provider>
    );

    expect(screen.getByLabelText('Exclude health checks')).toBeInTheDocument();
  });

  it('shows checkbox as checked when isExcluded is true', () => {
    const store = createStore();
    store.set(excludeHealthChecksAtom, true);
    render(
      <Provider store={store}>
        <QueryOptions />
      </Provider>
    );

    expect(screen.getByLabelText('Exclude health checks')).toBeChecked();
  });

  it('shows checkbox as unchecked when isExcluded is false', () => {
    const store = createStore();
    store.set(excludeHealthChecksAtom, false);
    render(
      <Provider store={store}>
        <QueryOptions />
      </Provider>
    );

    expect(screen.getByLabelText('Exclude health checks')).not.toBeChecked();
  });

  it('updates atom when checked box is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(excludeHealthChecksAtom, true);
    render(
      <Provider store={store}>
        <QueryOptions />
      </Provider>
    );

    await user.click(screen.getByLabelText('Exclude health checks'));
    expect(store.get(excludeHealthChecksAtom)).toBe(false);
  });

  it('updates atom when unchecked box is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(excludeHealthChecksAtom, false);
    render(
      <Provider store={store}>
        <QueryOptions />
      </Provider>
    );

    await user.click(screen.getByLabelText('Exclude health checks'));
    expect(store.get(excludeHealthChecksAtom)).toBe(true);
  });

  it('displays excluded paths hint when isExcluded is true', () => {
    const store = createStore();
    store.set(excludeHealthChecksAtom, true);
    render(
      <Provider store={store}>
        <QueryOptions />
      </Provider>
    );

    // Component renders the checkbox but no hint text
    expect(screen.getByLabelText('Exclude health checks')).toBeInTheDocument();
  });

  it('does not display excluded paths hint when isExcluded is false', () => {
    const store = createStore();
    store.set(excludeHealthChecksAtom, false);
    render(
      <Provider store={store}>
        <QueryOptions />
      </Provider>
    );

    expect(screen.queryByText(/Excludes:/)).not.toBeInTheDocument();
  });

  it('renders the Options legend', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <QueryOptions />
      </Provider>
    );

    expect(screen.getByText('Options')).toBeInTheDocument();
  });

  it('renders the use timeseries checkbox', () => {
    const store = createStore();
    store.set(useTimeseriesAtom, true);
    render(
      <Provider store={store}>
        <QueryOptions />
      </Provider>
    );

    expect(screen.getByLabelText('As Timeseries')).toBeInTheDocument();
  });

  it('shows timeseries checkbox as checked when useTimeseries is true', () => {
    const store = createStore();
    store.set(useTimeseriesAtom, true);
    render(
      <Provider store={store}>
        <QueryOptions />
      </Provider>
    );

    expect(screen.getByLabelText('As Timeseries')).toBeChecked();
  });

  it('shows timeseries checkbox as unchecked when useTimeseries is false', () => {
    const store = createStore();
    store.set(useTimeseriesAtom, false);
    render(
      <Provider store={store}>
        <QueryOptions />
      </Provider>
    );

    expect(screen.getByLabelText('As Timeseries')).not.toBeChecked();
  });

  it('updates atom when checked timeseries box is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(useTimeseriesAtom, true);
    render(
      <Provider store={store}>
        <QueryOptions />
      </Provider>
    );

    await user.click(screen.getByLabelText('As Timeseries'));
    expect(store.get(useTimeseriesAtom)).toBe(false);
  });

  it('updates atom when unchecked timeseries box is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(useTimeseriesAtom, false);
    render(
      <Provider store={store}>
        <QueryOptions />
      </Provider>
    );

    await user.click(screen.getByLabelText('As Timeseries'));
    expect(store.get(useTimeseriesAtom)).toBe(true);
  });
});
