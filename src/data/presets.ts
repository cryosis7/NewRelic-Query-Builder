import type { QueryState, TimePeriod } from '../types/query';

export interface QueryPreset {
  id: string;
  name: string;
  description: string;
  state: Partial<QueryState>;
}

// Helper to get time period for last N hours
function getLastNHours(hours: number): TimePeriod {
  return {
    mode: 'relative',
    relative: `${hours}h ago`,
  };
}

export const QUERY_PRESETS: QueryPreset[] = [
  {
    id: 'api-prod-1h',
    name: 'API Prod - Last Hour',
    description: 'API production metrics for the last hour',
    state: {
      applications: ['global-tax-mapper-api'],
      environment: 'prod',
      metricItems: [
        {
          id: 'preset-api-prod-1h',
          metricType: 'transaction-count',
          aggregationType: 'count',
          filters: [],
        },
      ],
      timePeriod: getLastNHours(1),
      excludeHealthChecks: true,
      facet: 'request.uri',
    },
  },
  {
    id: 'all-apps-prod-1h',
    name: 'All Apps Prod - Last Hour',
    description: 'All GTM applications in production for the last hour',
    state: {
      applications: ['global-tax-mapper-api', 'global-tax-mapper-bff', 'global-tax-mapper-integrator-api'],
      environment: 'prod',
      metricItems: [
        {
          id: 'preset-all-apps-prod-1h',
          metricType: 'transaction-count',
          aggregationType: 'count',
          filters: [],
        },
      ],
      timePeriod: getLastNHours(1),
      excludeHealthChecks: true,
      facet: 'request.uri',
    },
  },
  {
    id: 'api-uat-1h',
    name: 'API UAT - Last Hour',
    description: 'API UAT metrics for the last hour',
    state: {
      applications: ['global-tax-mapper-api'],
      environment: 'uat',
      metricItems: [
        {
          id: 'preset-api-uat-1h',
          metricType: 'transaction-count',
          aggregationType: 'count',
          filters: [],
        },
      ],
      timePeriod: getLastNHours(1),
      excludeHealthChecks: true,
      facet: 'request.uri',
    },
  },
  {
    id: 'bff-prod-24h',
    name: 'BFF Prod - Last 24 Hours',
    description: 'BFF production metrics for the last 24 hours',
    state: {
      applications: ['global-tax-mapper-bff'],
      environment: 'prod',
      metricItems: [
        {
          id: 'preset-bff-prod-24h',
          metricType: 'transaction-count',
          aggregationType: 'count',
          filters: [],
        },
      ],
      timePeriod: getLastNHours(24),
      excludeHealthChecks: true,
      facet: 'request.uri',
    },
  },
  {
    id: 'integrator-prod-1h',
    name: 'Integrator Prod - Last Hour',
    description: 'Integrator API production metrics for the last hour',
    state: {
      applications: ['global-tax-mapper-integrator-api'],
      environment: 'prod',
      metricItems: [
        {
          id: 'preset-integrator-prod-1h',
          metricType: 'transaction-count',
          aggregationType: 'count',
          filters: [],
        },
      ],
      timePeriod: getLastNHours(1),
      excludeHealthChecks: true,
      facet: 'request.uri',
    },
  },
  {
    id: 'gtm-latency-3h',
    name: 'GTM Latency - Last 3 Hours',
    description: 'Average duration for all applications over the last 3 hours',
    state: {
      applications: ['global-tax-mapper-api', 'global-tax-mapper-bff', 'global-tax-mapper-integrator-api'],
      environment: 'prod',
      metricItems: [
        {
          id: 'preset-gtm-latency-3h',
          metricType: 'duration',
          aggregationType: 'average',
          filters: [],
        },
      ],
      timePeriod: getLastNHours(3),
      excludeHealthChecks: true,
      useTimeseries: true,
      facet: 'name',
    },
  },
  {
    id: 'api-throughput-3h',
    name: 'API Throughput - Last 3 Hours',
    description: 'Total count and counts by response status (2xx, 4xx, 5xx) for the last 3 hours',
    state: {
      applications: ['global-tax-mapper-api'],
      environment: 'prod',
      metricItems: [
        {
          id: 'preset-api-throughput-total',
          metricType: 'transaction-count',
          aggregationType: 'count',
          filters: [],
        },
        {
          id: 'preset-api-throughput-2xx',
          metricType: 'response.status',
          aggregationType: 'count',
          filters: [
            {
              id: 'filter-2xx',
              field: 'response.status',
              operator: '>=',
              value: '200',
            },
            {
              id: 'filter-2xx-upper',
              field: 'response.status',
              operator: '<',
              value: '300',
            },
          ],
        },
        {
          id: 'preset-api-throughput-4xx',
          metricType: 'response.status',
          aggregationType: 'count',
          filters: [
            {
              id: 'filter-4xx',
              field: 'response.status',
              operator: '>=',
              value: '400',
            },
            {
              id: 'filter-4xx-upper',
              field: 'response.status',
              operator: '<',
              value: '500',
            },
          ],
        },
        {
          id: 'preset-api-throughput-5xx',
          metricType: 'response.status',
          aggregationType: 'count',
          filters: [
            {
              id: 'filter-5xx',
              field: 'response.status',
              operator: '>=',
              value: '500',
            },
            {
              id: 'filter-5xx-upper',
              field: 'response.status',
              operator: '<',
              value: '600',
            },
          ],
        },
      ],
      timePeriod: getLastNHours(3),
      excludeHealthChecks: true,
      useTimeseries: true,
      facet: 'none',
    },
  },
];
