import {
  buildNrqlQuery,
  generateId,
  createMetricFilter,
  createMetricItem,
} from "./buildNrqlQuery";
import type { MetricFilter, MetricQueryItem, QueryState } from "../types/query";
import {
  AGGREGATION_TYPES,
  BULK_ENDPOINT_PATHS,
  getAggregationConfig,
  HEALTH_CHECK_PATHS,
} from "../types/query";

function createTestFilter(overrides: Partial<MetricFilter> = {}): MetricFilter {
  return {
    id: "filter-1",
    field: "duration",
    operator: ">",
    value: "",
    negated: false,
    ...overrides,
  };
}

function createTestMetric(
  overrides: Partial<MetricQueryItem> = {},
): MetricQueryItem {
  return {
    id: "metric-1",
    field: "duration",
    aggregationType: "count",
    filters: [],
    ...overrides,
  };
}

function createTestState(overrides: Partial<QueryState> = {}): QueryState {
  return {
    applications: ["global-tax-mapper-api"],
    environment: "prod",
    metricItems: [createTestMetric()],
    timePeriod: {
      mode: "relative",
      since: "2026-01-28T08:00",
      until: "2026-01-28T09:00",
      relative: "1h ago",
    },
    excludeHealthChecks: false,
    excludeBulkEndpoint: false,
    useTimeseries: false,
    facet: "none",
    ...overrides,
  };
}

// Helper to build expected query strings for comparison
interface ExpectedQueryOptions {
  select: string;
  apps: string[];
  environment?: string;
  excludeHealthChecks?: boolean;
  excludeBulkEndpoint?: boolean;
  additionalWhereConditions?: string[];
  timeseries?: boolean;
  since?: string;
  until?: string;
  facet?: string;
}

function buildExpectedQuery(options: ExpectedQueryOptions): string {
  const {
    select,
    apps,
    environment = "prod",
    excludeHealthChecks = false,
    excludeBulkEndpoint = false,
    additionalWhereConditions = [],
    timeseries = false,
    since = "SINCE 1 hours ago",
    until = "UNTIL now",
    facet,
  } = options;

  const appNames = apps.map((app) => `'${app}-${environment}'`).join(", ");
  const whereConditions: string[] = [`appName IN (${appNames})`];

  if (excludeHealthChecks && excludeBulkEndpoint) {
    const paths = [...HEALTH_CHECK_PATHS, ...BULK_ENDPOINT_PATHS]
      .map((p) => `'${p}'`)
      .join(", ");
    whereConditions.push(`request.uri NOT IN (${paths})`);
  } else if (excludeHealthChecks) {
    const paths = HEALTH_CHECK_PATHS.map((p) => `'${p}'`).join(", ");
    whereConditions.push(`request.uri NOT IN (${paths})`);
  } else if (excludeBulkEndpoint) {
    const paths = BULK_ENDPOINT_PATHS.map((p) => `'${p}'`).join(", ");
    whereConditions.push(`request.uri NOT IN (${paths})`);
  }

  whereConditions.push(...additionalWhereConditions);

  const parts = [
    "FROM Transaction",
    `SELECT ${select}`,
    `WHERE ${whereConditions.join(" AND ")}`,
  ];

  if (timeseries) {
    parts.push("TIMESERIES AUTO");
  }

  parts.push(since);
  parts.push(until);

  if (facet) {
    parts.push(`FACET ${facet}`);
  }

  return parts.join("\n");
}

describe("buildNrqlQuery", () => {
  describe("generateId", () => {
    it("generates fallback id when crypto.randomUUID is unavailable", () => {
      const originalRandomUUID = crypto.randomUUID;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (crypto as any).randomUUID = undefined;
      try {
        const id = generateId();
        expect(id).toMatch(/^id-\d+-[0-9a-f]+$/);
      } finally {
        crypto.randomUUID = originalRandomUUID;
      }
    });
  });

  describe("applications", () => {
    it("returns a comment when no applications are selected", () => {
      const state = createTestState({ applications: [] });
      const result = buildNrqlQuery(state);
      expect(result).toBe("-- Select at least one application");
    });

    it("formats single application correctly with environment suffix", () => {
      const state = createTestState({
        applications: ["global-tax-mapper-api"],
        environment: "prod",
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        environment: "prod",
      });
      expect(result).toBe(expected);
    });

    it("formats multiple applications as comma-separated list in appName IN()", () => {
      const state = createTestState({
        applications: ["global-tax-mapper-api", "global-tax-mapper-bff"],
        environment: "prod",
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api", "global-tax-mapper-bff"],
        environment: "prod",
      });
      expect(result).toBe(expected);
    });

    it("formats all three applications correctly", () => {
      const state = createTestState({
        applications: [
          "global-tax-mapper-api",
          "global-tax-mapper-bff",
          "global-tax-mapper-integrator-api",
        ],
        environment: "prod",
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: [
          "global-tax-mapper-api",
          "global-tax-mapper-bff",
          "global-tax-mapper-integrator-api",
        ],
        environment: "prod",
      });
      expect(result).toBe(expected);
    });
  });

  describe("environments", () => {
    it.each`
      environment | label
      ${"prod"}   | ${"applies prod suffix correctly"}
      ${"uat"}    | ${"applies uat suffix correctly"}
    `("$label", ({ environment }) => {
      const state = createTestState({
        applications: ["global-tax-mapper-api"],
        environment,
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        environment,
      });
      expect(result).toBe(expected);
    });

    it("applies environment suffix to multiple applications", () => {
      const state = createTestState({
        applications: ["global-tax-mapper-api", "global-tax-mapper-bff"],
        environment: "uat",
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api", "global-tax-mapper-bff"],
        environment: "uat",
      });
      expect(result).toBe(expected);
    });
  });

  describe("metric fields", () => {
    it.each`
      field                | aggregationType | expectedSelect
      ${"duration"}        | ${"average"}    | ${"average(duration)"}
      ${"duration"}        | ${"count"}      | ${"count(duration)"}
      ${"duration"}        | ${"p95"}        | ${"percentile(duration, 95)"}
      ${"response.status"} | ${"count"}      | ${"count(response.status)"}
    `(
      "generates SELECT $expectedSelect for $field field with $aggregationType aggregation",
      ({ field, aggregationType, expectedSelect }) => {
        const state = createTestState({
          metricItems: [createTestMetric({ field, aggregationType })],
        });
        const result = buildNrqlQuery(state);
        const expected = buildExpectedQuery({
          select: expectedSelect,
          apps: ["global-tax-mapper-api"],
        });
        expect(result).toBe(expected);
      },
    );

    it("generates multiple SELECT clauses for multiple metrics", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            id: "metric-1",
            field: "duration",
            aggregationType: "count",
          }),
          createTestMetric({
            id: "metric-2",
            field: "duration",
            aggregationType: "average",
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration), average(duration)",
        apps: ["global-tax-mapper-api"],
      });
      expect(result).toBe(expected);
    });

    it("returns comment when no metrics are selected", () => {
      const state = createTestState({ metricItems: [] });
      const result = buildNrqlQuery(state);
      expect(result).toBe("-- Select at least one metric");
    });

    it("falls back to count(field) for unknown aggregation type", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            field: "duration",
            aggregationType: "invalid_agg",
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain("SELECT count(duration)");
    });
  });

  describe("path exclusions", () => {
    it.each`
      excludeHealthChecks | label
      ${true}             | ${"includes health check paths exclusion when excludeHealthChecks is true"}
      ${false}            | ${"omits health check path exclusion when excludeHealthChecks is false"}
    `("$label", ({ excludeHealthChecks }) => {
      const state = createTestState({
        excludeHealthChecks,
        excludeBulkEndpoint: false,
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        excludeHealthChecks,
        excludeBulkEndpoint: false,
      });
      expect(result).toBe(expected);
    });

    it.each`
      excludeBulkEndpoint | label
      ${true}             | ${"includes bulk endpoint path exclusion when excludeBulkEndpoint is true"}
      ${false}            | ${"omits bulk endpoint path exclusion when excludeBulkEndpoint is false"}
    `("$label", ({ excludeBulkEndpoint }) => {
      const state = createTestState({
        excludeHealthChecks: false,
        excludeBulkEndpoint,
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        excludeHealthChecks: false,
        excludeBulkEndpoint,
      });
      expect(result).toBe(expected);
    });

    it("combines health check and bulk endpoint exclusions into single NOT IN", () => {
      const state = createTestState({
        excludeHealthChecks: true,
        excludeBulkEndpoint: true,
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        excludeHealthChecks: true,
        excludeBulkEndpoint: true,
      });
      expect(result).toBe(expected);
    });
  });

  describe("timeseries", () => {
    it.each`
      useTimeseries | label
      ${true}       | ${"includes TIMESERIES AUTO when useTimeseries is true"}
      ${false}      | ${"excludes TIMESERIES clause when useTimeseries is false"}
    `("$label", ({ useTimeseries }) => {
      const state = createTestState({ useTimeseries });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        timeseries: useTimeseries,
      });
      expect(result).toBe(expected);
    });
  });

  describe("time formatting", () => {
    it("formats absolute SINCE and UNTIL clauses in NRQL format with timezone", () => {
      const state = createTestState({
        timePeriod: {
          mode: "absolute",
          since: "2026-01-28T08:00",
          until: "2026-01-28T09:00",
          relative: "1h ago",
        },
      });
      const result = buildNrqlQuery(state);
      // Timezone depends on local env, so we match the pattern
      expect(result).toMatch(/SINCE '2026-01-28 08:00:00 [+-]\d{2}:\d{2}'/);
      expect(result).toMatch(/UNTIL '2026-01-28 09:00:00 [+-]\d{2}:\d{2}'/);
    });

    it("uses default since/until when absolute mode has empty strings", () => {
      const state = createTestState({
        timePeriod: {
          mode: "absolute",
          since: "",
          until: "",
          relative: "1h ago",
        },
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain("SINCE '");
      expect(result).toContain("UNTIL '");
    });
  });

  describe("full query structure", () => {
    it("generates a complete valid NRQL query with all components", () => {
      const state = createTestState({
        applications: ["global-tax-mapper-api", "global-tax-mapper-bff"],
        environment: "prod",
        metricItems: [
          createTestMetric({ field: "duration", aggregationType: "count" }),
        ],
        excludeHealthChecks: true,
        excludeBulkEndpoint: true,
        useTimeseries: true,
        facet: "request.uri",
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api", "global-tax-mapper-bff"],
        environment: "prod",
        excludeHealthChecks: true,
        excludeBulkEndpoint: true,
        timeseries: true,
        facet: "request.uri",
      });
      expect(result).toBe(expected);
    });

    it("generates query with minimal options", () => {
      const state = createTestState({
        applications: ["global-tax-mapper-api"],
        environment: "prod",
        metricItems: [createTestMetric()],
        excludeHealthChecks: false,
        excludeBulkEndpoint: false,
        useTimeseries: false,
        facet: "none",
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        environment: "prod",
      });
      expect(result).toBe(expected);
    });
  });
  describe("faceting", () => {
    it.each`
      facet                | expectedFacet        | label
      ${"request.uri"}     | ${"request.uri"}     | ${"includes FACET clause when facet is set to request.uri"}
      ${"response.status"} | ${"response.status"} | ${"includes FACET clause when facet is set to response.status"}
      ${"http.method"}     | ${"http.method"}     | ${"includes FACET clause when facet is set to http.method"}
      ${"name"}            | ${"name"}            | ${"includes FACET clause when facet is set to name"}
      ${"none"}            | ${undefined}         | ${"excludes FACET clause when facet is set to none"}
    `("$label", ({ facet, expectedFacet }) => {
      const state = createTestState({ facet });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        ...(expectedFacet && { facet: expectedFacet }),
      });
      expect(result).toBe(expected);
    });
  });
  describe("relative time periods", () => {
    it("formats relative SINCE and UNTIL now clauses", () => {
      const state = createTestState({
        timePeriod: {
          mode: "relative",
          since: "2026-01-28T08:00",
          until: "2026-01-28T09:00",
          relative: "3h ago",
        },
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        since: "SINCE 3 hours ago",
        until: "UNTIL now",
      });
      expect(result).toBe(expected);
    });

    it("returns a helpful comment for invalid relative input", () => {
      const state = createTestState({
        timePeriod: {
          mode: "relative",
          since: "2026-01-28T08:00",
          until: "2026-01-28T09:00",
          relative: "yesterday-ish",
        },
      });
      const result = buildNrqlQuery(state);
      expect(result).toBe("-- Enter a valid relative time (e.g., 3h ago)");
    });

    it("parses minutes input correctly", () => {
      const state = createTestState({
        timePeriod: { mode: "relative", relative: "30m ago" },
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        since: "SINCE 30 minutes ago",
        until: "UNTIL now",
      });
      expect(result).toBe(expected);
    });

    it("parses days input correctly", () => {
      const state = createTestState({
        timePeriod: { mode: "relative", relative: "7d ago" },
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        since: "SINCE 7 days ago",
        until: "UNTIL now",
      });
      expect(result).toBe(expected);
    });

    it("parses long-form time units", () => {
      const state = createTestState({
        timePeriod: { mode: "relative", relative: "2 hours ago" },
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        since: "SINCE 2 hours ago",
        until: "UNTIL now",
      });
      expect(result).toBe(expected);
    });
  });

  describe("metric filters", () => {
    it("uses global WHERE when only one metric has a filter", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            filters: [createTestFilter({ value: "0.5" })],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: ["duration > 0.5"],
      });
      expect(result).toBe(expected);
    });

    it("uses filter() when a metric filter would conflict with another metric", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            id: "metric-1",
            filters: [createTestFilter({ value: "0.5" })],
          }),
          createTestMetric({
            id: "metric-2",
            aggregationType: "average",
            filters: [],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select:
          "filter(count(duration), WHERE duration > 0.5), average(duration)",
        apps: ["global-tax-mapper-api"],
      });
      expect(result).toBe(expected);
    });

    it("wraps only the metric with filters when others have none", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            id: "metric-1",
            filters: [],
          }),
          createTestMetric({
            id: "metric-2",
            aggregationType: "average",
            filters: [createTestFilter({ id: "f2", value: "1.0" })],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select:
          "count(duration), filter(average(duration), WHERE duration > 1.0)",
        apps: ["global-tax-mapper-api"],
      });
      expect(result).toBe(expected);
    });
  });

  describe("response.status filters", () => {
    it("filters single exact status code with =", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            field: "response.status",
            filters: [
              createTestFilter({
                field: "response.status",
                operator: "=",
                value: "404",
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(response.status)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: ["response.status = 404"],
      });
      expect(result).toBe(expected);
    });

    it("filters multiple exact status codes with IN", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            field: "response.status",
            filters: [
              createTestFilter({
                field: "response.status",
                operator: "=",
                value: "404, 503, 500",
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(response.status)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: ["response.status IN (404, 503, 500)"],
      });
      expect(result).toBe(expected);
    });

    it("filters single fuzzy status code with LIKE (4xx format)", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            field: "response.status",
            filters: [
              createTestFilter({
                field: "response.status",
                operator: "=",
                value: "4xx",
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(response.status)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: ["response.status LIKE '4%'"],
      });
      expect(result).toBe(expected);
    });

    it("filters single fuzzy status code with LIKE (4% format)", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            field: "response.status",
            filters: [
              createTestFilter({
                field: "response.status",
                operator: "=",
                value: "4%",
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(response.status)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: ["response.status LIKE '4%'"],
      });
      expect(result).toBe(expected);
    });

    it("filters mixed exact and fuzzy codes with OR grouping", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            field: "response.status",
            filters: [
              createTestFilter({
                field: "response.status",
                operator: "=",
                value: "503, 4xx",
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(response.status)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: [
          "(response.status = 503 OR response.status LIKE '4%')",
        ],
      });
      expect(result).toBe(expected);
    });

    it("filters multiple exact and fuzzy codes with OR grouping", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            field: "response.status",
            filters: [
              createTestFilter({
                field: "response.status",
                operator: "=",
                value: "404, 503, 4xx, 5xx",
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(response.status)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: [
          "(response.status IN (404, 503) OR response.status LIKE '4%' OR response.status LIKE '5%')",
        ],
      });
      expect(result).toBe(expected);
    });

    it("filters multiple fuzzy codes with OR grouping", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            field: "response.status",
            filters: [
              createTestFilter({
                field: "response.status",
                operator: "=",
                value: "4xx, 5xx",
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(response.status)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: [
          "(response.status LIKE '4%' OR response.status LIKE '5%')",
        ],
      });
      expect(result).toBe(expected);
    });

    it("handles whitespace in comma-separated values", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            field: "response.status",
            filters: [
              createTestFilter({
                field: "response.status",
                operator: "=",
                value: " 404 , 503 , 500 ",
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(response.status)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: ["response.status IN (404, 503, 500)"],
      });
      expect(result).toBe(expected);
    });
  });

  describe("multiple filters per metric", () => {
    it("combines multiple filters with AND", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            filters: [
              createTestFilter({
                id: "filter-1",
                field: "response.status",
                operator: "=",
                value: "200",
              }),
              createTestFilter({
                id: "filter-2",
                field: "duration",
                operator: ">",
                value: "0.5",
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: ["response.status = 200 AND duration > 0.5"],
      });
      expect(result).toBe(expected);
    });

    it("ignores empty filter values", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            filters: [
              createTestFilter({
                id: "filter-1",
                field: "duration",
                operator: ">",
                value: "0.5",
              }),
              createTestFilter({
                id: "filter-2",
                field: "response.status",
                operator: "=",
                value: "",
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: ["duration > 0.5"],
      });
      expect(result).toBe(expected);
    });

    it("generates no filter when all filters have empty values", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            filters: [
              createTestFilter({
                id: "filter-1",
                field: "duration",
                operator: ">",
                value: "",
              }),
              createTestFilter({
                id: "filter-2",
                field: "response.status",
                operator: "=",
                value: "   ",
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
      });
      expect(result).toBe(expected);
    });

    it("applies different filters to different metrics using filter()", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            id: "metric-1",
            filters: [
              createTestFilter({
                field: "response.status",
                operator: "=",
                value: "4xx",
              }),
            ],
          }),
          createTestMetric({
            id: "metric-2",
            aggregationType: "average",
            filters: [
              createTestFilter({
                id: "filter-2",
                field: "duration",
                operator: ">",
                value: "1",
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select:
          "filter(count(duration), WHERE response.status LIKE '4%'), filter(average(duration), WHERE duration > 1)",
        apps: ["global-tax-mapper-api"],
      });
      expect(result).toBe(expected);
    });

    it("lifts shared filters to global WHERE clause", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            id: "metric-1",
            filters: [
              createTestFilter({
                field: "response.status",
                operator: "=",
                value: "200",
              }),
            ],
          }),
          createTestMetric({
            id: "metric-2",
            aggregationType: "average",
            filters: [
              createTestFilter({
                id: "filter-2",
                field: "response.status",
                operator: "=",
                value: "200",
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration), average(duration)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: ["response.status = 200"],
      });
      expect(result).toBe(expected);
    });

    it("lifts multiple shared filters to global WHERE clause", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            id: "metric-1",
            filters: [
              createTestFilter({
                id: "f1",
                field: "response.status",
                operator: "=",
                value: "200",
              }),
              createTestFilter({
                id: "f2",
                field: "duration",
                operator: ">",
                value: "0.5",
              }),
            ],
          }),
          createTestMetric({
            id: "metric-2",
            aggregationType: "average",
            filters: [
              createTestFilter({
                id: "f3",
                field: "response.status",
                operator: "=",
                value: "200",
              }),
              createTestFilter({
                id: "f4",
                field: "duration",
                operator: ">",
                value: "0.5",
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      // Note: filters are sorted alphabetically when lifted to global WHERE
      const expected = buildExpectedQuery({
        select: "count(duration), average(duration)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: ["response.status = 200 AND duration > 0.5"],
      });
      expect(result).toBe(expected);
    });
  });

  describe("negated filters", () => {
    describe("numeric operators", () => {
      it("negates = operator to !=", () => {
        const state = createTestState({
          metricItems: [
            createTestMetric({
              filters: [
                createTestFilter({
                  field: "duration",
                  operator: "=",
                  value: "0.5",
                  negated: true,
                }),
              ],
            }),
          ],
        });
        const result = buildNrqlQuery(state);
        const expected = buildExpectedQuery({
          select: "count(duration)",
          apps: ["global-tax-mapper-api"],
          additionalWhereConditions: ["duration != 0.5"],
        });
        expect(result).toBe(expected);
      });

      it("negates > operator to <=", () => {
        const state = createTestState({
          metricItems: [
            createTestMetric({
              filters: [
                createTestFilter({
                  field: "duration",
                  operator: ">",
                  value: "0.5",
                  negated: true,
                }),
              ],
            }),
          ],
        });
        const result = buildNrqlQuery(state);
        const expected = buildExpectedQuery({
          select: "count(duration)",
          apps: ["global-tax-mapper-api"],
          additionalWhereConditions: ["duration <= 0.5"],
        });
        expect(result).toBe(expected);
      });

      it("negates >= operator to <", () => {
        const state = createTestState({
          metricItems: [
            createTestMetric({
              filters: [
                createTestFilter({
                  field: "duration",
                  operator: ">=",
                  value: "0.5",
                  negated: true,
                }),
              ],
            }),
          ],
        });
        const result = buildNrqlQuery(state);
        const expected = buildExpectedQuery({
          select: "count(duration)",
          apps: ["global-tax-mapper-api"],
          additionalWhereConditions: ["duration < 0.5"],
        });
        expect(result).toBe(expected);
      });

      it("negates < operator to >=", () => {
        const state = createTestState({
          metricItems: [
            createTestMetric({
              filters: [
                createTestFilter({
                  field: "duration",
                  operator: "<",
                  value: "0.5",
                  negated: true,
                }),
              ],
            }),
          ],
        });
        const result = buildNrqlQuery(state);
        const expected = buildExpectedQuery({
          select: "count(duration)",
          apps: ["global-tax-mapper-api"],
          additionalWhereConditions: ["duration >= 0.5"],
        });
        expect(result).toBe(expected);
      });

      it("negates <= operator to >", () => {
        const state = createTestState({
          metricItems: [
            createTestMetric({
              filters: [
                createTestFilter({
                  field: "duration",
                  operator: "<=",
                  value: "0.5",
                  negated: true,
                }),
              ],
            }),
          ],
        });
        const result = buildNrqlQuery(state);
        const expected = buildExpectedQuery({
          select: "count(duration)",
          apps: ["global-tax-mapper-api"],
          additionalWhereConditions: ["duration > 0.5"],
        });
        expect(result).toBe(expected);
      });
    });

    describe("string operators", () => {
      it("negates = operator to != for string fields", () => {
        const state = createTestState({
          metricItems: [
            createTestMetric({
              filters: [
                createTestFilter({
                  field: "request.uri",
                  operator: "=",
                  value: "/api/test",
                  negated: true,
                }),
              ],
            }),
          ],
        });
        const result = buildNrqlQuery(state);
        const expected = buildExpectedQuery({
          select: "count(duration)",
          apps: ["global-tax-mapper-api"],
          additionalWhereConditions: ["request.uri != '/api/test'"],
        });
        expect(result).toBe(expected);
      });

      it("negates IN operator to NOT IN for string fields", () => {
        const state = createTestState({
          metricItems: [
            createTestMetric({
              filters: [
                createTestFilter({
                  field: "request.uri",
                  operator: "IN",
                  value: "/api/test, /api/other",
                  negated: true,
                }),
              ],
            }),
          ],
        });
        const result = buildNrqlQuery(state);
        const expected = buildExpectedQuery({
          select: "count(duration)",
          apps: ["global-tax-mapper-api"],
          additionalWhereConditions: [
            "request.uri NOT IN (/api/test, /api/other)",
          ],
        });
        expect(result).toBe(expected);
      });
    });

    describe("response.status filters", () => {
      it("negates single exact status code = to !=", () => {
        const state = createTestState({
          metricItems: [
            createTestMetric({
              field: "response.status",
              filters: [
                createTestFilter({
                  field: "response.status",
                  operator: "=",
                  value: "404",
                  negated: true,
                }),
              ],
            }),
          ],
        });
        const result = buildNrqlQuery(state);
        const expected = buildExpectedQuery({
          select: "count(response.status)",
          apps: ["global-tax-mapper-api"],
          additionalWhereConditions: ["response.status != 404"],
        });
        expect(result).toBe(expected);
      });

      it("negates multiple exact status codes IN to NOT IN", () => {
        const state = createTestState({
          metricItems: [
            createTestMetric({
              field: "response.status",
              filters: [
                createTestFilter({
                  field: "response.status",
                  operator: "=",
                  value: "404, 503, 500",
                  negated: true,
                }),
              ],
            }),
          ],
        });
        const result = buildNrqlQuery(state);
        const expected = buildExpectedQuery({
          select: "count(response.status)",
          apps: ["global-tax-mapper-api"],
          additionalWhereConditions: ["response.status NOT IN (404, 503, 500)"],
        });
        expect(result).toBe(expected);
      });

      it("negates single fuzzy status code LIKE to NOT LIKE", () => {
        const state = createTestState({
          metricItems: [
            createTestMetric({
              field: "response.status",
              filters: [
                createTestFilter({
                  field: "response.status",
                  operator: "=",
                  value: "4xx",
                  negated: true,
                }),
              ],
            }),
          ],
        });
        const result = buildNrqlQuery(state);
        const expected = buildExpectedQuery({
          select: "count(response.status)",
          apps: ["global-tax-mapper-api"],
          additionalWhereConditions: ["response.status NOT LIKE '4%'"],
        });
        expect(result).toBe(expected);
      });

      it("negates multiple fuzzy status codes with OR grouping", () => {
        const state = createTestState({
          metricItems: [
            createTestMetric({
              field: "response.status",
              filters: [
                createTestFilter({
                  field: "response.status",
                  operator: "=",
                  value: "4xx, 5xx",
                  negated: true,
                }),
              ],
            }),
          ],
        });
        const result = buildNrqlQuery(state);
        const expected = buildExpectedQuery({
          select: "count(response.status)",
          apps: ["global-tax-mapper-api"],
          additionalWhereConditions: [
            "(response.status NOT LIKE '4%' OR response.status NOT LIKE '5%')",
          ],
        });
        expect(result).toBe(expected);
      });

      it("negates mixed exact and fuzzy codes with OR grouping", () => {
        const state = createTestState({
          metricItems: [
            createTestMetric({
              field: "response.status",
              filters: [
                createTestFilter({
                  field: "response.status",
                  operator: "=",
                  value: "503, 4xx",
                  negated: true,
                }),
              ],
            }),
          ],
        });
        const result = buildNrqlQuery(state);
        const expected = buildExpectedQuery({
          select: "count(response.status)",
          apps: ["global-tax-mapper-api"],
          additionalWhereConditions: [
            "(response.status != 503 OR response.status NOT LIKE '4%')",
          ],
        });
        expect(result).toBe(expected);
      });

      it("negates multiple exact and fuzzy codes with OR grouping", () => {
        const state = createTestState({
          metricItems: [
            createTestMetric({
              field: "response.status",
              filters: [
                createTestFilter({
                  field: "response.status",
                  operator: "=",
                  value: "404, 503, 4xx, 5xx",
                  negated: true,
                }),
              ],
            }),
          ],
        });
        const result = buildNrqlQuery(state);
        const expected = buildExpectedQuery({
          select: "count(response.status)",
          apps: ["global-tax-mapper-api"],
          additionalWhereConditions: [
            "(response.status NOT IN (404, 503) OR response.status NOT LIKE '4%' OR response.status NOT LIKE '5%')",
          ],
        });
        expect(result).toBe(expected);
      });
    });
  });

  describe("config-driven aggregation types", () => {
    describe("AGGREGATION_TYPES configuration", () => {
      it.each(
        AGGREGATION_TYPES.map((config) => [
          config.value,
          config.label,
          config.nrqlTemplate,
        ]),
      )(
        "supports %s aggregation type (%s) with template %s",
        (value, _label, nrqlTemplate) => {
          const expectedSelect = nrqlTemplate.replace("{field}", "duration");
          const state = createTestState({
            metricItems: [
              createTestMetric({ field: "duration", aggregationType: value }),
            ],
          });
          const result = buildNrqlQuery(state);
          expect(result).toContain(`SELECT ${expectedSelect}`);
        },
      );

      it("generates correct NRQL for all aggregation types from config", () => {
        // Test that every aggregation type in AGGREGATION_TYPES produces valid NRQL
        for (const config of AGGREGATION_TYPES) {
          const state = createTestState({
            metricItems: [
              createTestMetric({
                field: "duration",
                aggregationType: config.value,
              }),
            ],
          });
          const result = buildNrqlQuery(state);
          const expectedSelect = config.nrqlTemplate.replace(
            "{field}",
            "duration",
          );
          expect(result).toContain(expectedSelect);
        }
      });
    });

    describe("nrqlTemplate interpolation", () => {
      it.each([
        ["count", "count(duration)", "duration"],
        ["average", "average(duration)", "duration"],
        ["p95", "percentile(duration, 95)", "duration"],
        ["uniques", "uniques(response.status)", "response.status"],
        ["median", "median(duration)", "duration"],
      ] as const)(
        "interpolates %s template to %s for field %s",
        (aggregationType, expectedNrql, field) => {
          const state = createTestState({
            metricItems: [createTestMetric({ field, aggregationType })],
          });
          const result = buildNrqlQuery(state);
          expect(result).toContain(`SELECT ${expectedNrql}`);
        },
      );

      it("correctly replaces {field} placeholder with any field name", () => {
        const fields = [
          "duration",
          "response.status",
          "request.uri",
          "http.method",
          "name",
        ];

        for (const field of fields) {
          const state = createTestState({
            metricItems: [
              createTestMetric({ field, aggregationType: "count" }),
            ],
          });
          const result = buildNrqlQuery(state);
          expect(result).toContain(`count(${field})`);
        }
      });
    });

    describe("aggregation type and field combinations", () => {
      it.each(
        AGGREGATION_TYPES.map((config) => [config.value, config.nrqlTemplate]),
      )(
        "generates correct SELECT for %s aggregation on response.status field",
        (aggregationType, nrqlTemplate) => {
          const expectedSelect = nrqlTemplate.replace(
            "{field}",
            "response.status",
          );
          const state = createTestState({
            metricItems: [
              createTestMetric({ field: "response.status", aggregationType }),
            ],
          });
          const result = buildNrqlQuery(state);
          expect(result).toContain(`SELECT ${expectedSelect}`);
        },
      );

      it("supports multiple metrics with different aggregation types", () => {
        const state = createTestState({
          metricItems: [
            createTestMetric({
              id: "metric-1",
              field: "duration",
              aggregationType: "count",
            }),
            createTestMetric({
              id: "metric-2",
              field: "duration",
              aggregationType: "average",
            }),
            createTestMetric({
              id: "metric-3",
              field: "duration",
              aggregationType: "p95",
            }),
            createTestMetric({
              id: "metric-4",
              field: "duration",
              aggregationType: "median",
            }),
          ],
        });
        const result = buildNrqlQuery(state);
        expect(result).toContain("count(duration)");
        expect(result).toContain("average(duration)");
        expect(result).toContain("percentile(duration, 95)");
        expect(result).toContain("median(duration)");
      });
    });
  });

  describe("getAggregationConfig helper", () => {
    it.each(AGGREGATION_TYPES.map((config) => [config.value, config]))(
      "returns correct config for %s aggregation type",
      (type, expectedConfig) => {
        const result = getAggregationConfig(type);
        expect(result).toEqual(expectedConfig);
      },
    );

    it("returns undefined for invalid aggregation type", () => {
      const result = getAggregationConfig("invalid-type");
      expect(result).toBeUndefined();
    });

    it("returns config with all required properties for each aggregation type", () => {
      for (const config of AGGREGATION_TYPES) {
        const result = getAggregationConfig(config.value);
        expect(result).toBeDefined();
        expect(result).toHaveProperty("value");
        expect(result).toHaveProperty("label");
        expect(result).toHaveProperty("nrqlTemplate");
        expect(typeof result!.value).toBe("string");
        expect(typeof result!.label).toBe("string");
        expect(typeof result!.nrqlTemplate).toBe("string");
        expect(result!.nrqlTemplate).toContain("{field}");
      }
    });

    it("identifies numerical aggregators correctly", () => {
      const numericalAggregators = AGGREGATION_TYPES.filter(
        (config) => config.isNumericalAggregator,
      );
      const nonNumericalAggregators = AGGREGATION_TYPES.filter(
        (config) => !config.isNumericalAggregator,
      );

      // Verify numerical aggregators
      for (const config of numericalAggregators) {
        const result = getAggregationConfig(config.value);
        expect(result?.isNumericalAggregator).toBe(true);
      }

      // Verify non-numerical aggregators
      for (const config of nonNumericalAggregators) {
        const result = getAggregationConfig(config.value);
        expect(result?.isNumericalAggregator).toBeFalsy();
      }
    });

    it("returns consistent results when called multiple times", () => {
      for (const config of AGGREGATION_TYPES) {
        const result1 = getAggregationConfig(config.value);
        const result2 = getAggregationConfig(config.value);
        expect(result1).toEqual(result2);
      }
    });
  });

  describe("optional chaining undefined paths (unknown fields)", () => {
    it("createMetricFilter with unknown field defaults to > operator", () => {
      const filter = createMetricFilter("unknownField123");
      // fieldDef is undefined for unknown field, so fieldDef?.dataType === 'string' is false
      // falls through to the else branch, returning '>'
      expect(filter.field).toBe("unknownField123");
      expect(filter.operator).toBe(">");
    });

    it("createMetricFilter with known string field defaults to = operator", () => {
      const filter = createMetricFilter("request.uri");
      // fieldDef is defined and dataType is 'string', so operator is '='
      expect(filter.field).toBe("request.uri");
      expect(filter.operator).toBe("=");
    });

    it("createMetricItem with unknown field normalizes aggregation to count", () => {
      // normalizeAggregationForMetric: fieldDef is undefined, so fieldDef?.dataType === 'numeric' is false
      // returns 'count' regardless of requested aggregationType
      const item = createMetricItem("unknownField123", "average");
      expect(item.field).toBe("unknownField123");
      expect(item.aggregationType).toBe("count");
    });

    it("createMetricItem with string field normalizes aggregation to count", () => {
      // response.status has dataType 'string', so fieldDef?.dataType === 'numeric' is false
      // returns 'count' regardless of the requested aggregationType
      const item = createMetricItem("response.status", "average");
      expect(item.field).toBe("response.status");
      expect(item.aggregationType).toBe("count");
    });

    it("createMetricItem with numeric field preserves requested aggregation", () => {
      // duration has dataType 'numeric', so fieldDef?.dataType === 'numeric' is true
      // returns the requested aggregationType as-is
      const item = createMetricItem("duration", "average");
      expect(item.field).toBe("duration");
      expect(item.aggregationType).toBe("average");
    });

    it("buildSingleFilterCondition treats unknown field as numeric (no string matching)", () => {
      // Filter with an unknown field: fieldDef is undefined, so fieldDef?.dataType === 'string' is false
      // Falls through to the numeric handling path
      const state = createTestState({
        metricItems: [
          createTestMetric({
            filters: [
              createTestFilter({
                field: "unknownField123",
                operator: ">",
                value: "42",
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: ["unknownField123 > 42"],
      });
      expect(result).toBe(expected);
    });

    it("buildSingleFilterCondition with unknown field and negated = operator", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            filters: [
              createTestFilter({
                field: "unknownField123",
                operator: "=",
                value: "42",
                negated: true,
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: ["unknownField123 != 42"],
      });
      expect(result).toBe(expected);
    });
  });

  describe("parseRelativeTimeInput edge cases", () => {
    it("returns error comment for 0h ago (amount <= 0)", () => {
      const state = createTestState({
        timePeriod: { mode: "relative", relative: "0h ago" },
      });
      const result = buildNrqlQuery(state);
      expect(result).toBe("-- Enter a valid relative time (e.g., 3h ago)");
    });

    it("returns error comment for 0m ago (amount <= 0)", () => {
      const state = createTestState({
        timePeriod: { mode: "relative", relative: "0m ago" },
      });
      const result = buildNrqlQuery(state);
      expect(result).toBe("-- Enter a valid relative time (e.g., 3h ago)");
    });

    it("parses relative time without ago suffix", () => {
      // The regex makes "ago" optional: (ago)?
      const state = createTestState({
        timePeriod: { mode: "relative", relative: "3h" },
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        since: "SINCE 3 hours ago",
        until: "UNTIL now",
      });
      expect(result).toBe(expected);
    });

    it("parses minutes without ago suffix", () => {
      const state = createTestState({
        timePeriod: { mode: "relative", relative: "15m" },
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        since: "SINCE 15 minutes ago",
        until: "UNTIL now",
      });
      expect(result).toBe(expected);
    });

    it("returns error comment for empty relative time", () => {
      const state = createTestState({
        timePeriod: { mode: "relative", relative: "" },
      });
      const result = buildNrqlQuery(state);
      expect(result).toBe("-- Enter a valid relative time (e.g., 3h ago)");
    });

    it("returns error comment for whitespace-only relative time", () => {
      const state = createTestState({
        timePeriod: { mode: "relative", relative: "   " },
      });
      const result = buildNrqlQuery(state);
      expect(result).toBe("-- Enter a valid relative time (e.g., 3h ago)");
    });
  });

  describe("buildStatusFilterCondition empty conditions path", () => {
    it("returns empty string condition for status filter with only commas", () => {
      // value ',' splits into ['', ''] which filters to [] -> exact=[], fuzzy=[]
      // conditions.length === 0 -> returns '' (the empty conditions branch)
      // The empty string is not null, so it passes through buildFilterConditions filter
      // and gets appended to WHERE clause
      const state = createTestState({
        metricItems: [
          createTestMetric({
            field: "response.status",
            filters: [
              createTestFilter({
                field: "response.status",
                operator: "=",
                value: ",",
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      // The empty string condition leaks into the WHERE clause as 'AND '
      const expected = buildExpectedQuery({
        select: "count(response.status)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: [""],
      });
      expect(result).toBe(expected);
    });

    it("returns empty string condition for status filter with only whitespace and commas", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            field: "response.status",
            filters: [
              createTestFilter({
                field: "response.status",
                operator: "=",
                value: " , , ",
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(response.status)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: [""],
      });
      expect(result).toBe(expected);
    });
  });

  describe("non-negated string filter operators", () => {
    it("uses = operator for non-negated string field", () => {
      const state = createTestState({
        metricItems: [
          createTestMetric({
            filters: [
              createTestFilter({
                field: "request.uri",
                operator: "=",
                value: "/api/test",
                negated: false,
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: ["request.uri = '/api/test'"],
      });
      expect(result).toBe(expected);
    });

    it("uses IN operator for non-negated string field", () => {
      // Tests the non-negated IN path: operator === 'IN' without negation
      const state = createTestState({
        metricItems: [
          createTestMetric({
            filters: [
              createTestFilter({
                field: "request.uri",
                operator: "IN",
                value: "'/api/test', '/api/other'",
                negated: false,
              }),
            ],
          }),
        ],
      });
      const result = buildNrqlQuery(state);
      const expected = buildExpectedQuery({
        select: "count(duration)",
        apps: ["global-tax-mapper-api"],
        additionalWhereConditions: [
          "request.uri IN ('/api/test', '/api/other')",
        ],
      });
      expect(result).toBe(expected);
    });
  });

  describe("absolute time mode with partial values", () => {
    it("uses default since when only since is empty", () => {
      const state = createTestState({
        timePeriod: {
          mode: "absolute",
          since: "",
          until: "2026-01-28T09:00",
          relative: "1h ago",
        },
      });
      const result = buildNrqlQuery(state);
      // since is empty -> falls back to default (Date.now() - 1h)
      // until is provided -> uses the provided value
      expect(result).toMatch(
        /SINCE '\d{4}-\d{2}-\d{2} \d{2}:\d{2}:00 [+-]\d{2}:\d{2}'/,
      );
      expect(result).toMatch(/UNTIL '2026-01-28 09:00:00 [+-]\d{2}:\d{2}'/);
    });

    it("uses default until when only until is empty", () => {
      const state = createTestState({
        timePeriod: {
          mode: "absolute",
          since: "2026-01-28T08:00",
          until: "",
          relative: "1h ago",
        },
      });
      const result = buildNrqlQuery(state);
      // since is provided -> uses the provided value
      // until is empty -> falls back to default (Date.now())
      expect(result).toMatch(/SINCE '2026-01-28 08:00:00 [+-]\d{2}:\d{2}'/);
      expect(result).toMatch(
        /UNTIL '\d{4}-\d{2}-\d{2} \d{2}:\d{2}:00 [+-]\d{2}:\d{2}'/,
      );
    });
  });
});
