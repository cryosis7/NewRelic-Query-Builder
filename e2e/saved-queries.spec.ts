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
    test("Delete button removes saved query", async ({ page }) => {
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

      // Click the delete icon button
      const deleteButton = page.getByRole("button", {
        name: /Remove saved query: To Delete/i,
      });
      await deleteButton.click();

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

      // Delete it
      const deleteButton = page.getByRole("button", {
        name: /Remove saved query: Temp Query/i,
      });
      await deleteButton.click();

      // Reload the page
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Should not reappear
      await expect(
        page.getByRole("button", { name: "Temp Query", exact: true }),
      ).not.toBeVisible();
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
