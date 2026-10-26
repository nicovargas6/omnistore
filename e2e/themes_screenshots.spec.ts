import { test, expect } from '@playwright/test';

test.describe('Verification of Full-Bleed Themes, Category Pill & Admin Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'omnistore_cookie_consent_v1',
        JSON.stringify({ status: 'all', necessary: true, analytics: true, marketing: true })
      );
    });
  });

  test('1. Comida (Full-Bleed, Español, Nombre Restaurante, Ojo de Bife & Categorías visibles)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(700);

    // Verify Restaurant Name at top-left & Spanish headline
    await expect(page.getByText('Aura Bistró & Cantina').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Prueba el sabor/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /La vida es infinitamente deliciosa/i })).toBeVisible();

    // Desktop screenshot
    await page.screenshot({ path: 'mobile-screens/19_food_fullbleed_desktop.png', fullPage: false });

    // Select category "Platos Fuertes" and verify visibility
    const catBtn = page.getByRole('button', { name: /Platos Fuertes/i }).last();
    await catBtn.scrollIntoViewIfNeeded();
    await catBtn.click();
    await page.waitForTimeout(450);

    // Screenshot of the category filter bar with "Platos Fuertes" selected
    const filterSection = page.locator('input[placeholder*="Buscar por nombre"]').locator('..').locator('..').locator('..');
    await filterSection.screenshot({ path: 'mobile-screens/21_category_selected_fixed.png' });

    // Mobile screenshot
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'mobile-screens/20_food_fullbleed_mobile.png', fullPage: false });
  });

  test('2. Ropa (Full-Bleed en toda la página, Nombre de Marca KULT atrás, Guía de Talles, Upselling y Autoconfirmación)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto('/?giro=fashion');
    await page.waitForTimeout(800);

    // Hide sonner toast for clean screenshot
    await page.addStyleTag({ content: '[data-sonner-toaster] { display: none !important; }' });
    await page.waitForTimeout(200);

    // Desktop Fashion
    await page.screenshot({ path: 'mobile-screens/22_fashion_fullbleed_desktop.png', fullPage: false });

    // Open a fashion product and verify the Interactive Size Guide ("¿Cuál es mi talle?")
    const teeCard = page.getByRole('heading', { level: 3, name: /Heavyweight Boxy Tee/i });
    await teeCard.scrollIntoViewIfNeeded();
    await teeCard.click();
    await page.waitForTimeout(300);

    const sizeGuideBtn = page.getByRole('button', { name: /¿Cuál es mi talle\?/i });
    await expect(sizeGuideBtn).toBeVisible();
    await sizeGuideBtn.click();
    await page.waitForTimeout(300);
    await expect(page.getByText(/Guía de Medidas/i)).toBeVisible();
    await page.locator('div.fixed.inset-0.z-50 > div.relative').screenshot({ path: 'mobile-screens/31_fashion_size_guide.png' });

    // Add item to cart
    await page.getByRole('button', { name: /Agregar al Carrito/i }).click();
    await page.waitForTimeout(400);

    // Mobile Fashion + Sticky Bottom Cart Bar
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'mobile-screens/23_fashion_fullbleed_mobile.png', fullPage: false });

    // Open Cart Drawer and screenshot Free Shipping Bar + Upselling ("Completa tu look")
    await page.getByRole('button', { name: /Ir al Carrito & Pagar/i }).first().click();
    await page.waitForTimeout(450);
    await expect(page.getByText(/Completa tu look/i)).toBeVisible();
    await page.screenshot({ path: 'mobile-screens/29_cart_upsell_freeshipping.png', fullPage: false });

    // Proceed to Checkout and verify Automatic Bank Account Listener (PedidosYa style)
    await page.getByRole('button', { name: /Continuar al Checkout/i }).click();
    await page.locator("input[placeholder*='Ej. Juan']").fill('Carlos Mendoza');
    await page.locator("input[placeholder*='Ej. +591']").fill('+591 71234567');
    await page.getByRole('button', { name: /Envío Estándar/i }).click();
    await page.locator("input[placeholder*='Ej. Av. Ballivián']").fill('Av. América #450');
    await page.getByRole('button', { name: /Siguiente: Método de Pago/i }).click();
    await page.locator("label:has-text('He leído y acepto') input[type='checkbox']").check();
    await page.getByRole('button', { name: /Continuar al Pago con QR/i }).click();
    const bankBanner = page.getByText(/Esperando Acreditación Bancaria Automática/i);
    await expect(bankBanner).toBeVisible();
    await bankBanner.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'mobile-screens/32_qr_bank_listener.png', fullPage: false });
    await page.getByRole('button', { name: /Simular ingreso del dinero al Banco|Autoconfirmar/i }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/Pedido Autoconfirmado en Vivo/i)).toBeVisible();
    await page.screenshot({ path: 'mobile-screens/30_pedidosya_autoconfirm.png', fullPage: false });
  });

  test('3. Modo Admin — Cambiar entre las 5 secciones sin pantalla en blanco', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // Open Admin Auth Modal via footer button
    const adminBtn = page.locator("footer button:has-text('Admin')");
    await adminBtn.scrollIntoViewIfNeeded();
    await adminBtn.click();

    // Enter PIN 1234
    const pinInput = page.locator("input[placeholder='Ej. 1234']");
    await expect(pinInput).toBeVisible();
    await pinInput.fill('1234');
    await page.getByRole('button', { name: /Desbloquear y Acceder/i }).click();

    // 1. Dashboard tab
    await expect(page.getByText(/Resumen & Métricas/i)).toBeVisible();

    // 2. Inventario & Productos tab
    await page.getByRole('button', { name: /Inventario & Productos/i }).click();
    await expect(page.getByText(/Control de Inventario & Catálogo/i)).toBeVisible();

    // 3. Pedidos & Ventas tab
    await page.getByRole('button', { name: /Pedidos & Ventas/i }).click();
    await expect(page.getByText(/Gestión de Ventas & Pedidos/i)).toBeVisible();

    // 4. Categorías tab
    await page.getByRole('button', { name: /Categorías/i }).click();
    await expect(page.getByText(/Gestión de Categorías/i)).toBeVisible();

    // 5. Personalización & Empresa tab
    await page.getByRole('button', { name: /Personalización & Empresa/i }).click();
    await expect(page.getByText(/Personalización de la Empresa & Módulos/i)).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'mobile-screens/24_admin_customizer_fixed.png', fullPage: false });

    // Verify Food Hero Banner URL & preview in Customizer
    const bannerInput = page.locator('input[value="/luscious-food-bowl.png"]');
    await bannerInput.scrollIntoViewIfNeeded();
    await expect(bannerInput).toBeVisible();
    const assetsRow = bannerInput.locator('..').locator('..').locator('..');
    await assetsRow.screenshot({ path: 'mobile-screens/25_admin_food_banner_preview.png' });

    // Switch to Fashion preset inside Admin Customizer and verify /gazu-hero-model.png
    const fashionPresetCard = page.locator('h4:has-text("KULT Studio")').first();
    await fashionPresetCard.scrollIntoViewIfNeeded();
    await fashionPresetCard.click();
    await page.waitForTimeout(400);

    const fashionBannerInput = page.locator('input[value="/gazu-hero-model.png"]');
    await fashionBannerInput.scrollIntoViewIfNeeded();
    await expect(fashionBannerInput).toBeVisible();
    const fashionAssetsRow = fashionBannerInput.locator('..').locator('..').locator('..');
    await fashionAssetsRow.screenshot({ path: 'mobile-screens/26_admin_fashion_banner_preview.png' });

    // Verify the 4 Fashion Editorial Images section in Admin Customizer
    const editorialSection = page.getByText(/Imágenes de las Secciones Editoriales \(Ropa\)/i).locator('..').locator('..').locator('..');
    await editorialSection.scrollIntoViewIfNeeded();
    await expect(editorialSection).toBeVisible();
    await editorialSection.screenshot({ path: 'mobile-screens/27_admin_fashion_editorial_images.png' });
  });
});
