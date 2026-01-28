import type { QueryState, TimePeriod } from '../types/query';

export interface QueryPreset {
  id: string;
  name: string;
  description: string;
  state: Partial<QueryState>;
}

// Helper to get time period for last N hours
function getLastNHours(hours: number): TimePeriod {
  const now = new Date();
  const since = new Date(now.getTime() - hours * 60 * 60 * 1000);
  
  const formatForInput = (date: Date) => date.toISOString().slice(0, 16);
  
  return {
    mode: 'absolute',
    since: formatForInput(since),
    until: formatForInput(now),
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
];
