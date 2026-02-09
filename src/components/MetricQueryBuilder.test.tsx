import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, createStore } from "jotai";
import { MetricQueryBuilder } from "./MetricQueryBuilder";
import type { MetricQueryItem } from "../types/query";
import { metricItemsAtom } from "../atoms";

function createItem(overrides: Partial<MetricQueryItem> = {}): MetricQueryItem {
  return {
    id: "metric-1",
    field: "duration",
    aggregationType: "count",
    filters: [],
    ...overrides,
  };
}

describe("MetricQueryBuilder", () => {
  it("renders a metric item", () => {
    const store = createStore();
    store.set(metricItemsAtom, [createItem()]);
    render(
      <Provider store={store}>
        <MetricQueryBuilder />
      </Provider>,
    );

    expect(screen.getByText("Metric 1")).toBeInTheDocument();
  });

  it("renders a section rule separator between multiple items", () => {
    const store = createStore();
    store.set(metricItemsAtom, [
      createItem({ id: "metric-1" }),
      createItem({ id: "metric-2" }),
    ]);
    render(
      <Provider store={store}>
        <MetricQueryBuilder />
      </Provider>,
    );

    const separator = screen.getByRole("separator");
    expect(separator).toBeInTheDocument();
  });

  it("does not render a section rule separator for a single item", () => {
    const store = createStore();
    store.set(metricItemsAtom, [createItem()]);
    render(
      <Provider store={store}>
        <MetricQueryBuilder />
      </Provider>,
    );

    const separator = screen.queryByRole("separator");
    expect(separator).not.toBeInTheDocument();
  });

  it("adds metric item when Add metric is clicked", async () => {
    const user = userEvent.setup();
    const store = createStore();
    const initialItem = createItem();
    store.set(metricItemsAtom, [initialItem]);
    render(
      <Provider store={store}>
        <MetricQueryBuilder />
      </Provider>,
    );

    await user.click(screen.getByRole("button", { name: /add metric/i }));
    expect(store.get(metricItemsAtom).length).toBe(2);
  });

  it("renders multiple metric items", () => {
    const store = createStore();
    store.set(metricItemsAtom, [
      createItem({ id: "metric-1" }),
      createItem({ id: "metric-2" }),
    ]);
    render(
      <Provider store={store}>
        <MetricQueryBuilder />
      </Provider>,
    );

    expect(screen.getByText("Metric 1")).toBeInTheDocument();
    expect(screen.getByText("Metric 2")).toBeInTheDocument();
  });
});
