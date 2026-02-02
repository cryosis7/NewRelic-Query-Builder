import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { QueryOptions } from './QueryOptions';
import {
  excludeBulkEndpointAtom,
  excludeHealthChecksAtom,
  useTimeseriesAtom,
} from '../atoms';

const renderWithStore = (store: ReturnType<typeof createStore>) =>
  render(
    <Provider store={store}>
      <QueryOptions />
    </Provider>
  );

describe('QueryOptions', () => {
  it('renders the Options legend', () => {
    const store = createStore();
    renderWithStore(store);

    expect(screen.getByText('Options')).toBeInTheDocument();
  });

  describe('health checks toggle', () => {
    it('renders the exclude health checks checkbox', () => {
      const store = createStore();
      renderWithStore(store);

      expect(screen.getByLabelText('Exclude health checks')).toBeInTheDocument();
    });

    it('shows health checkbox as checked when enabled', () => {
      const store = createStore();
      store.set(excludeHealthChecksAtom, true);
      renderWithStore(store);

      expect(screen.getByLabelText('Exclude health checks')).toBeChecked();
    });

    it('shows health checkbox as unchecked when disabled', () => {
      const store = createStore();
      store.set(excludeHealthChecksAtom, false);
      renderWithStore(store);

      expect(screen.getByLabelText('Exclude health checks')).not.toBeChecked();
    });

    it('toggles the health checkbox when clicked', async () => {
      const user = userEvent.setup();
      const store = createStore();
      store.set(excludeHealthChecksAtom, true);
      renderWithStore(store);

      await user.click(screen.getByLabelText('Exclude health checks'));
      expect(store.get(excludeHealthChecksAtom)).toBe(false);

      await user.click(screen.getByLabelText('Exclude health checks'));
      expect(store.get(excludeHealthChecksAtom)).toBe(true);
    });
  });

  describe('bulk endpoint toggle', () => {
    it('renders the bulk endpoint checkbox', () => {
      const store = createStore();
      renderWithStore(store);

      expect(screen.getByLabelText('Exclude bulk endpoint')).toBeInTheDocument();
    });

    it('shows bulk checkbox as checked when enabled', () => {
      const store = createStore();
      store.set(excludeBulkEndpointAtom, true);
      renderWithStore(store);

      expect(screen.getByLabelText('Exclude bulk endpoint')).toBeChecked();
    });

    it('shows bulk checkbox as unchecked when disabled', () => {
      const store = createStore();
      store.set(excludeBulkEndpointAtom, false);
      renderWithStore(store);

      expect(screen.getByLabelText('Exclude bulk endpoint')).not.toBeChecked();
    });

    it('toggles the bulk checkbox when clicked', async () => {
      const user = userEvent.setup();
      const store = createStore();
      store.set(excludeBulkEndpointAtom, true);
      renderWithStore(store);

      await user.click(screen.getByLabelText('Exclude bulk endpoint'));
      expect(store.get(excludeBulkEndpointAtom)).toBe(false);

      await user.click(screen.getByLabelText('Exclude bulk endpoint'));
      expect(store.get(excludeBulkEndpointAtom)).toBe(true);
    });
  });

  describe('timeseries toggle', () => {
    it('renders the use timeseries checkbox', () => {
      const store = createStore();
      store.set(useTimeseriesAtom, true);
      renderWithStore(store);

      expect(screen.getByLabelText('As Timeseries')).toBeInTheDocument();
    });

    it('shows timeseries checkbox as checked when useTimeseries is true', () => {
      const store = createStore();
      store.set(useTimeseriesAtom, true);
      renderWithStore(store);

      expect(screen.getByLabelText('As Timeseries')).toBeChecked();
    });

    it('shows timeseries checkbox as unchecked when useTimeseries is false', () => {
      const store = createStore();
      store.set(useTimeseriesAtom, false);
      renderWithStore(store);

      expect(screen.getByLabelText('As Timeseries')).not.toBeChecked();
    });

    it('toggles the timeseries checkbox when clicked', async () => {
      const user = userEvent.setup();
      const store = createStore();
      store.set(useTimeseriesAtom, true);
      renderWithStore(store);

      await user.click(screen.getByLabelText('As Timeseries'));
      expect(store.get(useTimeseriesAtom)).toBe(false);

      await user.click(screen.getByLabelText('As Timeseries'));
      expect(store.get(useTimeseriesAtom)).toBe(true);
    });
  });
});
