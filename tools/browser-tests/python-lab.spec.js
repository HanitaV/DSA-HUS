import { test, expect } from '@playwright/test';

test.describe('Python (Pyodide) browser integration', () => {
    test.setTimeout(90000);

    test('executes real Python, handles errors/stop/recovery, and traces into visualizer', async ({ page }) => {
        const pageErrors = [];
        page.on('pageerror', err => pageErrors.push(err.message));

        // 1. Open bubble-sort lesson and switch to Python (Pyodide)
        await page.goto('/lesson.html#piece=bubble-sort');
        await expect(page.locator('#lang-python-btn')).toBeVisible();
        await page.locator('#lang-python-btn').click();
        await expect(page.locator('#py-runtime-status')).toBeVisible();

        // 2. Run basic print, arithmetic, collections, loops, recursion
        const editor = page.locator('#coding-editor');
        await editor.fill([
            'print("Hello World")',
            'nums = [3, 1, 2]',
            't = (1, 2)',
            's = {1, 2, 2}',
            'd = {"a": 10}',
            'def fact(n):',
            '    return 1 if n <= 1 else n * fact(n - 1)',
            'print(2 + 3 * 4, sorted(nums), len(s), d["a"], fact(5))'
        ].join('\n'));
        await page.locator('#run-python-btn').click();

        await expect(page.locator('.py-stdout')).toContainText('Hello World', { timeout: 60000 });
        await expect(page.locator('.py-stdout')).toContainText('14 [1, 2, 3] 2 10 120');

        // 3. Syntax error & runtime exception
        await editor.fill('def broken(:\n    pass');
        await page.locator('#run-python-btn').click();
        await expect(page.locator('.coding-error')).toContainText('SyntaxError');

        await editor.fill('x = 1 / 0');
        await page.locator('#run-python-btn').click();
        await expect(page.locator('.coding-error')).toContainText('ZeroDivisionError');

        // 4. Infinite loop -> Stop button -> clean Worker recovery
        await editor.fill('while True:\n    pass');
        await page.locator('#run-python-btn').click();
        const stopBtn = page.locator('#stop-python-btn');
        await expect(stopBtn).toBeEnabled({ timeout: 5000 });
        await stopBtn.click();
        await expect(page.locator('.coding-error')).toContainText('Đã dừng');

        // Recover and run Python solution for bubble-sort tests
        await page.locator('#solution-code-btn').click();
        await page.locator('#run-tests-btn').click();
        await expect(page.locator('#coding-results .coding-summary.pass')).toBeVisible({ timeout: 60000 });

        // 5. Trace execution & step through visualizer
        await page.locator('#trace-python-btn').click();
        const traceHost = page.locator('#python-trace-host');
        await expect(traceHost).toBeVisible({ timeout: 20000 });
        await expect(traceHost.locator('.viz-step-counter')).toContainText('Bước 1/');
        await traceHost.locator('.viz-btn', { hasText: 'Bước tiếp' }).click();
        await traceHost.locator('.viz-btn', { hasText: 'Bước tiếp' }).click();
        await traceHost.locator('.viz-btn', { hasText: 'Bước tiếp' }).click();
        await expect(traceHost.locator('.viz-step-counter')).toContainText('Bước 4/');
        await expect(traceHost.locator('.py-vars-table')).toBeVisible();
        await expect(traceHost.locator('.viz-bars')).toBeVisible();

        // 6. Non-challenge algorithm lesson shows Python Playground
        await page.goto('/lesson.html#piece=algorithm-problem');
        await expect(page.locator('#coding-lab')).toBeVisible();
        await expect(page.locator('#run-python-btn')).toBeVisible();

        // 7. Mobile viewport check (390px and 320px) without horizontal overflow
        await page.goto('/lesson.html#piece=bubble-sort');
        await page.locator('#lang-python-btn').click();
        for (const width of [390, 320]) {
            await page.setViewportSize({ width, height: 844 });
            const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
            expect(noOverflow, `overflow at ${width}px`).toBeTruthy();
        }

        expect(pageErrors).toEqual([]);
    });
});
