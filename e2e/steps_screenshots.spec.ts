import { test, expect } from '@playwright/test';

test('Generar capturas de verificación: talles visibles y factura en sección 3', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  // Dismiss cookie banner
  await page.locator('button:has-text("Aceptar Todas")').click();

  // Switch to KULT Studio preset to verify clothing sizes (talles)
  await page.locator("header button:has-text('Giro:')").click();
  await page.waitForTimeout(300);
  await page.locator("button:has-text('KULT Studio')").first().click();
  await page.waitForTimeout(600);

  // Click on the Hoodie to inspect size pills
  await page.locator("h3:has-text('Hoodie Francés')").click();
  await page.waitForTimeout(500);

  // Expect size pills to show "Talle M", "Talle L", "Talle XL"
  await expect(page.locator("button:has-text('Talle M')")).toBeVisible();
  await expect(page.locator("button:has-text('Talle L')")).toBeVisible();
  await expect(page.locator("button:has-text('Talle XL')")).toBeVisible();

  // Capture screenshot of the modal with talles clearly visible
  await page.screenshot({ path: 'mobile-screens/12_talles_visibles.png' });

  // Add to cart with Talle L
  await page.locator("button:has-text('Talle L')").click();
  await page.locator("button:has-text('Agregar al Carrito')").click();
  await page.waitForTimeout(400);

  // Go to cart
  await page.getByLabel(/pedido/i).click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /Continuar al Checkout/i }).click();
  await page.waitForTimeout(500);

  // Fill Step 1
  await page.locator("input[placeholder*='Ej. Juan']").fill('Valeria Rios');
  await page.locator("input[placeholder*='Ej. +591']").fill('+591 76543210');
  
  // Advance to Step 2
  await page.getByRole('button', { name: /Siguiente: Método de Pago/i }).click();
  await page.waitForTimeout(600);

  // Verify Factura is now in Section 3 (Payment Step)
  await expect(page.getByText('¿Deseas Factura con Crédito Fiscal?')).toBeVisible();

  // Check the invoice checkbox to display fields
  await page.locator("label:has-text('¿Deseas Factura con Crédito Fiscal?') input[type='checkbox']").check();
  await page.waitForTimeout(400);

  // Capture screenshot of Step 2 with Invoicing in Section 3
  await page.screenshot({ path: 'mobile-screens/13_factura_en_seccion3.png' });
});
