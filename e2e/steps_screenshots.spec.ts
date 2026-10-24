import { test, expect } from '@playwright/test';

test('Generar captura del nuevo mapa CartoDB limpio con buscador de calle', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  // Dismiss cookie banner
  await page.locator('button:has-text("Aceptar Todas")').click();

  // Open Negroni cocktail, add to cart, and close modal
  await page.getByRole('button', { name: /Vinos & Cocteles/i }).click();
  await page.getByRole('heading', { level: 3, name: /Aura Negroni/i }).click();
  await page.getByRole('button', { name: /Agregar al Carrito/i }).click();
  await page.waitForTimeout(300);

  // Close product modal if still open
  const closeBtn = page.locator("div.fixed.inset-0.z-50 button").first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(300);
  }

  // Open cart drawer
  await page.getByLabel(/pedido/i).click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /Continuar al Checkout/i }).click();
  await page.waitForTimeout(600);

  // Click on Delivery a Domicilio to show the map
  await page.getByRole('button', { name: /Delivery a Domicilio/i }).click();
  await page.waitForTimeout(600);

  // Expect search input to be visible
  await expect(page.locator("input[placeholder*='Escribe tu calle o avenida']")).toBeVisible();

  // Capture screenshot of the clean map with search bar
  await page.screenshot({ path: 'mobile-screens/14_mapa_limpio_buscador_calles.png' });
});
