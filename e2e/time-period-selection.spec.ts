import { test, expect, Page } from "@playwright/test";

test.describe("Time Period Selection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  // Helper to get query preview
  const getQueryPreview = (page: Page) =>
    page.getByRole("group", { name: "Generated Query" });

  test.describe("Absolute/Exact Time Mode", () => {
    test("Default mode - Exact radio is selected with Since/Until inputs visible", async ({
      page,
    }) => {
      // Switch to Exact mode first (default is Relative)
      await page.getByText("Exact").click();
      const exactRadio = page.getByRole("radio", { name: "Exact" });

      // Exact radio should now be checked
      await expect(exactRadio).toBeChecked();

      // Relative radio should not be checked
      const relativeRadio = page.getByRole("radio", { name: "Relative" });
      await expect(relativeRadio).not.toBeChecked();

      // Since and Until date/time inputs should be visible
      // There are two Date inputs (Since and Until) - use first() and last()
      const dateInputs = page.getByRole("textbox", { name: "Date" });
      await expect(dateInputs.first()).toBeVisible();
      await expect(dateInputs.last()).toBeVisible();

      const timeInputs = page.getByRole("textbox", { name: "Time" });
      await expect(timeInputs.first()).toBeVisible();
      await expect(timeInputs.last()).toBeVisible();

      // Query should contain SINCE and UNTIL with formatted dates
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText(/SINCE '\d{4}-\d{2}-\d{2}/);
      await expect(queryPreview).toContainText(/UNTIL '\d{4}-\d{2}-\d{2}/);
    });

    test("Time inputs update the query", async ({ page }) => {
      // Switch to Exact mode first (default is Relative)
      await page.getByText("Exact").click();

      // Get the Since time input and clear it, then type a new time
      const sinceTimeInput = page
        .getByRole("textbox", { name: "Time" })
        .first();

      // Clear and type new time
      await sinceTimeInput.fill("10:30");

      // Query should contain the new time
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText("10:30:00");
    });
  });

  test.describe("Relative Time Mode", () => {
    test("Switch to relative - Relative input appears, Since/Until disappear", async ({
      page,
    }) => {
      // Default is already Relative, but verify by ensuring we're in relative mode
      const relativeRadio = page.getByRole("radio", { name: "Relative" });

      // Relative radio should now be checked
      await expect(relativeRadio).toBeChecked();

      // Exact radio should not be checked
      const exactRadio = page.getByRole("radio", { name: "Exact" });
      await expect(exactRadio).not.toBeChecked();

      // Relative text input should be visible
      const relativeInput = page.getByRole("textbox", { name: "Relative" });
      await expect(relativeInput).toBeVisible();

      // Since/Until Date inputs should NOT be visible (they're conditionally rendered only in absolute mode)
      const dateInputs = page.getByRole("textbox", { name: "Date" });
      await expect(dateInputs).toHaveCount(0);
    });

    test('Default relative value - Shows "3 hours ago" type query', async ({
      page,
    }) => {
      // Default mode is already Relative, so no need to switch
      // Default value should be "3h ago"
      const relativeInput = page.getByRole("textbox", { name: "Relative" });
      await expect(relativeInput).toHaveValue("3h ago");

      // Query should show SINCE ... ago UNTIL now
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText(/SINCE.*ago/i);
      await expect(queryPreview).toContainText(/UNTIL.*now/i);
    });

    test('Valid formats - "15m", "1h", "7d" produce valid queries', async ({
      page,
    }) => {
      // Default is already Relative mode
      const relativeInput = page.getByRole("textbox", { name: "Relative" });
      const queryPreview = getQueryPreview(page);

      // Test 15m
      await relativeInput.fill("15m ago");
      await expect(queryPreview).toContainText(/SINCE 15 minutes ago/i);

      // Test 1h
      await relativeInput.fill("1h ago");
      await expect(queryPreview).toContainText(/SINCE 1 hours? ago/i);

      // Test 7d
      await relativeInput.fill("7d ago");
      await expect(queryPreview).toContainText(/SINCE 7 days ago/i);
    });

    test("Select preset from dropdown", async ({ page }) => {
      // Default is already Relative mode

      // Click the dropdown to open options
      const dropdown = page.getByRole("combobox", { name: "Time Period" });
      await dropdown.click();

      // Select 30m ago option
      await page.getByRole("option", { name: "30m ago" }).click();

      // Verify the input updated
      const relativeInput = page.getByRole("textbox", { name: "Relative" });
      await expect(relativeInput).toHaveValue("30m ago");

      // Query should reflect the change
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText(/SINCE 30 minutes ago/i);
    });

    test("Invalid relative input - Shows error message", async ({ page }) => {
      // Default is already Relative mode
      const relativeInput = page.getByRole("textbox", { name: "Relative" });

      // Type invalid value
      await relativeInput.fill("invalid");

      // Query should show error message
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText(/Enter a valid relative time/i);
    });

    test("Switch back to Exact mode", async ({ page }) => {
      // Default is already Relative mode, switch to Exact
      await page.getByText("Exact").click();

      // Exact should be checked
      const exactRadio = page.getByRole("radio", { name: "Exact" });
      await expect(exactRadio).toBeChecked();

      // Since/Until should be visible again
      const dateInputs = page.getByRole("textbox", { name: "Date" });
      await expect(dateInputs.first()).toBeVisible();

      // Query should have formatted datetime
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText(/SINCE '\d{4}-\d{2}-\d{2}/);
    });
  });
});
