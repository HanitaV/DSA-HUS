import { test, expect } from '@playwright/test';

test('explore guide, smart lesson bar, syntax highlighting and interactive coding lab', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    // 1. Explore guide on index.html
    await page.goto('/');
    await expect(page.locator('#explore-guide')).toBeVisible();
    await expect(page.locator('#explore-guide')).toContainText('mảnh sẵn sàng học');
    await expect(page.locator('#explore-guide')).toContainText('bài thực hành Code đã giải');

    // 2. Lesson page with coding lab + math fold + syntax highlighting
    await page.goto('/lesson.html#piece=quick-sort');
    await expect(page.locator('#lesson-content h1')).toContainText('Sắp xếp nhanh');
    await expect(page.locator('.lesson-smart-bar')).toBeVisible();
    await expect(page.locator('#coding-lab')).toBeVisible();
    await expect(page.locator('.code-block .tok-kw').first()).toBeVisible();
    await expect(page.locator('.katex-error')).toHaveCount(0);

    // Math section starts folded in "Ưu tiên Code" mode, opens on "Đầy đủ cả Toán"
    const mathFold = page.locator('.math-fold').first();
    await expect(mathFold).not.toHaveAttribute('open', '');
    await page.locator('#mode-full-theory').click();
    await expect(mathFold).toHaveAttribute('open', '');
    await page.locator('#mode-code-first').click();
    await expect(mathFold).not.toHaveAttribute('open', '');

    // 3. Run starter (fails), then load solution & run tests (passes)
    await page.locator('#run-tests-btn').click();
    await expect(page.locator('#coding-results .coding-summary.fail')).toBeVisible();

    await page.locator('#solution-code-btn').click();
    await page.locator('#run-tests-btn').click();
    await expect(page.locator('#coding-results .coding-summary.pass')).toBeVisible();
    await expect(page.locator('#coding-status-badge')).toContainText('Đã vượt qua ✓');

    // 4. Reload preserves solved status & code draft, and index.html reflects solved count
    await page.reload();
    await expect(page.locator('#coding-status-badge')).toContainText('Đã vượt qua ✓');
    await page.goto('/');
    await expect(page.locator('#explore-guide')).toContainText('1/');

    // 5. Mobile viewport check (390px and 320px) without horizontal overflow
    for (const url of ['/', '/lesson.html#piece=quick-sort']) {
        await page.goto(url);
        for (const width of [390, 320]) {
            await page.setViewportSize({ width, height: 844 });
            const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
            expect(noOverflow, `overflow at ${width}px on ${url}`).toBeTruthy();
        }
    }

    // 6. Visual Call Stack for recursion & SVG tree for fibonacci
    await page.goto('/lesson.html#piece=recursion');
    await page.locator('#algorithm-animation .viz-btn', { hasText: 'Bước tiếp' }).click();
    await expect(page.locator('.viz-callstack .viz-frame')).toHaveCount(1);
    await expect(page.locator('#coding-lab')).toBeVisible();

    await page.goto('/lesson.html#piece=fibonacci');
    await page.locator('#algorithm-animation .viz-btn', { hasText: 'Bước tiếp' }).click();
    await expect(page.locator('.viz-tree-svg rect').first()).toBeVisible();

    expect(errors).toEqual([]);
});
