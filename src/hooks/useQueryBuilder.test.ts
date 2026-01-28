import { buildNrqlQuery } from './useQueryBuilder';
import type { QueryState, MetricFilter } from '../types/query';

function createTestFilter(overrides: Partial<MetricFilter> = {}): MetricFilter {
  return {
    id: 'filter-1',
    field: 'duration',
    operator: '>',
    value: '',
    ...overrides,
  };
}

function createTestState(overrides: Partial<QueryState> = {}): QueryState {
  return {
    applications: ['global-tax-mapper-api'],
    environment: 'prod',
    metricItems: [
      {
        id: 'metric-1',
        metricType: 'transaction-count',
        aggregationType: 'count',
        filters: [],
      },
    ],
    timePeriod: {
      mode: 'absolute',
      since: '2026-01-28T08:00',
      until: '2026-01-28T09:00',
      relative: '1h ago',
    },
    excludeHealthChecks: true,
    useTimeseries: true,
    facet: 'request.uri',
    ...overrides,
  };
}

describe('buildNrqlQuery', () => {
  describe('applications', () => {
    it('returns a comment when no applications are selected', () => {
      const state = createTestState({ applications: [] });
      const result = buildNrqlQuery(state);
      expect(result).toBe('-- Select at least one application');
    });

    it('formats single application correctly with environment suffix', () => {
      const state = createTestState({
        applications: ['global-tax-mapper-api'],
        environment: 'prod',
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain("appName in ('global-tax-mapper-api-prod')");
    });

    it('formats multiple applications as comma-separated list in appName in()', () => {
      const state = createTestState({
        applications: ['global-tax-mapper-api', 'global-tax-mapper-bff'],
        environment: 'prod',
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain("appName in ('global-tax-mapper-api-prod', 'global-tax-mapper-bff-prod')");
    });
  });

  describe('environments', () => {
    it('applies prod suffix correctly', () => {
      const state = createTestState({
        applications: ['global-tax-mapper-api'],
        environment: 'prod',
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain("'global-tax-mapper-api-prod'");
    });

    it('applies uat suffix correctly', () => {
      const state = createTestState({
        applications: ['global-tax-mapper-api'],
        environment: 'uat',
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain("'global-tax-mapper-api-uat'");
    });
  });

  describe('metric types', () => {
    it('generates select average(duration) for duration metric with average aggregation', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'duration',
            aggregationType: 'average',
            filters: [],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain('select average(duration)');
      expect(result).not.toContain('count(*)');
    });

    it('generates select count(*) for transaction-count metric type', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'transaction-count',
            aggregationType: 'count',
            filters: [],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain('select count(*)');
      expect(result).not.toContain('average(duration)');
    });

    it('generates select percentile(duration, 95) for duration metric with p95 aggregation', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'duration',
            aggregationType: 'p95',
            filters: [],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain('select percentile(duration, 95)');
    });

    it('generates select count(duration) for duration metric with count aggregation', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'duration',
            aggregationType: 'count',
            filters: [],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain('select count(duration)');
    });

    it('generates select count(response.status) for response.status metric', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'response.status',
            aggregationType: 'count',
            filters: [],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain('select count(response.status)');
    });
  });

  describe('health check exclusion', () => {
    it('includes request.uri not in clause when excludeHealthChecks is true', () => {
      const state = createTestState({ excludeHealthChecks: true });
      const result = buildNrqlQuery(state);
      expect(result).toContain('request.uri not in (');
      expect(result).toContain("'/ping'");
      expect(result).toContain("'/health'");
    });

    it('does not include request.uri not in clause when excludeHealthChecks is false', () => {
      const state = createTestState({ excludeHealthChecks: false });
      const result = buildNrqlQuery(state);
      expect(result).not.toContain('request.uri not in');
    });
  });

  describe('timeseries', () => {
    it('includes TIMESERIES 1 MINUTE when useTimeseries is true', () => {
      const state = createTestState({ useTimeseries: true });
      const result = buildNrqlQuery(state);
      expect(result).toContain('TIMESERIES 1 MINUTE');
    });

    it('excludes TIMESERIES clause when useTimeseries is false', () => {
      const state = createTestState({ useTimeseries: false });
      const result = buildNrqlQuery(state);
      expect(result).not.toContain('TIMESERIES');
    });
  });

  describe('time formatting', () => {
    it('formats SINCE clause in NRQL format', () => {
      const state = createTestState({
        timePeriod: {
          mode: 'absolute',
          since: '2026-01-28T08:00',
          until: '2026-01-28T09:00',
          relative: '1h ago',
        },
      });
      const result = buildNrqlQuery(state);
      // Should contain SINCE with the formatted date (timezone depends on local env)
      expect(result).toMatch(/SINCE '2026-01-28 08:00:00 [+-]\d{2}:\d{2}'/);
    });

    it('formats UNTIL clause in NRQL format', () => {
      const state = createTestState({
        timePeriod: {
          mode: 'absolute',
          since: '2026-01-28T08:00',
          until: '2026-01-28T09:00',
          relative: '1h ago',
        },
      });
      const result = buildNrqlQuery(state);
      // Should contain UNTIL with the formatted date (timezone depends on local env)
      expect(result).toMatch(/UNTIL '2026-01-28 09:00:00 [+-]\d{2}:\d{2}'/);
    });
  });

  describe('full query structure', () => {
    it('generates a complete valid NRQL query with all components', () => {
      const state = createTestState({
        applications: ['global-tax-mapper-api', 'global-tax-mapper-bff'],
        environment: 'prod',
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'transaction-count',
            aggregationType: 'count',
            filters: [],
          },
        ],
        excludeHealthChecks: true,
        facet: 'request.uri',
      });
      const result = buildNrqlQuery(state);

      // Verify all parts are present
      expect(result).toContain('FROM Transaction');
      expect(result).toContain('select count(*)');
      expect(result).toContain('WHERE');
      expect(result).toContain('appName in (');
      expect(result).toContain('request.uri not in (');
      expect(result).toContain('TIMESERIES 1 MINUTE');
      expect(result).toContain('SINCE');
      expect(result).toContain('UNTIL');
      expect(result).toContain('FACET request.uri');
    });

    it('joins WHERE conditions with and', () => {
      const state = createTestState({ excludeHealthChecks: true });
      const result = buildNrqlQuery(state);
      expect(result).toMatch(/appName in \([^)]+\) and request\.uri not in/);
    });
  });
  describe('faceting', () => {
    it('includes FACET clause when facet is set to request.uri', () => {
      const state = createTestState({ facet: 'request.uri' });
      const result = buildNrqlQuery(state);
      expect(result).toContain('FACET request.uri');
    });

    it('includes FACET clause when facet is set to response.status', () => {
      const state = createTestState({ facet: 'response.status' });
      const result = buildNrqlQuery(state);
      expect(result).toContain('FACET response.status');
    });

    it('includes FACET clause when facet is set to http.method', () => {
      const state = createTestState({ facet: 'http.method' });
      const result = buildNrqlQuery(state);
      expect(result).toContain('FACET http.method');
    });

    it('includes FACET clause when facet is set to name', () => {
      const state = createTestState({ facet: 'name' });
      const result = buildNrqlQuery(state);
      expect(result).toContain('FACET name');
    });

    it('excludes FACET clause when facet is set to none', () => {
      const state = createTestState({ facet: 'none' });
      const result = buildNrqlQuery(state);
      expect(result).not.toContain('FACET');
    });
  });
  describe('relative time periods', () => {
    it('formats relative SINCE and UNTIL now clauses', () => {
      const state = createTestState({
        timePeriod: {
          mode: 'relative',
          since: '2026-01-28T08:00',
          until: '2026-01-28T09:00',
          relative: '3h ago',
        },
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain('SINCE 3 hours ago');
      expect(result).toContain('UNTIL now');
    });

    it('returns a helpful comment for invalid relative input', () => {
      const state = createTestState({
        timePeriod: {
          mode: 'relative',
          since: '2026-01-28T08:00',
          until: '2026-01-28T09:00',
          relative: 'yesterday-ish',
        },
      });
      const result = buildNrqlQuery(state);
      expect(result).toBe('-- Enter a valid relative time (e.g., 3h ago)');
    });
  });

  describe('metric filters', () => {
    it('uses global WHERE when only one metric has a filter', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'duration',
            aggregationType: 'count',
            filters: [createTestFilter({ value: '0.5' })],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain('select count(duration)');
      expect(result).toContain('WHERE');
      expect(result).toContain('duration > 0.5');
      expect(result).not.toContain('filter(count(duration)');
    });

    it('uses filter() when a metric filter would conflict with another metric', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'duration',
            aggregationType: 'count',
            filters: [createTestFilter({ value: '0.5' })],
          },
          {
            id: 'metric-2',
            metricType: 'duration',
            aggregationType: 'average',
            filters: [],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain('select filter(count(duration), where duration > 0.5), average(duration)');
      expect(result).not.toContain('WHERE duration > 0.5');
    });
  });

  describe('response.status filters', () => {
    it('filters single exact status code with =', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'response.status',
            aggregationType: 'count',
            filters: [createTestFilter({ field: 'response.status', operator: '=', value: '404' })],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain('response.status = 404');
    });

    it('filters multiple exact status codes with IN', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'response.status',
            aggregationType: 'count',
            filters: [createTestFilter({ field: 'response.status', operator: '=', value: '404, 503, 500' })],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain('response.status IN (404, 503, 500)');
    });

    it('filters single fuzzy status code with LIKE (4xx format)', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'response.status',
            aggregationType: 'count',
            filters: [createTestFilter({ field: 'response.status', operator: 'LIKE', value: '4xx' })],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain("response.status LIKE '4%'");
    });

    it('filters single fuzzy status code with LIKE (4% format)', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'response.status',
            aggregationType: 'count',
            filters: [createTestFilter({ field: 'response.status', operator: 'LIKE', value: '4%' })],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain("response.status LIKE '4%'");
    });

    it('filters mixed exact and fuzzy codes with OR grouping', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'response.status',
            aggregationType: 'count',
            filters: [createTestFilter({ field: 'response.status', operator: '=', value: '503, 4xx' })],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain("(response.status = 503 OR response.status LIKE '4%')");
    });

    it('filters multiple exact and fuzzy codes with OR grouping', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'response.status',
            aggregationType: 'count',
            filters: [createTestFilter({ field: 'response.status', operator: '=', value: '404, 503, 4xx, 5xx' })],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain("(response.status IN (404, 503) OR response.status LIKE '4%' OR response.status LIKE '5%')");
    });

    it('filters multiple fuzzy codes with OR grouping', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'response.status',
            aggregationType: 'count',
            filters: [createTestFilter({ field: 'response.status', operator: 'LIKE', value: '4xx, 5xx' })],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain("(response.status LIKE '4%' OR response.status LIKE '5%')");
    });

    it('handles whitespace in comma-separated values', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'response.status',
            aggregationType: 'count',
            filters: [createTestFilter({ field: 'response.status', operator: '=', value: ' 404 , 503 , 500 ' })],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain('response.status IN (404, 503, 500)');
    });
  });

  describe('multiple filters per metric', () => {
    it('combines multiple filters with AND', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'transaction-count',
            aggregationType: 'count',
            filters: [
              createTestFilter({ id: 'filter-1', field: 'response.status', operator: '=', value: '200' }),
              createTestFilter({ id: 'filter-2', field: 'duration', operator: '>', value: '0.5' }),
            ],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain('response.status = 200');
      expect(result).toContain('duration > 0.5');
      expect(result).toContain(' and ');
    });

    it('ignores empty filter values', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'duration',
            aggregationType: 'count',
            filters: [
              createTestFilter({ id: 'filter-1', field: 'duration', operator: '>', value: '0.5' }),
              createTestFilter({ id: 'filter-2', field: 'response.status', operator: '=', value: '' }),
            ],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain('duration > 0.5');
      expect(result).not.toContain('response.status');
    });

    it('generates no filter when all filters have empty values', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'duration',
            aggregationType: 'count',
            filters: [
              createTestFilter({ id: 'filter-1', field: 'duration', operator: '>', value: '' }),
              createTestFilter({ id: 'filter-2', field: 'response.status', operator: '=', value: '   ' }),
            ],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain('select count(duration)');
      expect(result).not.toContain('filter(');
      expect(result).not.toContain('duration >');
      expect(result).not.toContain('response.status');
    });

    it('applies different filters to different metrics', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'transaction-count',
            aggregationType: 'count',
            filters: [createTestFilter({ field: 'response.status', operator: '=', value: '4xx' })],
          },
          {
            id: 'metric-2',
            metricType: 'duration',
            aggregationType: 'average',
            filters: [createTestFilter({ id: 'filter-2', field: 'duration', operator: '>', value: '1' })],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain("filter(count(*), where response.status LIKE '4%')");
      expect(result).toContain('filter(average(duration), where duration > 1)');
    });

    it('lifts shared filters to global WHERE clause', () => {
      const state = createTestState({
        metricItems: [
          {
            id: 'metric-1',
            metricType: 'transaction-count',
            aggregationType: 'count',
            filters: [createTestFilter({ field: 'response.status', operator: '=', value: '200' })],
          },
          {
            id: 'metric-2',
            metricType: 'duration',
            aggregationType: 'average',
            filters: [createTestFilter({ id: 'filter-2', field: 'response.status', operator: '=', value: '200' })],
          },
        ],
      });
      const result = buildNrqlQuery(state);
      expect(result).toContain('select count(*), average(duration)');
      expect(result).toContain('response.status = 200');
      expect(result).not.toContain('filter(');
    });
  });
});
