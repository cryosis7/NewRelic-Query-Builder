import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, createStore } from "jotai";
import { CommonQueriesPanelSection } from "./CommonQueriesPanelSection.tsx";
import { QUERY_PRESETS } from "../data/presets";
import {
  applicationsAtom,
  environmentAtom,
  metricItemsAtom,
  timePeriodAtom,
  excludeHealthChecksAtom,
  savedQueriesAtom,
} from "../atoms";
import { buildNrqlQuery } from "../lib/buildNrqlQuery";
import type { SavedQuery, Application, Environment } from "../types/query";

describe("CommonQueriesPanel", () => {
  it("renders the Common Queries heading", () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>,
    );

    expect(screen.getByText("Common Queries")).toBeInTheDocument();
  });

  it("renders all preset buttons", () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>,
    );

    QUERY_PRESETS.forEach((preset) => {
      expect(
        screen.getByRole("button", { name: preset.name }),
      ).toBeInTheDocument();
    });
  });

  it("renders buttons with title attribute containing description", () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>,
    );

    QUERY_PRESETS.forEach((preset) => {
      const button = screen.getByRole("button", { name: preset.name });
      expect(button).toHaveAttribute("title", preset.description);
    });
  });

  it("updates atoms when API Throughput button is clicked", async () => {
    const user = userEvent.setup();
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>,
    );

    await user.click(
      screen.getByRole("button", { name: "API Throughput - Last 3 Hours" }),
    );

    expect(store.get(applicationsAtom)).toEqual(["global-tax-mapper-api"]);
    expect(store.get(environmentAtom)).toBe("prod");
    expect(store.get(excludeHealthChecksAtom)).toBe(true);
    expect(store.get(metricItemsAtom)?.[0]?.field).toBe("response.status");
  });

  it("updates atoms when API Latency button is clicked", async () => {
    const user = userEvent.setup();
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>,
    );

    await user.click(
      screen.getByRole("button", { name: "API Latency - Last 3 Hours" }),
    );

    expect(store.get(applicationsAtom)).toEqual(["global-tax-mapper-api"]);
  });

  it("updates metricItems atom when API Error Count button is clicked", async () => {
    const user = userEvent.setup();
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>,
    );

    await user.click(screen.getByRole("button", { name: "API Error Count" }));

    expect(store.get(applicationsAtom)).toEqual(["global-tax-mapper-api"]);
    // Should have two metric items for 4xx and 5xx errors
    expect(store.get(metricItemsAtom)?.length).toBe(2);
  });

  it("updates timePeriod atom when preset is clicked", async () => {
    const user = userEvent.setup();
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>,
    );

    await user.click(
      screen.getByRole("button", { name: "API Throughput - Last 3 Hours" }),
    );

    const timePeriod = store.get(timePeriodAtom);
    expect(timePeriod).toBeDefined();
    expect(timePeriod.mode).toBe("relative");
    expect(timePeriod.relative).toBe("3h ago");
  });

  it("renders exactly 4 buttons (3 presets + 1 reset) when no saved queries", () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });

  it("resets state to defaults when Reset button is clicked", async () => {
    const user = userEvent.setup();
    const store = createStore();
    render(
      <Provider store={store}>
        <CommonQueriesPanelSection />
      </Provider>,
    );

    // Apply a preset first to change state from defaults
    await user.click(
      screen.getByRole("button", { name: "API Throughput - Last 3 Hours" }),
    );
    // Preset sets 4 metric items and excludeBulkEndpoint=false, different from defaults
    expect(store.get(metricItemsAtom)).toHaveLength(4);
    expect(store.get(excludeHealthChecksAtom)).toBe(true);

    // Click the Reset button
    await user.click(screen.getByRole("button", { name: "Reset" }));

    // Verify state was reset to defaults
    expect(store.get(applicationsAtom)).toEqual(["global-tax-mapper-api"]);
    expect(store.get(metricItemsAtom)).toHaveLength(1);
    expect(store.get(excludeHealthChecksAtom)).toBe(true);
  });

  describe("Saved Queries", () => {
    const createSavedQuery = (
      overrides: Partial<SavedQuery> = {},
    ): SavedQuery => {
      const state = overrides.state ?? {
        applications: ["global-tax-mapper-bff"],
        environment: "uat",
        metricItems: [
          {
            id: "test-1",
            field: "duration",
            aggregationType: "count" as const,
            filters: [],
          },
        ],
        timePeriod: { mode: "relative" as const, relative: "3h ago" },
        excludeHealthChecks: true,
        excludeBulkEndpoint: true,
        useTimeseries: true,
        facet: "request.uri",
      };
      return {
        id: "test-id-1",
        name: "My Saved Query",
        createdAt: "2026-01-01T00:00:00Z",
        ...overrides,
        state,
        nrqlQuery: overrides.nrqlQuery ?? buildNrqlQuery(state),
      };
    };

    it("renders saved query buttons alongside presets", () => {
      const store = createStore();
      store.set(savedQueriesAtom, [createSavedQuery()]);
      render(
        <Provider store={store}>
          <CommonQueriesPanelSection />
        </Provider>,
      );

      expect(
        screen.getByRole("button", { name: "My Saved Query" }),
      ).toBeInTheDocument();
    });

    it("applies saved query state when clicked", async () => {
      const user = userEvent.setup();
      const store = createStore();
      store.set(savedQueriesAtom, [createSavedQuery()]);
      render(
        <Provider store={store}>
          <CommonQueriesPanelSection />
        </Provider>,
      );

      await user.click(screen.getByRole("button", { name: "My Saved Query" }));

      expect(store.get(applicationsAtom)).toEqual(["global-tax-mapper-bff"]);
      expect(store.get(environmentAtom)).toBe("uat");
    });

    it("removes saved query when delete button is clicked", async () => {
      const user = userEvent.setup();
      const store = createStore();
      store.set(savedQueriesAtom, [createSavedQuery()]);
      render(
        <Provider store={store}>
          <CommonQueriesPanelSection />
        </Provider>,
      );

      await user.click(screen.getByRole("button", { name: "Edit" }));

      await user.click(
        screen.getByRole("button", {
          name: /Remove saved query: My Saved Query/i,
        }),
      );

      expect(store.get(savedQueriesAtom)).toHaveLength(0);
      expect(
        screen.queryByRole("button", { name: "My Saved Query" }),
      ).not.toBeInTheDocument();
    });

    it("shows NRQL query as tooltip on saved query button", () => {
      const store = createStore();
      const saved = createSavedQuery();
      store.set(savedQueriesAtom, [saved]);
      render(
        <Provider store={store}>
          <CommonQueriesPanelSection />
        </Provider>,
      );

      const button = screen.getByRole("button", { name: "My Saved Query" });
      expect(button).toHaveAttribute("title", saved.nrqlQuery);
    });

    it("renders multiple saved queries", () => {
      const store = createStore();
      store.set(savedQueriesAtom, [
        createSavedQuery({ id: "id-1", name: "Query A" }),
        createSavedQuery({ id: "id-2", name: "Query B" }),
      ]);
      render(
        <Provider store={store}>
          <CommonQueriesPanelSection />
        </Provider>,
      );

      expect(
        screen.getByRole("button", { name: "Query A" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Query B" }),
      ).toBeInTheDocument();
    });

    it("does not show Edit button when no saved queries", () => {
      const store = createStore();
      store.set(savedQueriesAtom, []);
      render(
        <Provider store={store}>
          <CommonQueriesPanelSection />
        </Provider>,
      );

      expect(
        screen.queryByRole("button", { name: "Edit" }),
      ).not.toBeInTheDocument();
    });

    it("shows Edit button when saved queries exist", () => {
      const store = createStore();
      store.set(savedQueriesAtom, [createSavedQuery()]);
      render(
        <Provider store={store}>
          <CommonQueriesPanelSection />
        </Provider>,
      );

      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    });

    it("toggles Edit button text to Done when clicked", async () => {
      const user = userEvent.setup();
      const store = createStore();
      store.set(savedQueriesAtom, [createSavedQuery()]);
      render(
        <Provider store={store}>
          <CommonQueriesPanelSection />
        </Provider>,
      );

      await user.click(screen.getByRole("button", { name: "Edit" }));

      expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Edit" }),
      ).not.toBeInTheDocument();
    });

    it("auto-exits edit mode when last saved query is deleted", async () => {
      const user = userEvent.setup();
      const store = createStore();
      store.set(savedQueriesAtom, [createSavedQuery()]);
      render(
        <Provider store={store}>
          <CommonQueriesPanelSection />
        </Provider>,
      );

      await user.click(screen.getByRole("button", { name: "Edit" }));
      expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();

      await user.click(
        screen.getByRole("button", {
          name: /Remove saved query: My Saved Query/i,
        }),
      );

      expect(store.get(savedQueriesAtom)).toHaveLength(0);
      expect(
        screen.queryByRole("button", { name: "Done" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Edit" }),
      ).not.toBeInTheDocument();
    });

    it("clicking Done exits edit mode and restores normal behavior", async () => {
      const user = userEvent.setup();
      const store = createStore();
      store.set(savedQueriesAtom, [createSavedQuery()]);
      render(
        <Provider store={store}>
          <CommonQueriesPanelSection />
        </Provider>,
      );

      // Enter edit mode
      await user.click(screen.getByRole("button", { name: "Edit" }));
      expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();

      // Exit edit mode
      await user.click(screen.getByRole("button", { name: "Done" }));
      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();

      // Click saved query — should apply preset, not delete
      await user.click(screen.getByRole("button", { name: "My Saved Query" }));
      expect(store.get(applicationsAtom)).toEqual(["global-tax-mapper-bff"]);
      expect(store.get(environmentAtom)).toBe("uat");
      expect(store.get(savedQueriesAtom)).toHaveLength(1);
    });

    describe("Staleness Validation", () => {
      it("shows warning icon on stale saved query", () => {
        const store = createStore();
        store.set(savedQueriesAtom, [
          createSavedQuery({
            state: {
              ...createSavedQuery().state,
              metricItems: [
                {
                  id: "test-1",
                  field: "removed.field",
                  aggregationType: "count",
                  filters: [],
                },
              ],
            },
          }),
        ]);
        render(
          <Provider store={store}>
            <CommonQueriesPanelSection />
          </Provider>,
        );

        const button = screen.getByRole("button", { name: "My Saved Query" });
        // Stale query should show warning in tooltip instead of NRQL
        expect(button).toHaveAttribute(
          "title",
          expect.stringContaining("no longer available"),
        );
      });

      it("does not show warning on valid saved query", () => {
        const store = createStore();
        const saved = createSavedQuery();
        store.set(savedQueriesAtom, [saved]);
        render(
          <Provider store={store}>
            <CommonQueriesPanelSection />
          </Provider>,
        );

        const button = screen.getByRole("button", { name: "My Saved Query" });
        // Valid query should show NRQL as tooltip
        expect(button).toHaveAttribute("title", saved.nrqlQuery);
      });

      it("stale saved query is still clickable and applies state", async () => {
        const user = userEvent.setup();
        const store = createStore();
        store.set(savedQueriesAtom, [
          createSavedQuery({
            state: {
              ...createSavedQuery().state,
              metricItems: [
                {
                  id: "test-1",
                  field: "removed.field",
                  aggregationType: "count",
                  filters: [],
                },
              ],
            },
          }),
        ]);
        render(
          <Provider store={store}>
            <CommonQueriesPanelSection />
          </Provider>,
        );

        await user.click(
          screen.getByRole("button", { name: "My Saved Query" }),
        );

        // Should still attempt to apply the state
        expect(store.get(applicationsAtom)).toEqual(["global-tax-mapper-bff"]);
        expect(store.get(environmentAtom)).toBe("uat");
      });

      it("shows multiple warnings in tooltip for multiple issues", () => {
        const store = createStore();
        store.set(savedQueriesAtom, [
          createSavedQuery({
            state: {
              applications: ["unknown-app" as unknown as Application],
              environment: "staging" as unknown as Environment,
              metricItems: [],
              timePeriod: { mode: "relative", relative: "3h ago" },
              excludeHealthChecks: true,
              excludeBulkEndpoint: true,
              useTimeseries: true,
              facet: "none",
            },
          }),
        ]);
        render(
          <Provider store={store}>
            <CommonQueriesPanelSection />
          </Provider>,
        );

        const button = screen.getByRole("button", { name: "My Saved Query" });
        const title = button.getAttribute("title") ?? "";
        expect(title).toContain("unknown-app");
        expect(title).toContain("staging");
      });
    });
  });
});
