import { test, expect } from '@playwright/test';

test.describe('OmniStore Pro — Suite E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Capture any uncaught page errors
    page.on('pageerror', (err) => {
      console.error('Page error detected:', err.message);
    });

    await page.goto('/');
    // Close cookie banner if present to avoid intercepting clicks
    const acceptCookies = page.getByRole('button', { name: /Aceptar Todas|Solo Necesarias/i });
    if (await acceptCookies.isVisible({ timeout: 1500 }).catch(() => false)) {
      await acceptCookies.click();
    }
  });

  test('1. Responsividad y verificación de desbordamiento horizontal', async ({ page }) => {
    // Test mobile viewport (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(mobileOverflow).toBe(false);

    // Test desktop viewport (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    const desktopOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(desktopOverflow).toBe(false);

    // Header & main elements must be visible
    await expect(page.getByRole('heading', { level: 1, name: /Aura Bistró/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Mi Pedido/i })).toBeVisible();
  });

  test('2. Filtrado de categorías y modal de detalle de producto', async ({ page }) => {
    // Filter by Vinos & Cocteles
    const cocktailFilterBtn = page.getByRole('button', { name: /Vinos & Cocteles/i });
    await expect(cocktailFilterBtn).toBeVisible();
    await cocktailFilterBtn.click();

    // Verify cocktail card is visible
    const cocktailTitle = page.getByRole('heading', { level: 3, name: /Aura Negroni/i });
    await expect(cocktailTitle).toBeVisible();

    // Click card to open detail modal
    await cocktailTitle.click();

    // Verify detail modal opened
    const detailModal = page.locator('div.fixed.inset-0.z-50');
    await expect(detailModal).toBeVisible();
    await expect(page.getByRole('button', { name: /Agregar al Carrito/i })).toBeVisible();

    // Add to cart from detail modal
    await page.getByRole('button', { name: /Agregar al Carrito/i }).click();

    // Modal should close
    await expect(detailModal).not.toBeVisible();

    // Cart button should now display 1 item
    await expect(page.getByRole('button', { name: /Mi Pedido/i })).toContainText('1');
  });

  test('3. Carrito de compras, drawer y cálculo de subtotales', async ({ page }) => {
    // Filter and add a cocktail
    await page.getByRole('button', { name: /Vinos & Cocteles/i }).click();
    await page.getByRole('heading', { level: 3, name: /Aura Negroni/i }).click();
    await page.getByRole('button', { name: /Agregar al Carrito/i }).click();

    // Open Cart Drawer
    await page.getByRole('button', { name: /Mi Pedido/i }).click();

    // Verify drawer contents
    await expect(page.getByText('Tu Carrito de Compra')).toBeVisible();
    const cartDrawer = page.locator('div.w-screen.max-w-md');
    await expect(cartDrawer.getByText(/Aura Negroni/i).first()).toBeVisible();
    await expect(page.getByText('Subtotal de productos:')).toBeVisible();
    await expect(page.getByRole('button', { name: /Continuar al Checkout/i })).toBeVisible();
  });

  test('4. Flujo de Checkout, verificación de edad Ley 259 (+18) y validación de campos', async ({ page }) => {
    // Add cocktail to cart
    await page.getByRole('button', { name: /Vinos & Cocteles/i }).click();
    await page.getByRole('heading', { level: 3, name: /Aura Negroni/i }).click();
    await page.getByRole('button', { name: /Agregar al Carrito/i }).click();

    // Open Cart and proceed to checkout
    await page.getByRole('button', { name: /Mi Pedido/i }).click();
    await page.getByRole('button', { name: /Continuar al Checkout/i }).click();

    // Checkout modal is visible in Step 1 (Contact & Delivery)
    await expect(page.getByText(/Información de Contacto & Entrega/i)).toBeVisible();

    // Ley 259 alcohol banner must be displayed because cart has alcohol
    await expect(page.getByText(/Ley N° 259/i)).toBeVisible();
    const alcoholCheckbox = page.locator("label:has-text('Declaro bajo juramento') input[type='checkbox']");
    await expect(alcoholCheckbox).toBeVisible();
    await expect(alcoholCheckbox).not.toBeChecked();

    // Select delivery option
    await page.getByRole('button', { name: /Delivery a Domicilio/i }).click();

    // Fill client info
    await page.locator("input[placeholder*='Ej. Juan']").fill('Carlos Mendoza');
    await page.locator("input[placeholder*='Ej. +591']").fill('+591 78901234');
    await page.locator("input[placeholder*='Ej. Av. Ballivián']").fill('Av. América #340, Cochabamba');

    // Edge case: Click "Siguiente: Método de Pago" without checking +18 declaration
    const nextBtn = page.getByRole('button', { name: /Siguiente: Método de Pago/i });
    await nextBtn.click();

    // Should remain in Step 1 because +18 was not accepted
    await expect(page.getByText(/Información de Contacto & Entrega/i)).toBeVisible();

    // Now check +18 declaration
    await alcoholCheckbox.check();
    await expect(alcoholCheckbox).toBeChecked();

    // Click "Siguiente: Método de Pago" to advance to Step 2
    await nextBtn.click();

    // Step 2 is now visible
    await expect(page.getByText(/Selecciona tu Método de Pago/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Volver \/ Modificar datos de entrega/i })).toBeVisible();

    // Check privacy / terms consent
    const privacyCheckbox = page.locator("label:has-text('He leído y acepto') input[type='checkbox']");
    await privacyCheckbox.check();

    // Now submit order to QR payment screen
    const submitBtn = page.getByRole('button', { name: /Continuar al Pago con QR/i });
    await submitBtn.click();

    // Seamless transition to QR Simple payment screen (NO white screen)
    await expect(page.getByText(/QR Simple Oficial Interoperable/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Escanea con la App de tu Banco/i)).toBeVisible();
    await expect(page.getByText(/Esperando Acreditación Bancaria/i)).toBeVisible();
    await expect(page.getByText(/Banco Nacional de Bolivia/i)).toBeVisible();
  });

  test('5. Seguridad: Protección del modo Administrador con código PIN', async ({ page }) => {
    // Discrete Admin lock button in footer
    const adminLockBtn = page.locator("footer button:has-text('Admin')");
    await expect(adminLockBtn).toBeVisible();
    await adminLockBtn.click();

    // Admin PIN Modal must appear
    await expect(page.getByText('Panel de Gestión Protegido')).toBeVisible();
    const pinInput = page.locator("input[placeholder='Ej. 1234']");
    const unlockBtn = page.getByRole('button', { name: /Desbloquear y Acceder/i });

    // Edge case: Test invalid PIN (9999)
    await pinInput.fill('9999');
    await unlockBtn.click();
    await expect(page.getByText(/PIN incorrecto/i)).toBeVisible();

    // Happy path: Enter correct PIN (1234)
    await pinInput.fill('1234');
    await unlockBtn.click();

    // Admin Layout opens
    await expect(page).toHaveURL(/.*admin/);
    await expect(page.getByText('Resumen & Métricas')).toBeVisible();
    await expect(page.getByText('Inventario & Productos')).toBeVisible();
    await expect(page.getByText('Volver a la Tienda')).toBeVisible();
  });

});
