import { test, expect } from '@playwright/test';

test('Generar capturas de verificación: pasos del checkout y vista limpia de perspectiva', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  // Dismiss cookie banner
  await page.locator('button:has-text("Aceptar Todas")').click();

  // 1. Perspective modal clean without pills
  const viewPhotoBtn = page.locator("button[title*='perspectiva']").first();
  await viewPhotoBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'mobile-screens/09_perspective_clean_nobar.png' });
  
  // Close perspective modal
  await page.locator("button[title='Cerrar vista']").click();
  await page.waitForTimeout(400);

  // 2. Open product detail and add to cart
  await page.getByRole('button', { name: /Vinos & Cocteles/i }).click();
  await page.getByRole('heading', { level: 3, name: /Aura Negroni/i }).click();
  await page.getByRole('button', { name: /Agregar al Carrito/i }).click();
  await page.waitForTimeout(400);

  // 3. Open cart drawer
  await page.getByLabel(/pedido/i).click();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: /Continuar al Checkout/i }).click();
  await page.waitForTimeout(600);

  // 4. Step 1 screenshot (Contacto & Entrega)
  await page.screenshot({ path: 'mobile-screens/10_checkout_step1_contact_delivery.png' });

  // 5. Fill Step 1
  await page.getByRole('button', { name: /Delivery a Domicilio/i }).click();
  await page.locator("input[placeholder*='Ej. Juan']").fill('Alejandro Vargas');
  await page.locator("input[placeholder*='Ej. +591']").fill('+591 79788112');
  await page.locator("input[placeholder*='Ej. Av. Ballivián']").fill('Av. América #340, Cochabamba');
  
  // Alcohol declaration
  const alcoholCheckbox = page.locator("label:has-text('Declaro bajo juramento') input[type='checkbox']");
  if (await alcoholCheckbox.isVisible()) {
    await alcoholCheckbox.check();
  }

  // Advance to Step 2
  await page.getByRole('button', { name: /Siguiente: Método de Pago/i }).click();
  await page.waitForTimeout(600);

  // 6. Step 2 screenshot (Método de Pago)
  await page.screenshot({ path: 'mobile-screens/11_checkout_step2_payment_method.png' });
});
