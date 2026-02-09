import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, createStore } from "jotai";
import { QueryPreview } from "./QueryPreview";
import { applicationsAtom, environmentAtom, metricItemsAtom } from "../atoms";
import { createMetricItem } from "../lib/buildNrqlQuery";

describe("QueryPreview", () => {
  it("renders the query preview", () => {
    const store = createStore();
    // Set up minimal state to generate a valid query
    store.set(applicationsAtom, ["global-tax-mapper-api"]);
    store.set(environmentAtom, "prod");
    store.set(metricItemsAtom, [createMetricItem("duration", "count")]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>,
    );

    // Query should be rendered in a pre element
    expect(screen.getByText(/SELECT count\(duration\)/)).toBeInTheDocument();
  });

  it("displays the provided query text", () => {
    const store = createStore();
    store.set(applicationsAtom, ["global-tax-mapper-api"]);
    store.set(environmentAtom, "prod");
    store.set(metricItemsAtom, [createMetricItem("duration", "count")]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>,
    );

    // Query should contain SELECT count(duration)
    expect(screen.getByText(/SELECT count\(duration\)/)).toBeInTheDocument();
  });

  it("renders the Copy Query button", () => {
    const store = createStore();
    store.set(applicationsAtom, ["global-tax-mapper-api"]);
    store.set(environmentAtom, "prod");
    store.set(metricItemsAtom, [createMetricItem("duration", "count")]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>,
    );

    expect(
      screen.getByRole("button", { name: /copy query/i }),
    ).toBeInTheDocument();
  });

  it("copies query to clipboard when Copy button is clicked", async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(applicationsAtom, ["global-tax-mapper-api"]);
    store.set(environmentAtom, "prod");
    store.set(metricItemsAtom, [createMetricItem("duration", "count")]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>,
    );

    await user.click(screen.getByRole("button", { name: /copy query/i }));

    // Verify the copy succeeded by checking the button changed to "Copied!"
    // The button only shows "Copied!" after a successful clipboard write
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /copied/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows Copied! feedback after successful copy", async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(applicationsAtom, ["global-tax-mapper-api"]);
    store.set(environmentAtom, "prod");
    store.set(metricItemsAtom, [createMetricItem("duration", "count")]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>,
    );

    await user.click(screen.getByRole("button", { name: /copy query/i }));

    expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();
  });

  it("reverts button text back to Copy Query after 2 seconds", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const store = createStore();
    store.set(applicationsAtom, ["global-tax-mapper-api"]);
    store.set(environmentAtom, "prod");
    store.set(metricItemsAtom, [createMetricItem("duration", "count")]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>,
    );

    await user.click(screen.getByRole("button", { name: /copy query/i }));
    expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /copy query/i }),
      ).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it("disables Copy button when query is invalid (starts with --)", () => {
    const store = createStore();
    // Set up invalid state (no applications)
    store.set(applicationsAtom, []);
    store.set(environmentAtom, "prod");
    store.set(metricItemsAtom, [createMetricItem("duration", "count")]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>,
    );

    expect(screen.getByRole("button", { name: /copy query/i })).toBeDisabled();
  });

  it("enables Copy button when query is valid", () => {
    const store = createStore();
    store.set(applicationsAtom, ["global-tax-mapper-api"]);
    store.set(environmentAtom, "prod");
    store.set(metricItemsAtom, [createMetricItem("duration", "count")]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>,
    );

    expect(screen.getByRole("button", { name: /copy query/i })).toBeEnabled();
  });

  it("displays invalid query with warning styling", () => {
    const store = createStore();
    store.set(applicationsAtom, []);
    store.set(environmentAtom, "prod");
    store.set(metricItemsAtom, [createMetricItem("duration", "count")]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>,
    );

    const pre = screen.getByText("-- Select at least one application");
    expect(pre).toHaveStyle({ backgroundColor: "#fff3cd" });
  });

  it("displays valid query with standard styling", () => {
    const store = createStore();
    store.set(applicationsAtom, ["global-tax-mapper-api"]);
    store.set(environmentAtom, "prod");
    store.set(metricItemsAtom, [createMetricItem("duration", "count")]);
    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>,
    );

    const pre = screen.getByText(/SELECT count\(duration\)/);
    expect(pre).toHaveStyle({ backgroundColor: "#f5f5f5" });
  });

  it("handles clipboard write failure gracefully", async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(applicationsAtom, ["global-tax-mapper-api"]);
    store.set(environmentAtom, "prod");
    store.set(metricItemsAtom, [createMetricItem("duration", "count")]);

    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi
          .fn()
          .mockRejectedValue(new Error("Clipboard access denied")),
      },
      writable: true,
      configurable: true,
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <Provider store={store}>
        <QueryPreview />
      </Provider>,
    );

    await user.click(screen.getByRole("button", { name: /copy query/i }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to copy:",
        expect.any(Error),
      );
    });

    // Button should NOT change to "Copied!" on failure
    expect(
      screen.getByRole("button", { name: /copy query/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /copied/i }),
    ).not.toBeInTheDocument();

    consoleSpy.mockRestore();
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });

  describe("Save Query button", () => {
    it("renders the Save Query button", () => {
      const store = createStore();
      store.set(applicationsAtom, ["global-tax-mapper-api"]);
      store.set(environmentAtom, "prod");
      store.set(metricItemsAtom, [createMetricItem("duration", "count")]);
      render(
        <Provider store={store}>
          <QueryPreview />
        </Provider>,
      );

      expect(
        screen.getByRole("button", { name: /save query/i }),
      ).toBeInTheDocument();
    });

    it("Save button is enabled for valid queries", () => {
      const store = createStore();
      store.set(applicationsAtom, ["global-tax-mapper-api"]);
      store.set(environmentAtom, "prod");
      store.set(metricItemsAtom, [createMetricItem("duration", "count")]);
      render(
        <Provider store={store}>
          <QueryPreview />
        </Provider>,
      );

      expect(screen.getByRole("button", { name: /save query/i })).toBeEnabled();
    });

    it("Save button is disabled for invalid queries", () => {
      const store = createStore();
      store.set(applicationsAtom, []);
      store.set(metricItemsAtom, [createMetricItem("duration", "count")]);
      render(
        <Provider store={store}>
          <QueryPreview />
        </Provider>,
      );

      expect(
        screen.getByRole("button", { name: /save query/i }),
      ).toBeDisabled();
    });

    it("clicking Save Query opens the modal", async () => {
      const user = userEvent.setup();
      const store = createStore();
      store.set(applicationsAtom, ["global-tax-mapper-api"]);
      store.set(environmentAtom, "prod");
      store.set(metricItemsAtom, [createMetricItem("duration", "count")]);
      render(
        <Provider store={store}>
          <QueryPreview />
        </Provider>,
      );

      await user.click(screen.getByRole("button", { name: /save query/i }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByLabelText(/Query Name/i)).toBeInTheDocument();
    });
  });
});
