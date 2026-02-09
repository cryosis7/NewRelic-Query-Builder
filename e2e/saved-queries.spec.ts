import { test, expect, Page } from "@playwright/test";

test.describe("Saved Queries", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and clear saved queries from localStorage, then reload so atoms initialize clean
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("saved-queries"));
    await page.reload();
    await page.waitForLoadState("networkidle");
  });

  // Helper to get query preview
  const getQueryPreview = (page: Page) =>
    page.getByRole("group", { name: "Generated Query" });

  test.describe("Save Flow", () => {
    test("Save button is visible and enabled with valid query", async ({
      page,
    }) => {
      const saveButton = page.getByRole("button", { name: /Save Query/i });
      await expect(saveButton).toBeVisible();
      await expect(saveButton).toBeEnabled();
    });

    test("Save button is disabled when query is invalid", async ({ page }) => {
      // Uncheck the only selected app to make query invalid
      await page.getByRole("checkbox", { name: "API", exact: true }).uncheck();

      const saveButton = page.getByRole("button", { name: /Save Query/i });
      await expect(saveButton).toBeDisabled();
    });

    test("Save button opens modal with name input", async ({ page }) => {
      await page.getByRole("button", { name: /Save Query/i }).click();

      // Modal should appear with a text input and buttons
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText("Save Query")).toBeVisible();
      await expect(dialog.getByLabel("Query Name")).toBeVisible();
      await expect(dialog.getByRole("button", { name: "Save" })).toBeVisible();
      await expect(
        dialog.getByRole("button", { name: "Cancel" }),
      ).toBeVisible();
    });

    test("Cancel closes modal without saving", async ({ page }) => {
      await page.getByRole("button", { name: /Save Query/i }).click();

      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("Query Name").fill("Cancelled Query");
      await dialog.getByRole("button", { name: "Cancel" }).click();

      // Modal should be gone
      await expect(dialog).not.toBeVisible();

      // No saved query should appear
      await expect(
        page.getByRole("button", { name: "Cancelled Query", exact: true }),
      ).not.toBeVisible();
    });

    test("Save with name adds query to Common Queries section", async ({
      page,
    }) => {
      await page.getByRole("button", { name: /Save Query/i }).click();

      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("Query Name").fill("My Test Query");
      await dialog.getByRole("button", { name: "Save" }).click();

      // Modal should close
      await expect(dialog).not.toBeVisible();

      // Saved query button should appear in Common Queries section
      const savedButton = page.getByRole("button", {
        name: "My Test Query",
        exact: true,
      });
      await expect(savedButton).toBeVisible();
    });

    test("Save with empty name is prevented", async ({ page }) => {
      await page.getByRole("button", { name: /Save Query/i }).click();

      const dialog = page.getByRole("dialog");
      // Leave name empty
      const saveButton = dialog.getByRole("button", { name: "Save" });
      await expect(saveButton).toBeDisabled();
    });
  });

  test.describe("Load Flow", () => {
    test("Clicking a saved query restores its state", async ({ page }) => {
      // Save the default query
      await page.getByRole("button", { name: /Save Query/i }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("Query Name").fill("Default Query");
      await dialog.getByRole("button", { name: "Save" }).click();

      // Change the environment to UAT
      await page.getByRole("combobox", { name: "Environment" }).click();
      await page.getByRole("option", { name: "UAT" }).click();

      // Query should now contain UAT
      const queryPreview = getQueryPreview(page);
      await expect(queryPreview).toContainText("uat");

      // Click the saved query to restore
      await page
        .getByRole("button", { name: "Default Query", exact: true })
        .click();

      // Environment should be restored to Production
      const envDropdown = page.getByRole("combobox", { name: "Environment" });
      await expect(envDropdown).toContainText("Production");

      // Query should match the original
      await expect(queryPreview).toContainText("prod");
    });
  });

  test.describe("Delete Flow", () => {
    test("Edit mode allows removing a saved query", async ({ page }) => {
      // Save a query first
      await page.getByRole("button", { name: /Save Query/i }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("Query Name").fill("To Delete");
      await dialog.getByRole("button", { name: "Save" }).click();

      // Saved query should be visible
      const savedButton = page.getByRole("button", {
        name: "To Delete",
        exact: true,
      });
      await expect(savedButton).toBeVisible();

      // Enter edit mode
      await page.getByRole("button", { name: "Edit" }).click();

      // Click the negative chip to remove
      const removeButton = page.getByRole("button", {
        name: /Remove saved query: To Delete/i,
      });
      await removeButton.click();

      // Saved query should be gone
      await expect(
        page.getByRole("button", { name: "To Delete", exact: true }),
      ).not.toBeVisible();
    });
  });

  test.describe("Persistence Flow", () => {
    test("Saved queries persist across page reloads", async ({ page }) => {
      // Save a query
      await page.getByRole("button", { name: /Save Query/i }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("Query Name").fill("Persistent Query");
      await dialog.getByRole("button", { name: "Save" }).click();

      // Reload the page
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Saved query should still be visible
      const savedButton = page.getByRole("button", {
        name: "Persistent Query",
        exact: true,
      });
      await expect(savedButton).toBeVisible();
    });

    test("Deleted queries stay removed after reload", async ({ page }) => {
      // Save a query
      await page.getByRole("button", { name: /Save Query/i }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("Query Name").fill("Temp Query");
      await dialog.getByRole("button", { name: "Save" }).click();

      // Enter edit mode and delete it
      await page.getByRole("button", { name: "Edit" }).click();
      const removeButton = page.getByRole("button", {
        name: /Remove saved query: Temp Query/i,
      });
      await removeButton.click();

      // Reload the page
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Should not reappear
      await expect(
        page.getByRole("button", { name: "Temp Query", exact: true }),
      ).not.toBeVisible();
    });
  });

  test.describe("Edit Mode", () => {
    test("Edit button appears when saved queries exist", async ({ page }) => {
      // No edit button when no saved queries
      await expect(
        page.getByRole("button", { name: "Edit", exact: true }),
      ).not.toBeVisible();

      // Save a query
      await page.getByRole("button", { name: /Save Query/i }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("Query Name").fill("Visibility Test");
      await dialog.getByRole("button", { name: "Save" }).click();

      // Edit button should now be visible
      await expect(
        page.getByRole("button", { name: "Edit", exact: true }),
      ).toBeVisible();
    });

    test("Edit mode toggles to Done", async ({ page }) => {
      // Save a query
      await page.getByRole("button", { name: /Save Query/i }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("Query Name").fill("Toggle Test");
      await dialog.getByRole("button", { name: "Save" }).click();

      // Click Edit
      await page.getByRole("button", { name: "Edit", exact: true }).click();

      // Should show Done button
      await expect(
        page.getByRole("button", { name: "Done", exact: true }),
      ).toBeVisible();

      // Click Done to exit edit mode
      await page.getByRole("button", { name: "Done", exact: true }).click();

      // Should show Edit button again
      await expect(
        page.getByRole("button", { name: "Edit", exact: true }),
      ).toBeVisible();
    });
  });

  test.describe("Staleness", () => {
    test("Shows warning on stale saved query", async ({ page }) => {
      // Inject a saved query with an invalid field into localStorage
      const staleQuery = {
        id: "stale-1",
        name: "Stale Query",
        nrqlQuery: "SELECT count(removed.field) FROM Transaction",
        state: {
          applications: ["global-tax-mapper-api"],
          environment: "prod",
          metricItems: [
            {
              id: "m-1",
              field: "removed.field",
              aggregationType: "count",
              filters: [],
            },
          ],
          timePeriod: { mode: "relative", relative: "3h ago" },
          excludeHealthChecks: true,
          excludeBulkEndpoint: true,
          useTimeseries: true,
          facet: "none",
        },
        createdAt: "2026-01-01T00:00:00Z",
      };
      await page.evaluate((q) => {
        localStorage.setItem("saved-queries", JSON.stringify([q]));
      }, staleQuery);
      await page.reload();
      await page.waitForLoadState("networkidle");

      const savedButton = page.getByRole("button", {
        name: "Stale Query",
        exact: true,
      });
      await expect(savedButton).toBeVisible();

      // Check tooltip contains warning about stale/unavailable fields
      await expect(savedButton).toHaveAttribute(
        "title",
        /no longer available/i,
      );
    });
  });

  test.describe("Multiple Saves", () => {
    test("Multiple queries can be saved", async ({ page }) => {
      // Save first query
      await page.getByRole("button", { name: /Save Query/i }).click();
      let dialog = page.getByRole("dialog");
      await dialog.getByLabel("Query Name").fill("Query One");
      await dialog.getByRole("button", { name: "Save" }).click();

      // Change environment and save second query
      await page.getByRole("combobox", { name: "Environment" }).click();
      await page.getByRole("option", { name: "UAT" }).click();

      await page.getByRole("button", { name: /Save Query/i }).click();
      dialog = page.getByRole("dialog");
      await dialog.getByLabel("Query Name").fill("Query Two");
      await dialog.getByRole("button", { name: "Save" }).click();

      // Both should be visible
      await expect(
        page.getByRole("button", { name: "Query One", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Query Two", exact: true }),
      ).toBeVisible();
    });
  });
});
