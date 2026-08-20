import { expect, test, type ConsoleMessage } from "@playwright/test";
import { loginAs, pickPersona, switchTo, type PersonaRole } from "./helpers";

/** Any console error anywhere in the demo is a defect — the panel will see it. */
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  // Surfaced by each test through the fixture below.
  (page as unknown as { __errors: string[] }).__errors = errors;
});

test.afterEach(async ({ page }, testInfo) => {
  const errors = (page as unknown as { __errors: string[] }).__errors ?? [];
  // Dev-server noise (HMR socket, map tiles, favicon) is not the app's doing.
  const real = errors.filter(
    (e) =>
      !e.includes("favicon") &&
      !e.includes("tile.openstreetmap") &&
      !e.includes("_next/hmr") &&
      !e.includes("WebSocket")
  );
  if (testInfo.status === "passed") expect(real, real.join("\n")).toHaveLength(0);
});

test("login page presents the five personas and signs in", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /One record/ })).toBeVisible();
  for (const name of ["Ananya Sharma", "Suresh Iyer", "Rakesh Mehta", "Rajesh Bansal", "Vikram Singh"]) {
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  }
  await expect(page.getByText("Meera Nair")).toHaveCount(0); // finance persona is gone

  await pickPersona(page, "dealer");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/dealer$/);
});

test("role scoping blocks URL hopping", async ({ page }) => {
  await loginAs(page, "dealer");
  await page.goto("/hq");
  await page.waitForURL(/\/dealer$/);
  await page.goto("/vehicle/MALBB51RLSM104014"); // a Metro Hyundai car
  await expect(page.getByText(/isn't visible from your role/)).toBeVisible();
});

test("dealer overview answers the persona question", async ({ page }) => {
  await loginAs(page, "dealer");
  await expect(page.getByText(/Good (morning|afternoon|evening), Rajesh/)).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/cars are held on paperwork/);
  await expect(page.getByText("Cars on Order")).toBeVisible();
  await expect(page.getByRole("heading", { name: "At risk" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Document alerts" })).toBeVisible();
});

test("the goods flow runs end to end: verify → papers → gate pass", async ({ page }) => {
  await loginAs(page, "plant");
  await page.goto("/vehicle/MALBB51RLSM104006");
  await expect(page.getByText("Allocation Matched").first()).toBeVisible();

  await page.getByRole("button", { name: "Verify Documents" }).click();
  await expect(page.getByRole("button", { name: "Raise Dispatch Papers" })).toBeEnabled();

  await page.getByRole("button", { name: "Raise Dispatch Papers" }).click();
  await expect(page.getByRole("heading", { name: "Dispatch papers", exact: true })).toBeVisible();
  await expect(page.getByText("EWB-4006-8841").first()).toBeVisible();

  await page.getByRole("button", { name: "Issue Gate Pass" }).click();
  await expect(page.getByText("Gate-out").first()).toBeVisible();
});

test("the document flow catches the hero mismatch", async ({ page }) => {
  await loginAs(page, "dealer");
  await page.goto("/vehicle/MALBB51RLSM104921");
  await expect(page.getByText("STUCK").first()).toBeVisible();
  await expect(page.getByText(/raised against chassis 4912/).first()).toBeVisible();
  await expect(page.getByText("Chassis on the e-way bill matches the invoice")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Invoice vs Dispatch Papers" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Documents on the shared record" })).toBeVisible();
  await expect(page.getByText("Service levels on this car")).toBeVisible();
});

test("ERP: dealer books an order and the manufacturer promises it", async ({ page }) => {
  await loginAs(page, "dealer");
  await page.getByRole("link", { name: "My Orders" }).click();
  await page.waitForURL(/\/dealer\/orders$/);
  await page.getByLabel("What is it for?").fill("Playwright smoke booking");
  await page.getByRole("button", { name: "Send to manufacturer" }).click();
  await expect(page.getByText("is with the sales desk.")).toBeVisible();
  await expect(page.getByText("Playwright smoke booking")).toBeVisible();

  await switchTo(page, "hq");
  await page.getByRole("link", { name: "Order Book" }).click();
  await page.waitForURL(/\/hq\/orders$/);
  await expect(page.getByText("Line availability today")).toBeVisible();
  const order = page.locator("li", { hasText: "Playwright smoke booking" }).first();
  await expect(order).toContainText("Awaiting verification");
  await order.getByRole("button", { name: "Verify & confirm slot" }).click();
  await expect(order).toContainText("Verified");
  await order.getByRole("button", { name: /Raise invoice/ }).click();
  await expect(order).toContainText("Invoiced");
  await expect(order.locator("a", { hasText: "•••" }).first()).toBeVisible();
});

test("ERP: an unpromisable line is refused with a reason", async ({ page }) => {
  await loginAs(page, "hq");
  await page.goto("/hq/orders");
  const rejected = page.locator("li", { hasText: "ORD-MHL-2026-0301" }).first();
  await expect(rejected).toContainText("Rejected");
  await expect(rejected).toContainText("not on the Chandigarh RO allocation plan");
});

test("compliance and SLA report render for the manufacturer", async ({ page }) => {
  await loginAs(page, "hq");
  await page.goto("/hq/compliance");
  await expect(page.getByRole("heading", { name: "Open document alerts" })).toBeVisible();
  await expect(page.getByText("Document compliance report")).toBeVisible();
  await expect(page.getByText("Rules that fired")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Service levels" })).toBeVisible();
  await expect(page.getByText("SLA attainment")).toBeVisible();

  // Read the scoreboard back out so the run reports real numbers.
  const rate = await page.getByText("Compliance rate").locator("xpath=..").innerText();
  const attainment = await page.getByText("SLA attainment").locator("xpath=..").innerText();
  console.log(`[smoke] ${rate.replace(/\n/g, " ")} | ${attainment.replace(/\n/g, " ")}`);
});

test("tracking draws the OpenStreetMap route for the transporter", async ({ page }) => {
  await loginAs(page, "lsp");
  await page.goto("/lsp/tracking");
  await expect(page.getByText("PB-11-AT-5590").first()).toBeVisible();
  await expect(page.getByText("PB-65-BT-3381").first()).toBeVisible();
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(page.locator(".leaflet-tile").first()).toBeVisible();
  await expect(page.getByText(/OpenStreetMap/).first()).toBeVisible();
  await expect(page.getByText("Hub — Nagpur").first()).toBeVisible();

  // The delayed trip is selectable and reads as late.
  await page.getByText("PB-65-BT-3381").first().click();
  await expect(page.getByText("+2d").first()).toBeVisible();
});

test("tracking is scoped: the dealer sees only its own trip", async ({ page }) => {
  await loginAs(page, "dealer");
  await page.goto("/dealer/tracking");
  await expect(page.getByText("PB-11-AT-5590").first()).toBeVisible();
  await expect(page.getByText("PB-65-BT-3381")).toHaveCount(0);
});

test("the assistant answers in the persona's own scope", async ({ page }) => {
  await loginAs(page, "dealer");
  await page.getByRole("button", { name: "Ask DhanFlow" }).click();
  await expect(page.getByRole("dialog")).toContainText("answering as: Dealer view");

  await page.getByRole("button", { name: /How many of my cars are at risk/ }).click();
  await expect(page.getByText(/Chassis 4921 is held on dispatch papers/)).toBeVisible();

  await page.getByLabel("Ask a question").fill("what is the weather in chennai");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText(/In this demo I answer the suggested questions/)).toBeVisible();
});

test("state propagates across personas without a reload", async ({ page }) => {
  await loginAs(page, "lsp");
  await page.getByRole("link", { name: "Assigned Trips" }).click();
  await page.getByRole("link", { name: /4003/ }).first().click();
  await page.waitForURL(/\/vehicle\//);
  await page.getByRole("button", { name: "Delivered to Dealer" }).click();
  await expect(page.getByText("Delivered to dealer").first()).toBeVisible();

  await switchTo(page, "dealer");
  await page.getByRole("link", { name: "Pipeline" }).click();
  await page.getByRole("link", { name: /4003/ }).first().click();
  await page.waitForURL(/\/vehicle\//);
  await expect(page.getByRole("heading", { name: /Proof of delivery|Documents on the shared record/ }).first()).toBeVisible();
  await expect(page.getByText("Proof of delivery").first()).toBeVisible();
});

test("every persona's dashboard and sub-pages render", async ({ page }) => {
  const routes: Record<PersonaRole, string[]> = {
    hq: ["/hq", "/hq/orders", "/hq/pipeline", "/hq/tracking", "/hq/compliance", "/hq/exceptions"],
    plant: ["/plant", "/plant/queue", "/plant/compliance", "/plant/exceptions"],
    ro: ["/ro", "/ro/dealers", "/ro/pipeline", "/ro/tracking", "/ro/compliance", "/ro/exceptions"],
    dealer: [
      "/dealer",
      "/dealer/orders",
      "/dealer/pipeline",
      "/dealer/tracking",
      "/dealer/compliance",
      "/dealer/exceptions",
    ],
    lsp: ["/lsp", "/lsp/trips", "/lsp/tracking", "/lsp/exceptions"],
  };

  for (const [role, paths] of Object.entries(routes) as [PersonaRole, string[]][]) {
    await loginAs(page, role as PersonaRole);
    for (const path of paths) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("banner")).toBeVisible();
    }
    await page.getByRole("button", { name: "Switch persona" }).click();
    await page.waitForURL(/\/login/);
  }
});
