import { test, expect } from '@playwright/test';

test('education shell, dark mode toggle persistence, and code editor contrast', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    // 1. Streamlined workspace on index.html (graph-first, no redundant dashboard hero)
    await page.goto('/');
    await expect(page.locator('#study-dashboard')).toHaveCount(0);
    await expect(page.locator('.study-process')).toHaveCount(0);
    await expect(page.locator('#track-switch')).toBeVisible();
    await expect(page.locator('#explore-guide')).toBeVisible();
    await expect(page.locator('.graph-panel')).toBeVisible();

    // 2. Toggle dark mode on index.html and verify persistence & readable contrast
    const toggle = page.locator('#theme-toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    const darkColors = await page.evaluate(() => ({
        bodyBg: getComputedStyle(document.body).backgroundColor,
        listItemColor: getComputedStyle(document.querySelector('#piece-list .list-item')).color,
        legendColor: getComputedStyle(document.querySelector('.legend-strip')).color,
    }));
    expect(darkColors.bodyBg).toBe('rgb(11, 17, 32)');
    expect(darkColors.listItemColor).toBe('rgb(203, 213, 225)');
    expect(darkColors.legendColor).toBe('rgb(148, 163, 184)');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // 3. Navigate to lesson.html and verify dark mode persists + single smart bar renders (no duplicate roadmap)
    await page.goto('/lesson.html#piece=quick-sort');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('.lesson-smart-bar')).toBeVisible();
    await expect(page.locator('#lesson-roadmap')).toHaveCount(0);
    await expect(page.locator('.reading-progress')).toBeAttached();

    // 4. Verify interactive code editor (.ce-highlight) has transparent bg (not light-gray <pre>) and crisp contrast
    const editorStyles = await page.evaluate(() => {
        const shell = document.querySelector('.ce-shell');
        const highlight = document.querySelector('.ce-highlight');
        const toolbarCode = document.querySelector('.coding-toolbar code');
        const codeBlockPre = document.querySelector('.code-block pre');
        return {
            shellBg: shell ? getComputedStyle(shell).backgroundColor : null,
            highlightBg: highlight ? getComputedStyle(highlight).backgroundColor : null,
            highlightBorder: highlight ? getComputedStyle(highlight).borderTopWidth : null,
            highlightColor: highlight ? getComputedStyle(highlight).color : null,
            toolbarCodeBg: toolbarCode ? getComputedStyle(toolbarCode).backgroundColor : null,
            codeBlockPreBg: codeBlockPre ? getComputedStyle(codeBlockPre).backgroundColor : null,
            codeBlockPreColor: codeBlockPre ? getComputedStyle(codeBlockPre).color : null
        };
    });

    expect(editorStyles.shellBg).toBe('rgb(15, 23, 42)');
    expect(editorStyles.highlightBg).toBe('rgba(0, 0, 0, 0)');
    expect(editorStyles.highlightBorder).toBe('0px');
    expect(editorStyles.highlightColor).toBe('rgb(226, 232, 240)');
    expect(editorStyles.toolbarCodeBg).not.toBe('rgb(233, 236, 242)');
    expect(editorStyles.codeBlockPreBg).toBe('rgb(13, 21, 38)');
    expect(editorStyles.codeBlockPreColor).toBe('rgb(226, 232, 240)');

    // 4b. Verify dynamic-programming table rows & visualizer boxes are dark in dark mode (no white-on-white)
    await page.goto('/lesson.html#piece=dynamic-programming');
    await expect(page.locator('#lesson-content h1')).toContainText('Quy hoạch động');
    await expect(page.locator('.viz-step-log')).toBeVisible();
    const dpColors = await page.evaluate(() => {
        const evenTd = document.querySelector('.table-wrap tbody tr:nth-child(even) td');
        const stepLog = document.querySelector('.viz-step-log');
        const controls = document.querySelector('.viz-controls');
        return {
            evenTdBg: evenTd ? getComputedStyle(evenTd).backgroundColor : null,
            evenTdColor: evenTd ? getComputedStyle(evenTd).color : null,
            stepLogBg: stepLog ? getComputedStyle(stepLog).backgroundColor : null,
            controlsBg: controls ? getComputedStyle(controls).backgroundColor : null
        };
    });
    expect(dpColors.evenTdBg).toBe('rgb(21, 32, 54)');
    expect(dpColors.evenTdColor).toBe('rgb(230, 237, 247)');
    expect(dpColors.stepLogBg).toBe('rgb(21, 33, 59)');
    expect(dpColors.controlsBg).toBe('rgb(19, 28, 49)');

    // 5. Switch back to light mode and verify .ce-highlight stays transparent and .code-block switches to light
    await page.goto('/lesson.html#piece=quick-sort');
    await expect(page.locator('#lesson-content h1')).toContainText('Sắp xếp nhanh');
    await expect(page.locator('.ce-highlight')).toBeVisible();
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    const lightStyles = await page.evaluate(() => ({
        highlightBg: getComputedStyle(document.querySelector('.ce-highlight')).backgroundColor,
        codeBlockPreBg: getComputedStyle(document.querySelector('.code-block pre')).backgroundColor
    }));
    expect(lightStyles.highlightBg).toBe('rgba(0, 0, 0, 0)');
    expect(lightStyles.codeBlockPreBg).toBe('rgb(248, 250, 253)');

    // 6. Mobile viewport check (390px) without horizontal overflow
    await page.setViewportSize({ width: 390, height: 844 });
    for (const url of ['/', '/lesson.html#piece=quick-sort']) {
        await page.goto(url);
        const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
        expect(noOverflow, `overflow at 390px on ${url}`).toBeTruthy();
    }

    expect(errors).toEqual([]);
});
