import { expect, type Page } from "@playwright/test";

export const PERSONAS = {
  hq: "Ananya Sharma",
  plant: "Suresh Iyer",
  ro: "Rakesh Mehta",
  dealer: "Rajesh Bansal",
  lsp: "Vikram Singh",
} as const;

export type PersonaRole = keyof typeof PERSONAS;

/**
 * Picks a persona card and waits for the credentials to autofill. The retry is
 * also how we wait out hydration — the login page is server-rendered, so a click
 * that lands before React attaches does nothing at all.
 */
export async function pickPersona(page: Page, role: PersonaRole) {
  await expect(async () => {
    await page.getByRole("button", { name: new RegExp(PERSONAS[role]) }).click();
    await expect(page.getByLabel("Username")).toHaveValue(role, { timeout: 1000 });
  }).toPass({ timeout: 20_000 });
}

/** Signs in through the real login form — the same path a presenter takes. */
export async function loginAs(page: Page, role: PersonaRole) {
  await page.goto("/login");
  await pickPersona(page, role);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(new RegExp(`/${role}$`));
  await expect(page.getByRole("banner")).toContainText(PERSONAS[role]);
}

/** Switches persona without a reload, so client state survives the hop. */
export async function switchTo(page: Page, role: PersonaRole) {
  await page.getByRole("button", { name: "Switch persona" }).click();
  await page.waitForURL(/\/login/);
  await pickPersona(page, role);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(new RegExp(`/${role}$`));
}
