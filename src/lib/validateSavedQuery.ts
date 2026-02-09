import type { QueryState } from "../types/query";
import {
  APPLICATIONS,
  ENVIRONMENTS,
  NRQL_FIELDS,
  AGGREGATION_TYPES,
  FACET_OPTIONS,
} from "../types/query";
import { buildNrqlQuery } from "./buildNrqlQuery";

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
}

export function validateSavedQuery(
  state: QueryState,
  savedNrqlQuery?: string,
): ValidationResult {
  const warnings: string[] = [];

  // Check applications
  for (const app of state.applications) {
    if (!APPLICATIONS.some((a) => a.value === app)) {
      warnings.push(`Application '${app}' is no longer available`);
    }
  }

  // Check environment
  if (!ENVIRONMENTS.some((e) => e.value === state.environment)) {
    warnings.push(`Environment '${state.environment}' is no longer available`);
  }

  // Check metric items
  for (const item of state.metricItems) {
    // Check field
    if (!NRQL_FIELDS.some((f) => f.name === item.field)) {
      warnings.push(`Field '${item.field}' is no longer available`);
    }

    // Check aggregation type
    if (!AGGREGATION_TYPES.some((a) => a.value === item.aggregationType)) {
      warnings.push(
        `Aggregation type '${item.aggregationType}' is no longer available`,
      );
    }

    // Check filters
    for (const filter of item.filters) {
      if (!NRQL_FIELDS.some((f) => f.name === filter.field)) {
        warnings.push(`Filter field '${filter.field}' is no longer available`);
      }
    }
  }

  // Check facet
  if (
    state.facet !== "none" &&
    !FACET_OPTIONS.some((f) => f.value === state.facet)
  ) {
    warnings.push(`Facet '${state.facet}' is no longer available`);
  }

  // Check time period mode
  if (
    state.timePeriod.mode !== "relative" &&
    state.timePeriod.mode !== "absolute"
  ) {
    warnings.push(
      `Time period mode '${state.timePeriod.mode}' is not recognized`,
    );
  }

  // Check if regenerated NRQL differs from saved (indicates builder logic changed)
  if (savedNrqlQuery) {
    try {
      const regenerated = buildNrqlQuery(state);
      if (regenerated !== savedNrqlQuery) {
        warnings.push("Query output has changed since this query was saved");
      }
    } catch {
      warnings.push("Unable to regenerate query from saved state");
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}
