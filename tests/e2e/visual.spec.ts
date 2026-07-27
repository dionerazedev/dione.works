import { expect, test } from '@playwright/test';

const setTheme = async (page: import('@playwright/test').Page, theme: 'light' | 'dark') => {
  await page.evaluate((selectedTheme) => localStorage.setItem('dione-theme', selectedTheme), theme);
  await page.reload();
};

test('capture final route and responsive review surfaces', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await setTheme(page, 'light');
  await expect(page.getByRole('heading', { name: 'Dione Raze', level: 1 })).toBeVisible();
  await page.screenshot({ path: 'test-results/visual/home-desktop-light.png', fullPage: true });

  await setTheme(page, 'dark');
  await page.screenshot({ path: 'test-results/visual/home-desktop-dark.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/visual/home-mobile-dark.png', fullPage: false });
  await setTheme(page, 'light');
  await page.screenshot({ path: 'test-results/visual/home-mobile-light.png', fullPage: false });

  await page.setViewportSize({ width: 1280, height: 900 });
  for (const [route, heading, filename] of [
    ['/blog', 'blog', 'blog-light.png'],
    ['/blog/how-traveling-inspired-me-to-build-migo', 'How Traveling Inspired Me to Build Migo', 'blog-migo-journey-light.png'],
    ['/blog/my-journey-to-ai-automation-developer', 'My Journey From Computer Science Student to Self-Taught AI Automation Developer', 'blog-journey-light.png'],
    ['/gear', 'gear', 'gear-light.png'],
    ['/community', 'community', 'community-unavailable-light.png'],
    ['/work/migo', 'Migo', 'migo-case-light.png'],
    ['/work/peak-athletics', 'Peak Athletics', 'peak-athletics-case-light.png'],
  ] as const) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
    await page.screenshot({ path: `test-results/visual/${filename}`, fullPage: true });
  }

  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/');
    const migoCard = page.locator('.project-feature').filter({ has: page.getByRole('heading', { name: 'Migo', level: 3 }) });
    await migoCard.scrollIntoViewIfNeeded();
    for (const theme of ['light', 'dark'] as const) {
      await setTheme(page, theme);
      await migoCard.scrollIntoViewIfNeeded();
      await expect(migoCard.getByRole('img', { name: /Grayscale Migo travel app showcase/ })).toBeVisible();
      await migoCard.screenshot({ path: `test-results/visual/migo-card-${width}-${theme}.png` });
    }

    const laagCard = page.locator('.project-feature').filter({ has: page.getByRole('heading', { name: 'Laag Bukidnon', level: 3 }) });
    await laagCard.scrollIntoViewIfNeeded();
    for (const theme of ['light', 'dark'] as const) {
      await setTheme(page, theme);
      await laagCard.scrollIntoViewIfNeeded();
      await expect(laagCard.getByRole('img', { name: /Grayscale Laag Bukidnon tourism platform showcase/ })).toBeVisible();
      await laagCard.screenshot({ path: `test-results/visual/laag-bukidnon-card-${width}-${theme}.png` });
    }

    const narraCard = page.locator('.project-feature').filter({ has: page.getByRole('heading', { name: 'Narra Estates', level: 3 }) });
    await narraCard.scrollIntoViewIfNeeded();
    for (const theme of ['light', 'dark'] as const) {
      await setTheme(page, theme);
      await narraCard.scrollIntoViewIfNeeded();
      await expect(narraCard.getByRole('img', { name: /Grayscale Narra Estates luxury real estate showcase/ })).toBeVisible();
      await narraCard.screenshot({ path: `test-results/visual/narra-estates-card-${width}-${theme}.png` });
    }
  }
});
