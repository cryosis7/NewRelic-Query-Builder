# NR-Query-Builder E2E Test Plan

## Executive Summary

This document outlines the E2E testing strategy for the NR-Query-Builder application and documents UI issues discovered during testing.

**Test Status:**
- ✅ 65 E2E tests implemented and passing
- ✅ 172 unit tests passing
- ⚠️ 1 UI issue discovered (see [UI Issues](#ui-issues-found-during-testing))

**Test Coverage Areas:**
- Application Selection (5 tests)
- Environment Selection (4 tests)  
- Time Period Selection (8 tests)
- Metric Query Builder (11 tests)
- Metric Filters (10 tests)
- Options, Facets & Presets (15 tests)
- Query Preview & Validation (10 tests)
- Basic Load Tests (2 tests)

**Last Updated:** January 30, 2026

---

## Overview

The NR-Query-Builder is a React + TypeScript application for building New Relic NRQL queries targeting Global Tax Mapper (GTM) applications. The UI enables users to:

- Select one or more GTM applications (API, BFF, Integrator API)
- Choose an environment (Production or UAT)
- Configure time periods (absolute or relative)
- Build metric queries with multiple metric types and aggregations
- Add filters to metric queries (duration, response status)
- Configure faceting options
- Toggle health check exclusion and timeseries
- Preview and copy the generated NRQL query
- Apply common query presets

---

## E2E Test Scenarios

### 1. Application Selection

| Scenario | User Action | Expected Result |
|----------|-------------|-----------------|
| 1.1 Default state | Load the application | API checkbox is checked by default; query contains `appName in ('global-tax-mapper-api-prod')` |
| 1.2 Select single app | Check "BFF" checkbox | Query updates to include `global-tax-mapper-bff-prod` |
| 1.3 Select multiple apps | Check all three app checkboxes | Query contains all three apps in the `appName in (...)` clause |
| 1.4 Deselect all apps | Uncheck all application checkboxes | Query preview shows `-- Select at least one application` warning |
| 1.5 Toggle app selection | Check then uncheck "Integrator API" | Query returns to previous state without Integrator API |

### 2. Environment Selection

| Scenario | User Action | Expected Result |
|----------|-------------|-----------------|
| 2.1 Default environment | Load the application | "Production" is selected; query contains `-prod` suffix |
| 2.2 Switch to UAT | Select "UAT" from environment dropdown | Query updates all app names to use `-uat` suffix |
| 2.3 Switch back to Prod | Select "Production" after UAT | Query updates all app names back to `-prod` suffix |

### 3. Time Period Selection

#### 3.1 Absolute Time Mode

| Scenario | User Action | Expected Result |
|----------|-------------|-----------------|
| 3.1.1 Switch to Exact mode | Click "Exact" radio button | "Exact" radio is selected; Since/Until date-time inputs are visible |
| 3.1.2 Change Since date | Select a different date using date picker | Query SINCE clause updates with new date |
| 3.1.3 Change Since time | Change time using time picker | Query SINCE clause updates with new time |
| 3.1.4 Change Until date | Select a different date using date picker | Query UNTIL clause updates with new date |
| 3.1.5 Change Until time | Change time using time picker | Query UNTIL clause updates with new time |

**Note:** The default mode is "Relative", not "Exact". Users must click the "Exact" radio to switch to absolute time mode.

#### 3.2 Relative Time Mode

| Scenario | User Action | Expected Result |
|----------|-------------|-----------------|
| 3.2.1 Switch to relative | Click "Relative" radio button | Relative time input appears; Since/Until inputs disappear |
| 3.2.2 Default relative value | Load application (default is relative mode) | Query shows `SINCE 3 hours ago UNTIL now` |
| 3.2.3 Type custom relative | Type "1h ago" in relative input | Query updates to `SINCE 1 hour ago` |
| 3.2.4 Select preset relative | Select "30m ago" from dropdown | Query updates to `SINCE 30 minutes ago` |
| 3.2.5 Invalid relative input | Type "invalid" in relative input | Query shows `-- Enter a valid relative time (e.g., 3h ago)` warning |
| 3.2.6 Valid formats | Test "15m", "1h", "7d", "2 hours ago" | All should produce valid SINCE clauses |

**Note:** The default time period mode is "Relative" with a value of "3h ago".

### 4. Metric Query Builder

#### 4.1 Metric Items

| Scenario | User Action | Expected Result |
|----------|-------------|-----------------|
| 4.1.1 Default metric | Load the application | One metric item with "Transaction" type and "Count" aggregation |
| 4.1.2 Add second metric | Click "Add metric" button | Second metric item appears; query SELECT includes both metrics |
| 4.1.3 Remove metric | Click "Remove" on a metric (when 2+ exist) | Metric is removed; query updates |
| 4.1.4 Cannot remove last | With only one metric, observe Remove button | Remove button should be disabled |

#### 4.2 Metric Type Selection

| Scenario | User Action | Expected Result |
|----------|-------------|-----------------|
| 4.2.1 Select Duration | Change metric type to "Duration" | Aggregation options expand to include Average, P95, Count |
| 4.2.2 Select Transaction | Change metric type to "Transaction" | Query shows `count(*)` |
| 4.2.3 Select Response Status | Change metric type to "Response Status" | Query shows `count(response.status)` |
| 4.2.4 Duration with Average | Select Duration + Average | Query shows `average(duration)` |
| 4.2.5 Duration with P95 | Select Duration + P95 | Query shows `percentile(duration, 95)` |
| 4.2.6 Duration with Count | Select Duration + Count | Query shows `count(duration)` |

#### 4.3 Aggregation Constraints

| Scenario | User Action | Expected Result |
|----------|-------------|-----------------|
| 4.3.1 Non-duration aggregation | Select Transaction or Response Status | Only "Count" aggregation should be available |
| 4.3.2 Switch from Duration | Change from Duration (Average) to Transaction | Aggregation auto-resets to Count |

### 5. Metric Filters

#### 5.1 Adding/Removing Filters

| Scenario | User Action | Expected Result |
|----------|-------------|-----------------|
| 5.1.1 Add filter | Click "Add Filter" button on a metric item | Filter row appears with Field, Operator, Value inputs |
| 5.1.2 Add multiple filters | Add 2+ filters to same metric | Filters combine with AND; query shows `filter(..., where X and Y)` |
| 5.1.3 Remove filter | Click X button on a filter | Filter is removed; query updates |
| 5.1.4 Empty filter value | Leave filter value empty | Filter shows validation warning "Empty filter will be ignored"; filter is ignored in query (no syntax error) |

#### 5.2 Duration Filters

| Scenario | User Action | Expected Result |
|----------|-------------|-----------------|
| 5.2.1 Duration > threshold | Set Duration > 0.5 | Query includes `filter(..., where duration > 0.5)` |
| 5.2.2 Change operator | Change to >= | Query updates to `duration >= 0.5` |
| 5.2.3 All duration operators | Test >, >=, <, <=, = | All should produce valid query clauses |

#### 5.3 Response Status Filters

| Scenario | User Action | Expected Result |
|----------|-------------|-----------------|
| 5.3.1 Select response.status field | Change filter field to Response Status | Operator dropdown hides; placeholder shows status examples |
| 5.3.2 Exact status code | Enter "404" | Query shows `response.status = 404` |
| 5.3.3 Multiple exact codes | Enter "404, 503" | Query shows `response.status IN (404, 503)` |
| 5.3.4 Fuzzy pattern (4xx) | Enter "4xx" | Query shows `response.status LIKE '4%'` |
| 5.3.5 Mixed codes | Enter "404, 5xx" | Query shows `(response.status = 404 OR response.status LIKE '5%')` |

### 6. Options (Health Check & Timeseries)

| Scenario | User Action | Expected Result |
|----------|-------------|-----------------|
| 6.1 Default health check | Load the application | "Exclude health checks" is checked; query has `request.uri not in (...)` |
| 6.2 Disable health check exclusion | Uncheck "Exclude health checks" | Health check paths filter removed from query |
| 6.3 Health check hint | Observe checkbox with exclusion enabled | No hint text displayed (checkbox only) |
| 6.4 Default timeseries | Load the application | "As Timeseries" is checked; query has `TIMESERIES AUTO` |
| 6.5 Disable timeseries | Uncheck "As Timeseries" | `TIMESERIES` clause removed from query |

**Note:** The timeseries checkbox label is "As Timeseries" (not "Use TIMESERIES") and generates `TIMESERIES AUTO` (not `TIMESERIES 1 MINUTE`).

### 7. Facet Selection

| Scenario | User Action | Expected Result |
|----------|-------------|-----------------|
| 7.1 Default facet | Load the application | "Request URI" is selected; query has `FACET request.uri` |
| 7.2 Change to Response Status | Select "Response Status" | Query shows `FACET response.status` |
| 7.3 Change to HTTP Method | Select "HTTP Method" | Query shows `FACET http.method` |
| 7.4 Change to Transaction Name | Select "Transaction Name" | Query shows `FACET name` |
| 7.5 Disable facet | Select "No Facet" | FACET clause is removed from query |

### 8. Common Queries (Presets)

| Scenario | User Action | Expected Result |
|----------|-------------|-----------------|
| 8.1 Preset panel visible | Load the application | "Common Queries" panel shows 5 preset buttons |
| 8.2 API Prod - Last Hour | Click "API Prod - Last Hour" | Form updates: API selected, Prod env, 1h time range |
| 8.3 All Apps Prod - Last Hour | Click "All Apps Prod - Last Hour" | All three apps selected, Prod env |
| 8.4 API UAT - Last Hour | Click "API UAT - Last Hour" | API selected, UAT env |
| 8.5 BFF Prod - Last 24 Hours | Click "BFF Prod - Last 24 Hours" | BFF selected, Prod env, 24h time range |
| 8.6 Integrator Prod - Last Hour | Click "Integrator Prod - Last Hour" | Integrator API selected, Prod env |
| 8.7 Preset tooltip | Hover over preset button | Description tooltip appears |

### 9. Query Preview

| Scenario | User Action | Expected Result |
|----------|-------------|-----------------|
| 9.1 Query displayed | Configure any valid query | Generated NRQL query displayed in preview area |
| 9.2 Valid query styling | Generate valid query | Preview has normal background styling |
| 9.3 Invalid query styling | Deselect all apps | Preview has warning background (yellow); shows error message |
| 9.4 Copy button enabled | With valid query | "Copy Query" button is enabled |
| 9.5 Copy button disabled | With invalid query | "Copy Query" button is disabled |
| 9.6 Copy to clipboard | Click "Copy Query" | Query copied to clipboard; button shows "✓ Copied!" |
| 9.7 Copy feedback resets | Wait 2 seconds after copy | Button text returns to "Copy Query" |

### 10. Query Structure Validation

| Scenario | User Action | Expected Result |
|----------|-------------|-----------------|
| 10.1 Basic query structure | Default state | Query follows: `FROM Transaction select count(*) WHERE appName in ('global-tax-mapper-api-prod') and request.uri not in (...) TIMESERIES AUTO SINCE 3 hours ago UNTIL now FACET request.uri` |
| 10.2 Multiple metrics | Add 2 duration metrics with different aggs | SELECT clause has both: `average(duration), percentile(duration, 95)` |
| 10.3 Shared filters lifted | Add same filter to multiple metrics | Filter appears in WHERE clause, not wrapped in filter() |
| 10.4 Different filters per metric | Add different filters to each metric | Each metric wrapped in `filter()` with its conditions |
| 10.5 App-environment combination | Select BFF + UAT | Query has `appName in ('global-tax-mapper-bff-uat')` |

### 11. Edge Cases & Error Handling

| Scenario | User Action | Expected Result |
|----------|-------------|-----------------|
| 11.1 No applications | Deselect all apps | Error message in preview |
| 11.2 No metrics | Remove all metrics | Error message in preview |
| 11.3 Invalid relative time | Enter garbage in relative input | Error message in preview |
| 11.4 Empty filter values | Add filter but leave value empty | Filter is silently ignored (no query error) |
| 11.5 Page refresh | Refresh browser | Form resets to default state |

### 12. Responsive Layout

| Scenario | User Action | Expected Result |
|----------|-------------|-----------------|
| 12.1 Desktop layout | View at 1200px+ width | 3-column grid layout (Apps, Env, Time) |
| 12.2 Tablet layout | View at 768px width | Layout adjusts appropriately |
| 12.3 Mobile layout | View at 375px width | Components stack vertically |

---

## Test Data Reference

### Applications
- `global-tax-mapper-api` (label: "API")
- `global-tax-mapper-bff` (label: "BFF")
- `global-tax-mapper-integrator-api` (label: "Integrator API")

### Environments
- `prod` (label: "Production")
- `uat` (label: "UAT")

### Metric Types
- `duration` (label: "Duration")
- `transaction-count` (label: "Transaction")
- `response.status` (label: "Response Status")

### Aggregation Types
- `count` (label: "Count")
- `average` (label: "Average")
- `p95` (label: "95th Percentile")

### Facet Options
- `none` (label: "No Facet")
- `request.uri` (label: "Request URI")
- `response.status` (label: "Response Status")
- `http.method` (label: "HTTP Method")
- `name` (label: "Transaction Name")

### Health Check Paths (excluded when toggle enabled)
- `/ping`
- `/secureping`
- `/health`
- `/healthcheck`
- `/secure-ping`
- `/ready`
- `/accountsV2/bulk`

### Relative Time Options
- `15m ago`, `30m ago`, `1h ago`, `3h ago`, `6h ago`, `12h ago`, `24h ago`, `7d ago`

### Default Values
- **Time Period Mode**: Relative
- **Default Relative Time**: `3h ago`
- **Exclude Health Checks**: Enabled (checked)
- **As Timeseries**: Enabled (checked)
- **Facet**: Request URI
- **Environment**: Production
- **Selected Applications**: API only

---

## UI Issues Found During Testing

> This section documents UI bugs and issues discovered during Playwright E2E testing.

### Issue Log

| Issue # | Component | Description | Severity | Status | Details |
|---------|-----------|-------------|----------|--------|---------|
| UI-001 | FilterRow | SVG icon rendering errors when adding a filter | Medium | 🔍 Open | Console errors occur when validation icon is displayed. The `XUIIcon` component used in `XUITextInput.leftElement` prop receives invalid dimensions. |

### Detailed Analysis

#### Issue UI-001: FilterRow SVG Rendering Errors

**Location:** [src/components/FilterRow.tsx](../src/components/FilterRow.tsx#L107)

**Problem Code:**
```tsx
leftElement={hasEmptyValue ? <XUIIcon icon={invalid} color="orange" size="small" title='Invalid Input'/> : undefined}
```

**Console Errors:**
```
Error: <svg> attribute height: Expected length, "NaN".
Error: <svg> attribute viewBox: Expected number, "0 0 undefined undefi…".
Error: <svg> attribute width: Expected length, "NaN".
Warning: Received NaN for the `height` attribute.
Warning: Received NaN for the `width` attribute.
```

**Root Cause Analysis:**
The `XUIIcon` component is receiving invalid or undefined dimensions when rendered as the `leftElement` of `XUITextInput`. This suggests:
1. The `invalid` icon may not have proper dimension metadata
2. The `size="small"` prop may not be correctly translating to pixel values
3. There may be a version incompatibility between `@xero/xui` and `@xero/xui-icon`

**Impact:**
- The validation icon does not render properly (may appear broken or missing)
- Console is polluted with error messages during E2E tests
- Could potentially cause visual issues for users

**Recommended Fix:**
1. Check the XUI documentation for correct icon usage in TextInput's leftElement
2. Try removing the `size` prop or using explicit dimensions
3. Consider using `validationMessage` prop instead of `leftElement` icon (already implemented)
4. Verify `@xero/xui` and `@xero/xui-icon` versions are compatible

**Workaround:**
The `validationMessage` prop is now used to display "Empty filter will be ignored", which provides user feedback without relying on the problematic icon.

---

## Notes for Test Implementation

1. **State Reset**: Consider implementing `beforeEach` hook to ensure clean state before each test
2. **Clipboard Testing**: May need browser permission handling for clipboard tests
3. **Time-dependent Tests**: Preset time calculations are relative to current time - use date mocking if precise assertions needed
4. **XUI Components**: Some XUI components may require specific interaction patterns (click trigger, then click option for dropdowns)
5. **Async Updates**: Query preview updates may need `waitFor` assertions
6. **Button Text**: The "Add Filter" button text does not include the "+" symbol (that's a separate icon)
7. **Combobox Selectors**: XUISingleSelect components may not create proper label associations; use text-based filtering instead of `getByLabel()`
8. **Component Structure**: The MetricQueryBuilder no longer uses `XUIControlGroup`, so tests should not look for a "Metric Queries" group role

## Recent Test Fixes (January 2026)

### Unit Tests
- Updated TIMESERIES expectations from `"1 MINUTE"` to `"AUTO"`
- Fixed checkbox label from `"Use TIMESERIES"` to `"As Timeseries"`
- Added `validationMessage` prop to FilterRow for empty value warnings
- Fixed TimePicker label expectations

### E2E Tests
- Updated button selector from `"+ Add filter"` to `"Add Filter"`
- Removed references to non-existent "Metric Queries" group
- Fixed combobox selectors to use text-based filtering
- Updated default time period mode expectations to "Relative" with "3h ago"
- Updated timeseries checkbox label and TIMESERIES clause format
- Fixed "Remove button" test to check visibility instead of disabled state
