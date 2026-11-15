import { test, expect } from '@playwright/test';

test('exploration, accentless search, graph selection and keyboard', async ({ page }) => {
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    await expect(page.locator('.graph-node')).toHaveCount(104);
    await expect(page.locator('#detail h2')).not.toBeEmpty();
    await page.locator('#search').fill('DE QUY');
    await expect(page.locator('#piece-list .list-item')).toHaveCount(2);
    await page.locator('#piece-list .list-item[href="#piece=recursion"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#detail h2')).toContainText('Đệ quy');
    await expect(page.locator('#detail')).toContainText('Có thể áp dụng trong');
    await page.locator('#search').fill('zzzzzzz');
    await expect(page.locator('#piece-list')).toContainText('Không tìm thấy');
    await expect(page.locator('.graph-node')).toHaveCount(0);
    await page.locator('#search').fill('');
    await page.locator('.graph-node[data-id="big-o"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#detail h2')).toContainText('O lớn');
    await page.locator('.skip-link').focus(); await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/piece=big-o/);
    expect(errors).toEqual([]);
});

test('course route, complete/uncomplete, recommendation and persistence across courses', async ({ page }) => {
    await page.goto('/#course=MAT3504&piece=algorithm-problem');
    await expect(page.locator('#course-overview')).toBeVisible();
    await expect(page.locator('#course-path .chapter')).toHaveCount(8);
    await page.locator('#mark-learned').click();
    await expect(page.locator('#mark-learned')).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.locator('#mark-learned')).toHaveAttribute('aria-pressed', 'true');
    await page.goto('/#course=MAT3514&piece=algorithm-problem');
    await expect(page.locator('#mark-learned')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#mark-learned').click();
    await expect(page.locator('#mark-learned')).toHaveAttribute('aria-pressed', 'false');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('hus.learned.v1')))).not.toContain('algorithm-problem');
});

test('lesson deep link, local math and return to course position', async ({ page }) => {
    await page.goto('/lesson.html#course=MAT3514&piece=big-o');
    await expect(page.locator('#lesson-content h1')).toContainText('O lớn');
    await expect(page.locator('#lesson-content')).toContainText('Tự kiểm tra');
    await expect(page.locator('#lesson-content .katex').first()).toBeVisible();
    await expect(page.locator('.katex-error')).toHaveCount(0);
    await expect(page.locator('#algorithm-animation')).toBeVisible();
    await page.locator('#mark-learned').click();
    await page.locator('#back-graph').click();
    await expect(page).toHaveURL(/course=MAT3514&piece=big-o/);
    await expect(page.locator('#mark-learned')).toHaveAttribute('aria-pressed', 'true');
});

test('blocked storage keeps current-session learning usable', async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage disabled'); } }));
    await page.goto('/#piece=big-o');
    await expect(page.locator('#storage-status')).toContainText('Không lưu được');
    await page.locator('#mark-learned').click();
    await expect(page.locator('#mark-learned')).toHaveAttribute('aria-pressed', 'true');
});

test('all lesson files and cited local PDFs are served', async ({ request }) => {
    const data = await (await request.get('/data/pieces.json')).json();
    const paths = [...new Set(data.pieces.flatMap(p => [p.lesson, ...p.sources.map(s => s.file)]))];
    for (const path of paths) expect((await request.get('/' + path.split('/').map(encodeURIComponent).join('/'))).ok(), path).toBeTruthy();
});

test('mobile layout, list access and reduced motion', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#piece=recursion');
    await expect(page.locator('#workspace-title')).toBeVisible();
    await expect(page.locator('#detail h2')).toContainText('Đệ quy');
    await page.locator('#sidebar-toggle').click();
    await expect(page.locator('#search')).toBeFocused();
    await page.locator('#search').fill('nhi phan');
    await expect(page.locator('#piece-list .list-item').first()).toBeVisible();
    for (const url of ['/#piece=recursion', '/lesson.html#course=MAT3514&piece=big-o']) {
        await page.goto(url);
        for (const width of [390, 320, 768, 1024]) {
            await page.setViewportSize({ width, height: 844 });
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width} on ${url}`).toBeTruthy();
        }
    }
});

test('titles avoid unrendered math or markdown markers', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.graph-node')).toHaveCount(104);
    const badTitles = await page.evaluate(() => [...document.querySelectorAll('#piece-list .list-item > span:nth-child(2), .graph-node > text:last-of-type')]
        .map(el => el.textContent.trim()).filter(t => /[$`]/.test(t)));
    expect(badTitles).toEqual([]);
});

test('invalid shared URLs fail gracefully and browser history restores selection', async ({ page }) => {
    await page.goto('/#piece=does-not-exist&course=INVALID');
    await expect(page.locator('#app-message')).toContainText('Không tìm thấy');
    await page.goto('/#piece=big-o');
    await page.goto('/#piece=recursion');
    await page.goBack();
    await expect(page.locator('#detail h2')).toContainText('O lớn');
    await page.goto('/lesson.html#piece=missing');
    await expect(page.locator('#lesson-content h1')).toContainText('Không tìm thấy');
});
