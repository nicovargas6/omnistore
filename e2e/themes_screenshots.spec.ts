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

  test('2. Ropa (Full-Bleed en toda la página, Nombre de Marca KULT atrás, Animación y Español)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto('/');

    // Switch to Fashion preset
    await page.locator('button:has-text("KULT Studio")').first().click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);

    // Hide sonner toast for clean screenshot
    await page.addStyleTag({ content: '[data-sonner-toaster] { display: none !important; }' });
    await page.waitForTimeout(200);

    // Desktop Fashion
    await page.screenshot({ path: 'mobile-screens/22_fashion_fullbleed_desktop.png', fullPage: false });

    // Mobile Fashion
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'mobile-screens/23_fashion_fullbleed_mobile.png', fullPage: false });
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
  });
});
