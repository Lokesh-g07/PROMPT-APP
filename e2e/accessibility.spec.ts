import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  const pagesToTest = ['/', '/products', '/login']; // cart and product/[id] need mock data or auth usually

  for (const pagePath of pagesToTest) {
    test(`should not have any automatically detectable accessibility issues on ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath);
      
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
