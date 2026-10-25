import { test } from '@playwright/test';

test.describe('Theme Designs Verification (Fashion GAZU & Food Luscious)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'omnistore_cookie_consent_v1',
        JSON.stringify({ status: 'all', necessary: true, analytics: true, marketing: true })
      );
    });
  });

  test('1. Comida / Restaurante — Vista Desktop y Móvil', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'mobile-screens/15_food_hero_desktop.png', fullPage: false });

    // Mobile Comida
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'mobile-screens/16_food_hero_mobile.png', fullPage: false });
  });

  test('2. Ropa / Moda — Vista Desktop y Móvil', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1050 });
    await page.goto('/');

    // Switch to Fashion preset
    await page.locator('button:has-text("KULT Studio")').first().click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);

    // Hide any sonner toast for a spotless visual screenshot
    await page.addStyleTag({ content: '[data-sonner-toaster] { display: none !important; }' });
    await page.waitForTimeout(200);

    // Desktop Fashion
    await page.screenshot({ path: 'mobile-screens/17_fashion_hero_desktop.png', fullPage: false });

    // Mobile Fashion
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'mobile-screens/18_fashion_hero_mobile.png', fullPage: false });
  });
});
