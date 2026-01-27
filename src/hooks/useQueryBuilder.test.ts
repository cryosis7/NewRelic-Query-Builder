import { buildNrqlQuery } from './useQueryBuilder';
import type { QueryState } from '../types/query';

function createTestState(overrides: Partial<QueryState> = {}): QueryState {
  return {
    applications: ['global-tax-mapper-api'],
    environment: 'prod',
    metricType: 'count-with-average',
    timePeriod: {
      mode: 'absolute',
      since: '2026-01-28T08:00',
      until: '2026-01-28T09:00',
      relative: '1h ago',
    },
    excludeHealthChecks: true,
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
    it('generates select average(duration) for average-duration metric type', () => {
      const state = createTestState({ metricType: 'average-duration' });
      const result = buildNrqlQuery(state);
      expect(result).toContain('select average(duration)');
      expect(result).not.toContain('count(*)');
    });

    it('generates select count(*) for count metric type', () => {
      const state = createTestState({ metricType: 'count' });
      const result = buildNrqlQuery(state);
      expect(result).toContain('select count(*)');
      expect(result).not.toContain('average(duration)');
    });

    it('generates select average(duration), count(*) for count-with-average metric type', () => {
      const state = createTestState({ metricType: 'count-with-average' });
      const result = buildNrqlQuery(state);
      expect(result).toContain('select average(duration), count(*)');
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
        metricType: 'count-with-average',
        excludeHealthChecks: true,
        facet: 'request.uri',
      });
      const result = buildNrqlQuery(state);

      // Verify all parts are present
      expect(result).toContain('FROM Transaction');
      expect(result).toContain('select average(duration), count(*)');
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
});
