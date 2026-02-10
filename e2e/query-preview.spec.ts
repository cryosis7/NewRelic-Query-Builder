import { test, expect, Page } from "@playwright/test";

test.describe("Query Preview", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  // Helper to get query preview
  const getQueryPreview = (page: Page) =>
    page.getByRole("group", { name: "Generated Query" });

  test.describe("Query Display", () => {
    test("Query displayed - Generated NRQL visible in preview", async ({
      page,
    }) => {
      const queryPreview = getQueryPreview(page);

      // Query should contain expected structure
      await expect(queryPreview).toContainText("FROM Transaction");
      await expect(queryPreview).toContainText("SELECT");
      await expect(queryPreview).toContainText("WHERE");
      await expect(queryPreview).toContainText("appName IN");
    });

    test("Valid query has correct structure", async ({ page }) => {
      const queryPreview = getQueryPreview(page);

      // Should have all main clauses in correct order
      const queryText = await queryPreview.textContent();

      // Verify order: FROM -> SELECT -> WHERE -> TIMESERIES -> SINCE -> UNTIL -> FACET
      // Use [\s\S]* to match across newlines
      expect(queryText).toMatch(
        /FROM[\s\S]*SELECT[\s\S]*WHERE[\s\S]*TIMESERIES[\s\S]*SINCE[\s\S]*UNTIL[\s\S]*FACET/,
      );
    });

    test("Copy button enabled with valid query", async ({ page }) => {
      const copyButton = page.getByRole("button", { name: /Copy/i });
      await expect(copyButton).toBeEnabled();
    });

    test("Copy button disabled with invalid query (no apps)", async ({
      page,
    }) => {
      // Uncheck the only selected app
      await page.getByRole("checkbox", { name: "API", exact: true }).uncheck();

      // Copy button should be disabled
      const copyButton = page.getByRole("button", { name: /Copy/i });
      await expect(copyButton).toBeDisabled();

      // Query preview should show error message
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText(
        "Select at least one application",
      );
    });
  });

  test.describe("Query Structure Validation", () => {
    test("Basic query structure - Default state produces valid NRQL", async ({
      page,
    }) => {
      const queryPreview = getQueryPreview(page);
      const queryText = await queryPreview.textContent();

      // Should have proper structure
      expect(queryText).toContain("FROM Transaction");
      expect(queryText).toContain("average(duration)");
      expect(queryText).toContain("appName IN ('global-tax-mapper-api-prod')");
      expect(queryText).toContain("TIMESERIES AUTO");
      expect(queryText).toContain("FACET request.uri");
    });
  });
});
