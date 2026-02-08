import type {QueryState, TimePeriod} from '../types/query';

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
        id: 'api-throughput-3h',
        name: 'API Throughput - Last 3 Hours',
        description: 'Total count and counts by response status (2xx, 4xx, 5xx) for the last 3 hours',
        state: {
            applications: ['global-tax-mapper-api'],
            environment: 'prod',
            metricItems: [
                {
                    id: 'preset-api-throughput-total',
                    field: 'response.status',
                    aggregationType: 'count',
                    filters: [],
                },
                {
                    id: 'preset-api-throughput-2xx',
                    field: 'response.status',
                    aggregationType: 'count',
                    filters: [
                        {
                            id: 'filter-2xx',
                            field: 'response.status',
                            operator: '=',
                            value: '2xx',
                            negated: false,
                        }
                    ],
                },
                {
                    id: 'preset-api-throughput-4xx',
                    field: 'response.status',
                    aggregationType: 'count',
                    filters: [
                        {
                            id: 'filter-4xx',
                            field: 'response.status',
                            operator: '=',
                            value: '4xx',
                            negated: false,
                        },
                    ],
                },
                {
                    id: 'preset-api-throughput-5xx',
                    field: 'response.status',
                    aggregationType: 'count',
                    filters: [
                        {
                            id: 'filter-5xx',
                            field: 'response.status',
                            operator: '=',
                            value: '5xx',
                            negated: false,
                        },
                    ],
                },
            ],
            timePeriod: getLastNHours(3),
            excludeHealthChecks: true,
            excludeBulkEndpoint: false,
            useTimeseries: true,
            facet: 'none',
        },
    },
    {
        id: 'api-latency-3h',
        name: 'API Latency - Last 3 Hours',
        description: 'Average duration for all applications over the last 3 hours',
        state: {
            applications: ['global-tax-mapper-api'],
            environment: 'prod',
            metricItems: [
                {
                    id: 'preset-api-latency-3h',
                    field: 'duration',
                    aggregationType: 'average',
                    filters: [],
                },
            ],
            timePeriod: getLastNHours(3),
            excludeHealthChecks: true,
            excludeBulkEndpoint: true,
            useTimeseries: true,
            facet: 'none',
        },
    },
    {
        id: 'api-error-count',
        name: 'API Error Count',
        description: 'Gets the total count of errors in the API for a period',
        state: {
            applications: ['global-tax-mapper-api'],
            environment: 'prod',
            metricItems: [
                {
                    id: 'preset-api-400-error',
                    field: 'response.status',
                    aggregationType: 'count',
                    filters: [
                        {
                            id: 'filter-4xx',
                            field: 'response.status',
                            operator: '=',
                            value: '4xx',
                            negated: false,
                        },
                    ],
                },
                {
                    id: 'preset-api-500-error',
                    field: 'response.status',
                    aggregationType: 'count',
                    filters: [
                        {
                            id: 'filter-5xx',
                            field: 'response.status',
                            operator: '=',
                            value: '5xx',
                            negated: false,
                        },
                    ],
                },
            ],
            timePeriod: getLastNHours(3),
            excludeHealthChecks: true,
            excludeBulkEndpoint: false,
            facet: 'request.uri',
            useTimeseries: false
        },
    },
];
