import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { ALL_PROJECTS } from '../../data/projects';
import { PROFILE_LINKS } from '../../data/navigation';

const VIEWPORTS = [
  { width: 320, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 900 },
  { width: 1440, height: 900 },
];

const collectConsoleErrors = (page: Page) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
};

for (const viewport of VIEWPORTS) {
  test(`homepage has no horizontal overflow at ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors = collectConsoleErrors(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#hero-heading')).toBeVisible();
    await expect.poll(() => page.locator('.hero-portrait img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    if (viewport.width < 1024) {
      const visibleControls = page.locator('.mobile-topbar button:visible');
      for (let index = 0; index < await visibleControls.count(); index += 1) {
        const box = await visibleControls.nth(index).boundingBox();
        expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      }
    }
    expect(errors).toEqual([]);
  });
}

test('theme defaults to light, supports explicit choices, and persists', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await page.evaluate(() => localStorage.removeItem('dione-theme'));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveAttribute('data-theme-preference', 'light');
  await page.getByRole('group', { name: 'Theme' }).first().getByRole('button', { name: 'dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme-preference', 'dark');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0c0c0f');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('sidebar shootaround scores, persists its best, resets, and stays out of the mobile menu', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.evaluate(() => localStorage.removeItem('dione-shootaround-best'));
  await page.reload();

  const game = page.getByRole('application', { name: /Shootaround/ });
  const status = page.locator('.playground-heading > div > span');
  const made = page.locator('.playground-scoreboard dd').first();
  const best = page.locator('.playground-scoreboard dd').nth(1);
  await expect(game).toBeVisible();
  await expect(status).toHaveText('ready');

  await game.focus();
  await page.keyboard.press('Space');
  await expect(made).toHaveText('01', { timeout: 3_000 });
  await expect(best).toHaveText('01');
  await expect(status).toHaveText('ready', { timeout: 3_000 });
  await expect.poll(() => page.evaluate(() => localStorage.getItem('dione-shootaround-best'))).toBe('1');

  await game.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.trajectory-guide circle')).not.toHaveCount(0);
  await page.keyboard.press('r');
  await expect(status).toHaveText('ready', { timeout: 1_500 });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.mobile-topbar').getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.locator('.mobile-menu .sidebar-playground')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('shootaround handles misses, repeated input, and backboard collision recovery', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const game = page.getByRole('application', { name: /Shootaround/ });
  const status = page.locator('.playground-heading > div > span');
  const ball = page.locator('.playground-ball');
  const ballBox = await ball.boundingBox();
  if (!ballBox) throw new Error('Basketball was not rendered');
  const startX = ballBox.x + ballBox.width / 2;
  const startY = ballBox.y + ballBox.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX - 22, startY + 9, { steps: 5 });
  await expect(status).toHaveText('aiming');
  await expect(page.locator('.trajectory-guide circle')).not.toHaveCount(0);
  await page.mouse.up();
  await expect(status).toHaveText('in flight');

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.up();
  await expect(status).toHaveText('in flight');
  await expect(status).toHaveText('ready', { timeout: 7_000 });
  await expect(page.locator('.playground-scoreboard dd').first()).toHaveText('00');

  await game.focus();
  const rimCollisionsBefore = Number(await game.getAttribute('data-rim-collisions'));
  for (let press = 0; press < 6; press += 1) await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  await expect.poll(async () => Number(await game.getAttribute('data-rim-collisions')), { timeout: 3_000 }).toBeGreaterThan(rimCollisionsBefore);
  await page.getByRole('button', { name: 'Reset basketball' }).click();
  await expect(status).toHaveText('ready', { timeout: 1_500 });

  await game.focus();
  const backboardCollisionsBefore = Number(await game.getAttribute('data-backboard-collisions'));
  for (let press = 0; press < 10; press += 1) await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  await expect.poll(async () => Number(await game.getAttribute('data-backboard-collisions')), { timeout: 3_000 }).toBeGreaterThan(backboardCollisionsBefore);
  await page.getByRole('button', { name: 'Reset basketball' }).click();
  await expect(status).toHaveText('ready', { timeout: 1_500 });
});

test('shootaround accepts emulated touch dragging without page overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/');
  const ballBox = await page.locator('.playground-ball').boundingBox();
  if (!ballBox) throw new Error('Basketball was not rendered');
  const startX = ballBox.x + ballBox.width / 2;
  const startY = ballBox.y + ballBox.height / 2;
  const session = await context.newCDPSession(page);

  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: startX, y: startY, id: 1 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: startX - 12, y: startY + 5, id: 1 }] });
  await expect(page.locator('.playground-heading > div > span')).toHaveText('aiming');
  await expect(page.locator('.trajectory-guide circle')).not.toHaveCount(0);
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('.playground-heading > div > span')).toHaveText('in flight');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await context.close();
});

test('command palette supports search, keyboard activation, Escape, and focus restoration', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+Shift+K');
  const palette = page.getByRole('dialog', { name: 'Command palette' });
  await expect(palette).toBeVisible();
  const input = page.getByRole('combobox');
  await input.fill('technology');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#tech-stack$/);
  await page.keyboard.press('Control+Shift+K');
  await expect(palette).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(palette).toBeHidden();
});

test('command palette opens the portfolio assistant', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+Shift+K');
  await page.getByRole('combobox').fill('assistant');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Portfolio Assistant' })).toBeVisible();
});

test('tech stack uses grouped technology chips', async ({ page }) => {
  await page.goto('/#tech-stack');
  const stack = page.locator('#tech-stack');
  await expect(stack.getByRole('heading', { name: 'tech stack', level: 3 })).toBeVisible();
  await expect(stack.getByText('The tools, frameworks, and platforms I reach for')).toBeVisible();
  await expect(stack.getByRole('heading', { name: 'Frontend', level: 4 })).toBeVisible();
  await expect(stack.getByRole('list', { name: 'Frontend technologies' }).getByText('React', { exact: true })).toBeVisible();
  await expect(stack.getByRole('list', { name: 'AI technologies' }).getByText('OpenAI', { exact: true })).toBeVisible();
});

test('Command and Control K open Ask anything', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+K');
  const assistant = page.getByRole('dialog', { name: 'Portfolio Assistant' });
  await expect(assistant).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Meta+K');
  await expect(assistant).toBeVisible();
});

test('all project routes render without console errors and expose project navigation', async ({ page }) => {
  test.setTimeout(60_000);
  for (const project of ALL_PROJECTS) {
    const errors = collectConsoleErrors(page);
    await page.goto(`/work/${project.slug}`);
    await expect(page.getByRole('heading', { name: project.title, level: 1 })).toBeVisible();
    await expect.poll(() => page.locator('.case-study-cover img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    await expect(page.getByRole('navigation', { name: 'Project navigation' })).toBeVisible();
    expect(errors).toEqual([]);
  }
});

test('primary profile and project links retain their verified destinations', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator(`a[href="${PROFILE_LINKS.github}"]`).first()).toHaveAttribute('target', '_blank');
  await expect(page.locator(`a[href="${PROFILE_LINKS.linkedin}"]`).first()).toHaveAttribute('target', '_blank');
  await expect(page.locator(`a[href="${PROFILE_LINKS.resume}"]`).first()).toHaveAttribute('target', '_blank');
  await expect(page.locator(`a[href="${PROFILE_LINKS.email}"]`).first()).toBeAttached();
  for (const project of ALL_PROJECTS.filter((item) => item.liveUrl || item.sourceUrl || item.videoUrl || item.demoUrl)) {
    await page.goto(`/work/${project.slug}`);
    if (project.liveUrl) await expect(page.locator(`a[href="${project.liveUrl}"]`)).toBeAttached();
    if (project.sourceUrl) await expect(page.locator(`a[href="${project.sourceUrl}"]`)).toBeAttached();
    if (project.videoUrl) await expect(page.locator(`a[href="${project.videoUrl}"]`)).toBeAttached();
    if (project.demoUrl) await expect(page.locator(`a[href="${project.demoUrl}"]`)).toBeAttached();
  }
});

test('Migo uses the contained grayscale three-phone thumbnail across themes and widths', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = collectConsoleErrors(page);
  const imageAlt = 'Grayscale Migo travel app showcase with three smartphone mockups arranged around geometric stone objects';

  for (const width of [375, 390, 768, 1280]) {
    for (const theme of ['light', 'dark'] as const) {
      await page.setViewportSize({ width, height: width < 640 ? 844 : 900 });
      await page.goto('/');
      await page.evaluate((selectedTheme) => localStorage.setItem('dione-theme', selectedTheme), theme);
      await page.reload();
      const card = page.locator('.project-feature').filter({ has: page.getByRole('heading', { name: 'Migo', level: 3 }) });
      await card.scrollIntoViewIfNeeded();
      const frame = card.locator('.migo-project-image');
      const image = frame.getByRole('img', { name: imageAlt });
      await expect(image).toHaveAttribute('src', '/images/migo-grayscale-showcase.png');
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => [element.naturalWidth, element.naturalHeight])).toEqual([1536, 1024]);
      await expect(frame).toHaveCSS('padding', '6px');
      await expect(frame).toHaveCSS('background-color', 'rgb(247, 247, 247)');
      await expect(frame).toHaveCSS('box-shadow', 'none');
      await expect(image).toHaveCSS('object-fit', 'contain');
      await expect(image).toHaveCSS('object-position', '50% 50%');
      const frameBox = await frame.boundingBox();
      expect((frameBox?.width ?? 0) / (frameBox?.height ?? 1)).toBeCloseTo(1.5, 1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    }
  }

  const expandButton = page.getByRole('button', { name: 'Enlarge Migo project image' });
  await expandButton.click();
  const lightbox = page.getByRole('dialog', { name: 'Enlarged view of Migo' });
  await expect(lightbox).toBeVisible();
  await expect(lightbox.getByRole('img', { name: imageAlt })).toHaveAttribute('src', '/images/migo-grayscale-showcase.png');
  await page.keyboard.press('Escape');
  await expect(lightbox).toBeHidden();

  await page.goto('/work/migo');
  await expect(page.locator('.case-study-cover img')).toHaveAttribute('src', '/images/projects/migo-ai-travel-buddy.webp');
  expect(errors).toEqual([]);
});

test('Laag Bukidnon uses the premium grayscale showcase thumbnail', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  const imageAlt = 'Grayscale Laag Bukidnon tourism platform showcase with a desktop browser mockup, destination map, and trip itinerary panel';

  await page.goto('/');
  const card = page.locator('.project-feature').filter({ has: page.getByRole('heading', { name: 'Laag Bukidnon', level: 3 }) });
  await card.scrollIntoViewIfNeeded();
  const image = card.getByRole('img', { name: imageAlt });
  await expect(image).toHaveAttribute('src', '/images/projects/laag-bukidnon-showcase.png');
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => [element.naturalWidth, element.naturalHeight])).toEqual([1448, 1086]);

  await page.goto('/work/laag-bukidnon');
  await expect(page.locator('.case-study-cover img')).toHaveAttribute('src', '/images/projects/laag-bukidnon-desktop.webp');
  expect(errors).toEqual([]);
});

test('Narra Estates uses the premium grayscale showcase thumbnail', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  const imageAlt = 'Grayscale Narra Estates luxury real estate showcase with a desktop browser, Azure Cliffs property card, and private viewing search panel';

  await page.goto('/');
  const card = page.locator('.project-feature').filter({ has: page.getByRole('heading', { name: 'Narra Estates', level: 3 }) });
  await card.scrollIntoViewIfNeeded();
  const image = card.getByRole('img', { name: imageAlt });
  await expect(image).toHaveAttribute('src', '/images/projects/narra-estates-showcase.png');
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => [element.naturalWidth, element.naturalHeight])).toEqual([1448, 1086]);

  await page.goto('/work/narra-estates');
  await expect(page.locator('.case-study-cover img')).toHaveAttribute('src', '/images/projects/narra-estates-desktop.webp');
  expect(errors).toEqual([]);
});

test('selected work excludes n8n automations while current work keeps them', async ({ page }) => {
  const errors = collectConsoleErrors(page);

  await page.goto('/');
  const selectedWork = page.locator('#featured-work');
  await expect(selectedWork.getByRole('heading', { name: 'Migo', level: 3 })).toBeVisible();
  await expect(selectedWork.getByRole('heading', { name: 'Laag Bukidnon', level: 3 })).toBeVisible();
  await expect(selectedWork.getByRole('heading', { name: 'Narra Estates', level: 3 })).toBeVisible();
  await expect(selectedWork.getByRole('heading', { name: 'Peak Athletics', level: 3 })).toBeVisible();
  await expect(selectedWork.getByRole('heading', { name: 'WhatsApp AI Booking & Inquiry Agent', level: 3 })).toHaveCount(0);
  await expect(selectedWork.getByRole('heading', { name: 'AI Voice Receptionist & Dynamic Appointment Manager', level: 3 })).toHaveCount(0);

  const currentWork = page.locator('.current-work');
  await expect(currentWork.getByRole('heading', { name: 'A working set of automation patterns and product tools.', level: 2 })).toBeVisible();
  await expect(currentWork.getByRole('heading', { name: 'Ten documented workflow systems.', level: 3 })).toBeVisible();
  await expect(currentWork.getByRole('link', { name: 'WhatsApp AI Booking & Inquiry Agent' })).toBeVisible();
  await expect(currentWork.getByRole('link', { name: 'AI Voice Receptionist & Dynamic Appointment Manager' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Peak Athletics is featured as project 04 and opens its complete case study', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  const liveUrl = 'https://peak-athletics-xhp79eca.myshopify.com/';
  const imageAlt = 'Peak Athletics Shopify desktop homepage with monochrome navigation and a Built to Go Beyond athletic campaign hero';

  await page.goto('/');
  const card = page.locator('.project-feature').filter({ has: page.getByRole('heading', { name: 'Peak Athletics', level: 3 }) });
  await expect(card).toBeVisible();
  await card.scrollIntoViewIfNeeded();
  await expect(card.locator('.project-kicker').getByText('04', { exact: true })).toBeVisible();
  await expect(card.getByText('E-commerce Storefront', { exact: true })).toBeVisible();
  await expect(card.getByText('Demo password:')).toContainText('hireme');
  const cardImage = card.getByRole('img', { name: imageAlt });
  await expect(cardImage).toHaveAttribute('src', '/images/projects/peak-athletics-desktop.png');
  await expect(cardImage).toHaveAttribute('loading', 'lazy');
  await expect.poll(() => cardImage.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(card.getByRole('link', { name: /Live/i })).toHaveAttribute('href', liveUrl);
  await expect(card.getByRole('link', { name: /Live/i })).toHaveAttribute('target', '_blank');
  await expect(card.getByRole('link', { name: /Source/i })).toHaveCount(0);

  await card.getByRole('link', { name: /Case study/i }).click();
  await expect(page).toHaveURL(/\/work\/peak-athletics$/);
  await expect(page.getByRole('heading', { name: 'Peak Athletics', level: 1 })).toBeVisible();
  await expect(page.getByText('SHOPIFY E-COMMERCE', { exact: true })).toBeVisible();
  await expect(page.getByText('Demo password:')).toContainText('hireme');
  await expect(page.getByRole('link', { name: /Open project/i })).toHaveAttribute('href', liveUrl);
  await expect(page.getByRole('link', { name: /View source/i })).toHaveCount(0);
  await expect(page.getByRole('img', { name: imageAlt })).toBeVisible();
  await expect(page.locator('.case-study-body > section')).toHaveCount(7);
  for (const heading of [
    'Overview',
    'Challenge',
    'Solution',
    'Shopify implementation',
    'Product and collection system',
    'Responsive design',
    'Results',
  ]) {
    await expect(page.getByRole('heading', { name: heading, level: 2 })).toBeVisible();
  }
  await expect(page.getByText('Fictional athletic apparel brand created as a Shopify design and development demonstration.', { exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Project navigation' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Peak Athletics', level: 1 })).toBeVisible();

  await page.goto('/');
  await page.keyboard.press('Control+Shift+K');
  await page.getByRole('combobox').fill('Peak Athletics');
  const projectCommand = page.getByRole('option', { name: 'Open Peak Athletics' });
  await expect(projectCommand).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/work\/peak-athletics$/);
  expect(errors).toEqual([]);
});

test('Peak Athletics case study is responsive and accessible in both themes', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = collectConsoleErrors(page);
  for (const width of [375, 390, 768, 1280]) {
    for (const theme of ['light', 'dark'] as const) {
      await page.setViewportSize({ width, height: width < 640 ? 844 : 900 });
      await page.goto('/work/peak-athletics');
      await page.evaluate((selectedTheme) => localStorage.setItem('dione-theme', selectedTheme), theme);
      await page.reload();
      await expect(page.getByRole('heading', { name: 'Peak Athletics', level: 1 })).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('.case-study-cover img')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
      if (width === 390) expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    }
  }
  expect(errors).toEqual([]);
});

test('homepage blog preview shows the latest published posts and preserves navigation', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/');
  const section = page.locator('#blog-preview');
  await expect(section.getByRole('heading', { name: '01 — blog', level: 2 })).toBeVisible();
  await expect(page.locator('.stats-row + #blog-preview')).toHaveCount(1);
  await expect(page.locator('#blog-preview + #featured-work')).toHaveCount(1);

  const allPosts = section.getByRole('link', { name: /All posts/i });
  await expect(allPosts).toHaveAttribute('href', '/blog');
  const rows = section.locator('.blog-preview-row');
  await expect(rows).toHaveCount(2);
  expect(await rows.count()).toBeLessThanOrEqual(3);
  await expect(section.locator('img')).toHaveCount(0);

  const journeyTitle = 'My Journey From Computer Science Student to Self-Taught AI Automation Developer';
  const migoTitle = 'How Traveling Inspired Me to Build Migo';
  const journeyRow = section.getByRole('link', { name: new RegExp(journeyTitle) });
  const migoRow = section.getByRole('link', { name: new RegExp(migoTitle) });
  await expect(journeyRow).toHaveAttribute('href', '/blog/my-journey-to-ai-automation-developer');
  await expect(migoRow).toHaveAttribute('href', '/blog/how-traveling-inspired-me-to-build-migo');
  await expect(journeyRow.getByText('July 2026', { exact: true })).toBeVisible();
  await expect(migoRow.getByText('July 2026', { exact: true })).toBeVisible();
  await journeyRow.focus();
  await expect(journeyRow).toBeFocused();
  await expect(journeyRow).toHaveCSS('outline-width', '2px');

  await migoRow.click();
  await expect(page).toHaveURL(/\/blog\/how-traveling-inspired-me-to-build-migo$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(section).toBeVisible();

  await allPosts.click();
  await expect(page).toHaveURL(/\/blog$/);
  expect(errors).toEqual([]);
});

test('homepage blog preview adapts across themes and requested widths', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = collectConsoleErrors(page);
  for (const width of [375, 390, 768, 1280]) {
    for (const theme of ['light', 'dark'] as const) {
      await page.setViewportSize({ width, height: width < 640 ? 844 : 900 });
      await page.goto('/');
      await page.evaluate((selectedTheme) => localStorage.setItem('dione-theme', selectedTheme), theme);
      await page.reload();
      const section = page.locator('#blog-preview');
      const firstRow = section.locator('.blog-preview-row').first();
      await expect(section).toBeVisible();
      await expect(firstRow).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
      const titleBox = await firstRow.getByRole('heading', { level: 3 }).boundingBox();
      const dateBox = await firstRow.locator('time').boundingBox();
      if (width < 640) {
        expect(dateBox?.y ?? 0).toBeGreaterThan(titleBox?.y ?? 0);
        await expect(firstRow.locator('p')).toHaveCSS('-webkit-line-clamp', '2');
      } else {
        expect(dateBox?.x ?? 0).toBeGreaterThan(titleBox?.x ?? 0);
      }
    }
  }
  expect(errors).toEqual([]);
});

test('reduced motion disables smooth scrolling and long CSS motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  const transitionDuration = await page.locator('.project-image-button img').first().evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(['0.01ms', '1e-05s']).toContain(transitionDuration);
});

test('mobile menu, archive filter, direct case route, and lightbox work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const menu = page.getByRole('dialog', { name: 'Navigation' });
  await expect(menu).toBeVisible();
  await menu.getByRole('link', { name: /Projects/ }).click();
  await expect(page).toHaveURL(/#featured-work$/);
  await page.locator('#automation-work').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'n8n', exact: true }).click();
  await expect(page.locator('.automation-project')).toHaveCount(5);
  await page.goto('/work/migo');
  await expect(page.getByRole('heading', { name: 'Migo', level: 1 })).toBeVisible();
  await page.locator('.case-study-cover').click();
  await expect(page.getByRole('dialog', { name: /Enlarged view/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: /Enlarged view/ })).toBeHidden();
});

test('homepage, case study, command palette, and mobile menu pass axe', async ({ page }) => {
  await page.goto('/');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.goto('/work/whatsapp-ai-booking-agent');
  await expect(page.getByRole('heading', { name: 'WhatsApp AI Booking & Inquiry Agent', level: 1 })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.keyboard.press('Control+K');
  const assistant = page.getByRole('dialog', { name: 'Portfolio Assistant' });
  await expect(assistant).toBeVisible();
  await expect(assistant).toHaveCSS('opacity', '1');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('published blog post opens from the listing and browser history returns to the blog', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/');
  await expect(page.getByText('Working notes from the build process.')).toHaveCount(0);
  await page.locator('.desktop-sidebar').getByRole('link', { name: 'Blog', exact: true }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.getByRole('heading', { name: 'blog', level: 1 })).toBeVisible();
  for (const removedTitle of [
    'Building an AI booking agent without hiding the handoffs',
    'n8n workflows that are easier to operate',
    'Notes on full-stack products with Supabase',
  ]) {
    await expect(page.getByText(removedTitle, { exact: true })).toHaveCount(0);
  }
  const publishedCard = page.getByRole('link', { name: /Open article: My Journey From Computer Science Student/ });
  await expect(publishedCard).toBeVisible();
  await expect(publishedCard.getByText('Draft', { exact: true })).toHaveCount(0);
  await expect(publishedCard.getByRole('img', { name: 'Monochrome workspace representing a self-taught AI automation developer.' })).toBeVisible();
  await publishedCard.click();
  await expect(page).toHaveURL(/\/blog\/my-journey-to-ai-automation-developer$/);
  await expect(page.getByRole('heading', { name: 'My Journey From Computer Science Student to Self-Taught AI Automation Developer', level: 1 })).toBeVisible();
  await expect(page.getByText('Personal Journey', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('4 min read', { exact: true })).toBeVisible();
  await expect(page.getByText('July 27, 2026', { exact: true })).toBeVisible();
  await expect(page.getByText('Draft', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('img', { name: 'Monochrome workspace representing a self-taught AI automation developer.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to Blog' })).toBeVisible();
  await expect(page.locator('.article-body section')).toHaveCount(5);
  await expect(page.locator('.article-body li')).toHaveCount(6);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index, follow/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://dioneraze.com/blog/self-taught-ai-developer.jpg');
  expect(await page.locator('#route-structured-data').textContent()).toContain('BlogPosting');
  await page.goBack();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.getByRole('heading', { name: 'blog', level: 1 })).toBeVisible();

  for (const removedSlug of [
    'building-an-ai-booking-agent',
    'n8n-workflows-that-are-easier-to-operate',
    'full-stack-products-with-supabase',
  ]) {
    await page.goto(`/blog/${removedSlug}`);
    await expect(page.getByRole('heading', { name: 'This file is not in the workspace.', level: 1 })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  }

  expect(errors).toEqual([]);
});

test('Migo journey post is published with its image, content, SEO, refresh, and history behavior', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  const title = 'How Traveling Inspired Me to Build Migo';
  const imageAlt = 'Monochrome product mockup showing the Migo travel app on three smartphones surrounded by travel planning materials.';

  await page.goto('/');
  await expect(page.locator('#blog-preview').getByText(title, { exact: true })).toBeVisible();
  await expect(page.getByText('At 16, I started traveling solo and documenting my life along the way.', { exact: true })).toHaveCount(0);
  await page.locator('.desktop-sidebar').getByRole('link', { name: 'Blog', exact: true }).click();
  const card = page.getByRole('link', { name: `Open article: ${title}` });
  await expect(card).toBeVisible();
  await expect(card.getByText('July 2026', { exact: true })).toBeVisible();
  await expect(card.getByText('4 min read', { exact: true })).toBeVisible();
  await expect(card.getByText('Read', { exact: true })).toBeVisible();
  await expect(card.getByText('Draft', { exact: true })).toHaveCount(0);
  const thumbnail = card.getByRole('img', { name: imageAlt });
  await expect(thumbnail).toHaveAttribute('src', '/blog/how-traveling-inspired-me-to-build-migo.png');
  await expect(thumbnail).toHaveAttribute('loading', 'lazy');
  await expect.poll(() => thumbnail.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);

  await card.click();
  await expect(page).toHaveURL(/\/blog\/how-traveling-inspired-me-to-build-migo$/);
  await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
  await expect(page.getByText('Personal Journey', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('July 27, 2026', { exact: true })).toBeVisible();
  await expect(page.getByText('4 min read', { exact: true })).toBeVisible();
  await expect(page.getByText('Draft', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Back to Blog' })).toBeVisible();
  await expect(page.getByRole('img', { name: imageAlt })).toHaveAttribute('fetchpriority', 'high');
  await expect(page.locator('.article-body section')).toHaveCount(5);
  await expect(page.locator('.article-body li')).toHaveCount(7);
  await expect(page.locator('.article-body blockquote')).toHaveCount(2);
  await expect(page.getByText('What if travelers had one place to plan their trips, share their experiences, connect with others, and preserve their memories?', { exact: true })).toBeVisible();

  await expect(page).toHaveTitle('How Traveling Inspired Me to Build Migo | Dione Raze');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'At 16, Dione started traveling solo and documenting his life. Discover how exploring 20 Philippine provinces and six countries inspired him to build Migo.');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'How Traveling Inspired Me to Build Migo');
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', 'A personal story about solo travel, documenting memories, and building Migo as a digital travel companion.');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://dioneraze.com/blog/how-traveling-inspired-me-to-build-migo.png');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index, follow/);

  await page.reload();
  await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(card).toBeVisible();
  expect(errors).toEqual([]);
});

test('Migo journey article is responsive and readable across themes and requested widths', async ({ page }) => {
  test.setTimeout(120_000);
  const title = 'How Traveling Inspired Me to Build Migo';
  for (const width of [375, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark'] as const) {
      await page.goto('/blog/how-traveling-inspired-me-to-build-migo');
      await page.evaluate((selectedTheme) => localStorage.setItem('dione-theme', selectedTheme), theme);
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      const imageBox = await page.locator('.article-featured-image').boundingBox();
      expect(imageBox).not.toBeNull();
      expect(Math.abs((imageBox?.width ?? 0) / (imageBox?.height ?? 1) - 4 / 3)).toBeLessThan(0.03);
    }
  }
});

test('Migo journey article passes axe in light and dark themes', async ({ page }) => {
  for (const theme of ['light', 'dark'] as const) {
    await page.goto('/blog/how-traveling-inspired-me-to-build-migo');
    await page.evaluate((selectedTheme) => localStorage.setItem('dione-theme', selectedTheme), theme);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'How Traveling Inspired Me to Build Migo', level: 1 })).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});

test('published article remains readable in both themes at 375px and 390px', async ({ page }) => {
  test.setTimeout(120_000);
  for (const width of [375, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const theme of ['light', 'dark'] as const) {
      await page.goto('/blog/my-journey-to-ai-automation-developer');
      await page.evaluate((selectedTheme) => localStorage.setItem('dione-theme', selectedTheme), theme);
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.getByRole('heading', { name: 'My Journey From Computer Science Student to Self-Taught AI Automation Developer', level: 1 })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      const imageBox = await page.locator('.article-featured-image').boundingBox();
      expect(imageBox).not.toBeNull();
      expect(Math.abs((imageBox?.width ?? 0) / (imageBox?.height ?? 1) - 4 / 3)).toBeLessThan(0.03);
    }
  }
});

test('published article passes axe in light and dark themes', async ({ page }) => {
  for (const theme of ['light', 'dark'] as const) {
    await page.goto('/blog/my-journey-to-ai-automation-developer');
    await page.evaluate((selectedTheme) => localStorage.setItem('dione-theme', selectedTheme), theme);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.getByRole('heading', { name: 'My Journey From Computer Science Student to Self-Taught AI Automation Developer', level: 1 })).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});

test('gear and community routes remain truthful and usable', async ({ page }) => {
  const errors = collectConsoleErrors(page);

  await page.goto('/gear');
  await expect(page.getByRole('heading', { name: 'gear', level: 1 })).toBeVisible();
  await expect(page.getByText('MacBook Air M1')).toBeVisible();

  await page.goto('/community');
  await expect(page.getByRole('heading', { name: 'community', level: 1 })).toBeVisible();
  await expect(page.locator('.community-status').getByText(/Connected|Not configured|Connection error/)).toBeVisible();
  const unavailable = await page.getByText('Community temporarily unavailable').isVisible().catch(() => false);
  if (unavailable) await expect(page.getByText('No viewer count or messages have been fabricated.')).toBeVisible();
  else {
    const messageStream = page.locator('.message-stream');
    if (await messageStream.isVisible().catch(() => false)) await expect(messageStream).toBeVisible();
    else await expect(page.getByRole('heading', { name: /No messages yet|Community could not connect/ })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('sidebar and mobile shell switch at the 1024px content breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto('/');
  await expect(page.locator('.mobile-topbar')).toBeVisible();
  await expect(page.locator('.desktop-sidebar')).toBeHidden();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator('.desktop-sidebar')).toBeVisible();
  await expect(page.locator('.mobile-topbar')).toBeHidden();
});

test('dark theme passes axe', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('dione-theme', 'dark'));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
