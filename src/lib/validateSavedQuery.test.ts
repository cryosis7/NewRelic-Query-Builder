import { describe, it, expect, vi } from "vitest";
import { validateSavedQuery } from "./validateSavedQuery";
import * as buildNrqlQueryModule from "./buildNrqlQuery";
import type {
  AggregationType,
  Application,
  Environment,
  QueryState,
} from "../types/query";

// Helper to create a valid QueryState for testing
function createValidState(overrides: Partial<QueryState> = {}): QueryState {
  return {
    applications: ["global-tax-mapper-api"],
    environment: "prod",
    metricItems: [
      {
        id: "test-1",
        field: "duration",
        aggregationType: "count",
        filters: [],
      },
    ],
    timePeriod: { mode: "relative", relative: "3h ago" },
    excludeHealthChecks: true,
    excludeBulkEndpoint: true,
    useTimeseries: true,
    facet: "none",
    ...overrides,
  };
}

describe("validateSavedQuery", () => {
  it("returns valid for a fully valid state", () => {
    const state = createValidState();
    const result = validateSavedQuery(state);
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it("warns about unknown application", () => {
    const state = createValidState({
      applications: ["unknown-app" as unknown as Application],
    });
    const result = validateSavedQuery(state);
    expect(result.valid).toBe(false);
    expect(result.warnings).toContain(
      "Application 'unknown-app' is no longer available",
    );
  });

  it("warns about unknown environment", () => {
    const state = createValidState({
      environment: "staging" as unknown as Environment,
    });
    const result = validateSavedQuery(state);
    expect(result.valid).toBe(false);
    expect(result.warnings).toContain(
      "Environment 'staging' is no longer available",
    );
  });

  it("warns about unknown metric field", () => {
    const state = createValidState({
      metricItems: [
        {
          id: "test-1",
          field: "removed.field",
          aggregationType: "count",
          filters: [],
        },
      ],
    });
    const result = validateSavedQuery(state);
    expect(result.valid).toBe(false);
    expect(result.warnings).toContain(
      "Field 'removed.field' is no longer available",
    );
  });

  it("warns about unknown aggregation type", () => {
    const state = createValidState({
      metricItems: [
        {
          id: "test-1",
          field: "duration",
          aggregationType: "sum" as unknown as AggregationType,
          filters: [],
        },
      ],
    });
    const result = validateSavedQuery(state);
    expect(result.valid).toBe(false);
    expect(result.warnings).toContain(
      "Aggregation type 'sum' is no longer available",
    );
  });

  it("warns about unknown filter field", () => {
    const state = createValidState({
      metricItems: [
        {
          id: "test-1",
          field: "duration",
          aggregationType: "count",
          filters: [
            {
              id: "f-1",
              field: "removed.filter",
              operator: "=",
              value: "test",
              negated: false,
            },
          ],
        },
      ],
    });
    const result = validateSavedQuery(state);
    expect(result.valid).toBe(false);
    expect(result.warnings).toContain(
      "Filter field 'removed.filter' is no longer available",
    );
  });

  it("does not warn about valid filter fields", () => {
    const state = createValidState({
      metricItems: [
        {
          id: "test-1",
          field: "duration",
          aggregationType: "count",
          filters: [
            {
              id: "f-1",
              field: "response.status",
              operator: "=",
              value: "200",
              negated: false,
            },
          ],
        },
      ],
    });
    const result = validateSavedQuery(state);
    expect(
      result.warnings.filter((w) => w.includes("Filter field")),
    ).toHaveLength(0);
  });

  it("warns about unknown facet", () => {
    const state = createValidState({
      facet: "removed.facet",
    });
    const result = validateSavedQuery(state);
    expect(result.valid).toBe(false);
    expect(result.warnings).toContain(
      "Facet 'removed.facet' is no longer available",
    );
  });

  it("does not warn about 'none' facet", () => {
    const state = createValidState({ facet: "none" });
    const result = validateSavedQuery(state);
    expect(result.valid).toBe(true);
  });

  it("does not warn about valid facet", () => {
    const state = createValidState({ facet: "request.uri" });
    const result = validateSavedQuery(state);
    expect(result.valid).toBe(true);
  });

  it("collects multiple warnings", () => {
    const state = createValidState({
      applications: ["unknown-app" as unknown as Application],
      environment: "staging" as unknown as Environment,
      metricItems: [
        {
          id: "test-1",
          field: "removed.field",
          aggregationType: "sum" as unknown as AggregationType,
          filters: [],
        },
      ],
    });
    const result = validateSavedQuery(state);
    expect(result.valid).toBe(false);
    expect(result.warnings.length).toBeGreaterThanOrEqual(4);
  });

  it("warns when regenerated query differs from saved", () => {
    const state = createValidState();
    const result = validateSavedQuery(
      state,
      "SELECT something_different FROM Transaction",
    );
    expect(result.valid).toBe(false);
    expect(result.warnings).toContain(
      "Query output has changed since this query was saved",
    );
  });

  it("does not warn when regenerated query matches saved", () => {
    const state = createValidState();
    const expectedQuery = buildNrqlQueryModule.buildNrqlQuery(state);
    const result = validateSavedQuery(state, expectedQuery);
    expect(result.valid).toBe(true);
  });

  it("validates all valid field names", () => {
    const validFields = [
      "duration",
      "response.status",
      "request.uri",
      "request.method",
      "name",
      "appName",
    ];
    for (const field of validFields) {
      const state = createValidState({
        metricItems: [
          {
            id: "test-1",
            field,
            aggregationType: "count",
            filters: [],
          },
        ],
      });
      const result = validateSavedQuery(state);
      expect(result.warnings.filter((w) => w.includes("Field"))).toHaveLength(
        0,
      );
    }
  });

  it("validates all valid aggregation types", () => {
    const validTypes = ["average", "count", "p95", "uniques", "median"];
    for (const type of validTypes) {
      const state = createValidState({
        metricItems: [
          {
            id: "test-1",
            field: "duration",
            aggregationType: type as AggregationType,
            filters: [],
          },
        ],
      });
      const result = validateSavedQuery(state);
      expect(
        result.warnings.filter((w) => w.includes("Aggregation")),
      ).toHaveLength(0);
    }
  });

  it("warns about invalid time period mode", () => {
    const state = createValidState({
      timePeriod: {
        mode: "invalid" as unknown as QueryState["timePeriod"]["mode"],
        relative: "3h ago",
      },
    });
    const result = validateSavedQuery(state);
    expect(result.valid).toBe(false);
    expect(result.warnings).toContain(
      "Time period mode 'invalid' is not recognized",
    );
  });

  it("does not warn about absolute time period mode", () => {
    const state = createValidState({
      timePeriod: {
        mode: "absolute",
        since: "2025-01-01T00:00:00",
        until: "2025-01-02T00:00:00",
        relative: "3h ago",
      },
    });
    const result = validateSavedQuery(state);
    expect(
      result.warnings.filter((w) => w.includes("Time period mode")),
    ).toHaveLength(0);
  });

  it("warns when buildNrqlQuery throws an error", () => {
    const state = createValidState();

    // Mock buildNrqlQuery to throw an error
    const spy = vi
      .spyOn(buildNrqlQueryModule, "buildNrqlQuery")
      .mockImplementation(() => {
        throw new Error("Test error");
      });

    const result = validateSavedQuery(state, "SELECT * FROM Transaction");

    expect(result.valid).toBe(false);
    expect(result.warnings).toContain(
      "Unable to regenerate query from saved state",
    );

    spy.mockRestore();
  });
});
