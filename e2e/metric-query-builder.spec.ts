import { test, expect, Page } from "@playwright/test";

test.describe("Metric Query Builder", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  // Helper to get query preview
  const getQueryPreview = (page: Page) =>
    page.getByRole("group", { name: "Generated Query" });

  // Helper to get metric type combobox by label (Metric 1, Metric 2, etc.)
  const getMetricTypeCombobox = (page: Page, metricIndex: number = 1) => {
    return page.getByRole("combobox", { name: `Metric ${metricIndex}` });
  };

  // Helper to get aggregation combobox by label
  // Note: There may be multiple "Aggregation" comboboxes, so we get all and filter by position
  const getAggregationCombobox = (page: Page, metricIndex: number = 1) => {
    const aggregationComboboxes = page.getByRole("combobox", {
      name: "Aggregation",
    });
    // Return the one for the specified metric (0-indexed)
    return aggregationComboboxes.nth(metricIndex - 1);
  };

  test.describe("Metric Items", () => {
    test("Default metric - One metric with Duration type and Average aggregation", async ({
      page,
    }) => {
      // Should have exactly one metric item
      await expect(page.getByText("Metric 1")).toBeVisible();
      await expect(page.getByText("Metric 2")).not.toBeVisible();

      // First metric type dropdown should show "Duration"
      const metricTypeDropdown = getMetricTypeCombobox(page);
      await expect(metricTypeDropdown).toContainText("Duration");

      // Aggregation dropdown should show "Average"
      const aggregationDropdown = getAggregationCombobox(page);
      await expect(aggregationDropdown).toContainText("Average");

      // Query should contain average(duration)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText("average(duration)");
    });

    test("Add second metric - Click Add metric, verify second appears", async ({
      page,
    }) => {
      // Click Add metric button
      await page.getByRole("button", { name: "Add metric" }).click();

      // Should now have Metric 2
      await expect(page.getByText("Metric 2")).toBeVisible();

      // Query should now have two average(duration) expressions
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText(
        "average(duration), average(duration)",
      );
    });

    test("Remove metric - When 2+ exist, remove one", async ({ page }) => {
      // Add second metric
      await page.getByRole("button", { name: "Add metric" }).click();
      await expect(page.getByText("Metric 2")).toBeVisible();

      // Now both Remove buttons should be enabled
      const removeButtons = page.getByRole("button", { name: "Remove" });
      await expect(removeButtons.first()).toBeEnabled();
      await expect(removeButtons.last()).toBeEnabled();

      // Remove the second metric
      await removeButtons.last().click();

      // Should only have Metric 1 now
      await expect(page.getByText("Metric 1")).toBeVisible();
      await expect(page.getByText("Metric 2")).not.toBeVisible();

      // Query should have single average(duration)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).not.toContainText(
        "average(duration), average(duration)",
      );
    });

    test("Cannot remove last - Remove button disabled when only one metric", async ({
      page,
    }) => {
      // With only one metric, Remove button should not exist (not rendered)
      const removeButton = page.getByRole("button", { name: "Remove" });
      await expect(removeButton).not.toBeVisible();
    });
  });

  test.describe("Metric Type Selection", () => {
    test("Duration is default type with Average aggregation", async ({
      page,
    }) => {
      // Default metric type dropdown should already show Duration
      const metricTypeDropdown = getMetricTypeCombobox(page);
      await expect(metricTypeDropdown).toContainText("Duration");

      // Default aggregation should be Average
      const aggregationDropdown = getAggregationCombobox(page);
      await expect(aggregationDropdown).toContainText("Average");

      // Query should contain average(duration) by default
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText("average(duration)");
    });

    test("Request URI with Count shows count(request.uri)", async ({
      page,
    }) => {
      // Select Request URI type
      await getMetricTypeCombobox(page).click();
      await page.getByRole("option", { name: "Request URI" }).click();

      // Select Count aggregation
      await getAggregationCombobox(page).click();
      await page.getByRole("option", { name: "Count" }).click();

      // Verify query shows count(request.uri)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText("count(request.uri)");
    });

    test("Response Status with Count shows count(response.status)", async ({
      page,
    }) => {
      // Click the metric type dropdown
      await getMetricTypeCombobox(page).click();

      // Select Response Status
      await page.getByRole("option", { name: "Response Status" }).click();

      // Select Count aggregation
      await getAggregationCombobox(page).click();
      await page.getByRole("option", { name: "Count" }).click();

      // Query should contain count(response.status)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText("count(response.status)");
    });

    test("Duration with Average shows average(duration)", async ({ page }) => {
      // Select Duration type
      await getMetricTypeCombobox(page).click();
      await page.getByRole("option", { name: "Duration" }).click();

      // Select Average aggregation
      await getAggregationCombobox(page).click();
      await page.getByRole("option", { name: "Average" }).click();

      // Query should show average(duration)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText("average(duration)");
    });

    test("Duration with P95 shows percentile(duration, 95)", async ({
      page,
    }) => {
      // Select Duration type
      await getMetricTypeCombobox(page).click();
      await page.getByRole("option", { name: "Duration" }).click();

      // Select 95th Percentile aggregation
      await getAggregationCombobox(page).click();
      await page.getByRole("option", { name: "95th Percentile" }).click();

      // Query should show percentile(duration, 95)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText("percentile(duration, 95)");
    });
  });

  test.describe("Aggregation Constraints", () => {
    test("Non-duration (Response Status) only has non-numerical aggregation options", async ({
      page,
    }) => {
      // First, switch to Response Status (a string field)
      await getMetricTypeCombobox(page).click();
      await page.getByRole("option", { name: "Response Status" }).click();

      // With string field, click aggregation dropdown
      await getAggregationCombobox(page).click();

      // Should have Count and Unique List options
      const countOption = page.getByRole("option", { name: "Count" });
      const uniqueListOption = page.getByRole("option", {
        name: "Unique List",
      });
      await expect(countOption).toBeVisible();
      await expect(uniqueListOption).toBeVisible();

      // Should NOT have numerical aggregation options
      const averageOption = page.getByRole("option", { name: "Average" });
      const p95Option = page.getByRole("option", { name: "95th Percentile" });
      const medianOption = page.getByRole("option", { name: "Median" });
      await expect(averageOption).not.toBeVisible();
      await expect(p95Option).not.toBeVisible();
      await expect(medianOption).not.toBeVisible();
    });

    test("Switch from Duration to string field and select Count updates query", async ({
      page,
    }) => {
      // Default is Duration with Average, verify it
      await expect(getAggregationCombobox(page)).toContainText("Average");
      await expect(getQueryPreview(page)).toContainText("average(duration)");

      // Now switch metric type to Response Status (string field)
      await getMetricTypeCombobox(page).click();
      await page.getByRole("option", { name: "Response Status" }).click();

      // Select Count aggregation (aggregation does not auto-reset)
      await getAggregationCombobox(page).click();
      await page.getByRole("option", { name: "Count" }).click();

      // Verify aggregation shows Count and query is updated
      await expect(getAggregationCombobox(page)).toContainText("Count");
      await expect(getQueryPreview(page)).toContainText(
        "count(response.status)",
      );
    });
  });
});
