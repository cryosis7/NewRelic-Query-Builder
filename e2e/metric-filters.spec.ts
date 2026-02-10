import { test, expect, Page } from "@playwright/test";

test.describe("Metric Filters", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  // Helper to get query preview
  const getQueryPreview = (page: Page) =>
    page.getByRole("group", { name: "Generated Query" });

  test.describe("Adding/Removing Filters", () => {
    test('Add filter - Click "+ Add filter", verify filter row appears', async ({
      page,
    }) => {
      // Click Add filter button
      await page.getByRole("button", { name: "Add Filter" }).click();

      // Filter row should appear with Field, Operator, Value elements
      // Note: XUISingleSelectLabel renders as label elements
      await expect(page.getByText("Field")).toBeVisible();
      await expect(page.getByText("Operator")).toBeVisible();
      await expect(page.getByText("Value")).toBeVisible();

      // Should have a Remove filter button
      await expect(
        page.getByRole("button", { name: "Remove filter" }),
      ).toBeVisible();
    });

    test("Remove filter - Click X button on filter, verify removed", async ({
      page,
    }) => {
      // First add a filter
      await page.getByRole("button", { name: "Add Filter" }).click();

      // Verify filter exists by checking for Field label
      await expect(page.getByText("Field")).toBeVisible();

      // Click remove filter button
      await page.getByRole("button", { name: "Remove filter" }).click();

      // Filter section should be gone - Field label should not be visible
      await expect(page.getByText("Field")).not.toBeVisible();
    });

    test("Empty filter value - Filter ignored, no query error", async ({
      page,
    }) => {
      // Add a filter but leave value empty
      await page.getByRole("button", { name: "Add Filter" }).click();

      // Wait for the Value input to be visible
      const valueInput = page.getByRole("textbox", { name: "Value" });
      await expect(valueInput).toBeVisible();

      // Verify the value input is empty
      await expect(valueInput).toHaveValue("");

      // Query should still be valid (no filter clause added for empty filter)
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).not.toContainText("duration >");
      // Should not have error
      await expect(queryPreview).not.toContainText("error");
    });
  });

  test.describe("Duration Filters", () => {
    test("Duration > threshold - Set Duration > 0.5, verify query", async ({
      page,
    }) => {
      // Add filter
      await page.getByRole("button", { name: "Add Filter" }).click();

      // Default field should be Duration (third combobox after metric type and aggregation)
      // Just verify the query works by typing a value
      await page.getByRole("textbox", { name: "Value" }).fill("0.5");

      // Query should contain the filter
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText("duration > 0.5");
    });

    test("Change operator - Change to >=, verify query updates", async ({
      page,
    }) => {
      // Add filter with value
      await page.getByRole("button", { name: "Add Filter" }).click();
      await page.getByRole("textbox", { name: "Value" }).fill("0.5");

      // Verify initial operator is >
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText("duration > 0.5");

      // Click operator dropdown and change to >=
      // Find operator dropdown - it's the combobox that contains ">" text
      const operatorDropdown = page
        .getByRole("combobox")
        .filter({ hasText: ">" })
        .first();
      await operatorDropdown.click();

      // Select >= option
      await page.getByRole("option", { name: ">=" }).click();

      // Query should update
      await expect(queryPreview).toContainText("duration >= 0.5");
    });

    test("All duration operators work", async ({ page }) => {
      // Add filter with value
      await page.getByRole("button", { name: "Add Filter" }).click();
      await page.getByRole("textbox", { name: "Value" }).fill("1");

      const queryPreview = getQueryPreview(page);
      // Find operator dropdown - it's a combobox that contains operator symbols
      // After filling value, the operator dropdown should be visible and contain ">"
      const operatorDropdown = page
        .getByRole("combobox")
        .filter({ hasText: /^[<>=]+$/ })
        .first();

      // Test < operator (use exact: true to avoid matching <=)
      await operatorDropdown.click();
      await page.getByRole("option", { name: "<", exact: true }).click();
      await expect(queryPreview).toContainText("duration < 1");

      // Test <= operator
      await operatorDropdown.click();
      await page.getByRole("option", { name: "<=" }).click();
      await expect(queryPreview).toContainText("duration <= 1");

      // Test = operator (use exact: true)
      await operatorDropdown.click();
      await page.getByRole("option", { name: "=", exact: true }).click();
      await expect(queryPreview).toContainText("duration = 1");
    });
  });

  test.describe("Response Status Filters", () => {
    test("Select response.status field - Change filter field", async ({
      page,
    }) => {
      // Add filter
      await page.getByRole("button", { name: "Add Filter" }).click();

      // Click field dropdown using its accessible label and select Response Status
      const fieldDropdown = page.getByRole("combobox", { name: "Field" });
      await fieldDropdown.click();
      await page.getByRole("option", { name: "Response Status" }).click();

      // Verify field changed by entering a status code and checking the WHERE clause
      await page.getByRole("textbox", { name: "Value" }).fill("200");

      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText("response.status = 200");
    });

    test('Exact status code - Enter "404", verify query', async ({ page }) => {
      // Add filter and select Response Status
      await page.getByRole("button", { name: "Add Filter" }).click();
      // Click field dropdown using its accessible label
      const fieldDropdown = page.getByRole("combobox", { name: "Field" });
      await fieldDropdown.click();
      await page.getByRole("option", { name: "Response Status" }).click();

      // Enter exact code
      await page.getByRole("textbox", { name: "Value" }).fill("404");

      // Query should contain response.status = 404
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText("response.status = 404");
    });

    test('Pattern (4xx) - Enter "4xx", verify query uses LIKE', async ({
      page,
    }) => {
      // Add filter and select Response Status
      await page.getByRole("button", { name: "Add Filter" }).click();
      // Click field dropdown using its accessible label
      const fieldDropdown = page.getByRole("combobox", { name: "Field" });
      await fieldDropdown.click();
      await page.getByRole("option", { name: "Response Status" }).click();

      // Enter pattern
      await page.getByRole("textbox", { name: "Value" }).fill("4xx");

      // Query should contain LIKE pattern
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText(/response\.status LIKE/i);
    });
  });

  test.describe("Multiple Filters", () => {
    test("Add multiple filters - Combine with AND logic", async ({ page }) => {
      // Add first filter
      await page.getByRole("button", { name: "Add Filter" }).click();
      await page.getByRole("textbox", { name: "Value" }).fill("0.5");

      // Add second filter
      await page.getByRole("button", { name: "Add Filter" }).click();

      // Fill second filter (there are now two Value inputs)
      const valueInputs = page.getByRole("textbox", { name: "Value" });
      await valueInputs.last().fill("1.0");

      // Both filters should be in query
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText("duration > 0.5");
      await expect(queryPreview).toContainText("duration > 1");
    });
  });
});
