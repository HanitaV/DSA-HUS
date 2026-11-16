import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const PIECES_DATA = JSON.parse(readFileSync(new URL('../../data/pieces.json', import.meta.url), 'utf8'));
const TOTAL_COUNT = PIECES_DATA.pieces.length;
const CORE_COUNT = PIECES_DATA.pieces.filter((p) => p.type !== 'example' && p.type !== 'exercise').length;

test('exploration, accentless search, graph selection and keyboard', async ({ page }) => {
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    await page.locator('#track-all').click();
    await expect(page.locator('.graph-node')).toHaveCount(CORE_COUNT);
    await expect(page.locator('#detail')).toBeHidden();
    await page.locator('#search').fill('DE QUY');
    await expect(page.locator('#piece-list .list-item')).toHaveCount(3);
    await page.locator('#piece-list .list-item[href^="#piece=recursion&"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#detail')).toBeVisible();
    await expect(page.locator('#detail h2')).toContainText('Đệ quy');
    await expect(page.locator('#detail')).toContainText('Có thể áp dụng trong');
    await page.locator('#close-detail').click();
    await expect(page.locator('#detail')).toBeHidden();
    await page.locator('#search').fill('zzzzzzz');
    await expect(page.locator('#piece-list')).toContainText('Không tìm thấy');
    await expect(page.locator('.graph-node')).toHaveCount(0);
    await page.locator('#search').fill('');
    await expect(page.locator('.graph-node')).toHaveCount(CORE_COUNT);
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

test('all lesson files are served and contain no PDF links', async ({ request }) => {
    const data = await (await request.get('/data/pieces.json')).json();
    const paths = [...new Set(data.pieces.flatMap(p => [p.lesson]))];
    for (const path of paths) {
        const res = await request.get('/' + path.split('/').map(encodeURIComponent).join('/'));
        expect(res.ok(), path).toBeTruthy();
        expect(await res.text(), path).not.toMatch(/\.pdf|DOCUMENTS\.md/i);
    }
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
    await page.locator('#track-all').click();
    await expect(page.locator('.graph-node')).toHaveCount(CORE_COUNT);
    await page.locator('#filter-toggle').click();
    await page.locator('#toggle-examples').check();
    await expect(page.locator('.graph-node')).toHaveCount(TOTAL_COUNT);
    const badTitles = await page.evaluate(() => [...document.querySelectorAll('#piece-list .list-item .list-item-title, .graph-node .node-title')]
        .map(el => el.textContent.trim()).filter(t => /[$`]/.test(t)));
    expect(badTitles).toEqual([]);
});

test('collapsible sidebar, filter bar, DAG direction, edge toggles, examples and minimap', async ({ page }) => {
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    await page.locator('#track-all').click();
    await expect(page.locator('#minimap .minimap-node')).toHaveCount(CORE_COUNT);
    await expect(page.locator('#minimap .minimap-viewport')).toBeVisible();

    await page.locator('#collapse-sidebar').click();
    await expect(page.locator('#sidebar')).toBeHidden();
    await expect(page.locator('#reopen-sidebar')).toBeVisible();
    await page.locator('#reopen-sidebar').click();
    await expect(page.locator('#sidebar')).toBeVisible();
    await expect(page.locator('#search')).toBeFocused();

    await page.locator('#filter-toggle').click();
    await expect(page.locator('#filter-bar')).toBeVisible();
    await page.locator('#layout-dir').selectOption('TB');
    await expect(page.locator('#graph-count')).toContainText('từ trên xuống');

    await expect(page.locator('.edge.applies').first()).toBeHidden();
    await page.locator('#rel-applies').check();
    await expect(page.locator('.edge.applies').first()).toBeVisible();

    await page.locator('#toggle-examples').check();
    await expect(page.locator('.graph-node')).toHaveCount(TOTAL_COUNT);

    await page.goto('/#piece=bubble-sort');
    await expect(page.locator('#detail')).toContainText('Ví dụ & bài tập liên quan');
    expect(errors).toEqual([]);
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

test('touchpad two-finger swipe, pinch zoom and node-surface dragging', async ({ page }) => {
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    await page.locator('#track-all').click();
    const svg = page.locator('#graph svg');
    const getView = () => svg.getAttribute('viewBox').then(v => v.split(' ').map(Number));
    const initial = await getView();

    // Two-finger touchpad pan (fractional / horizontal wheel deltas)
    const box = await svg.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.evaluate(() => {
      const target = document.querySelector('#graph svg');
      target.dispatchEvent(new WheelEvent('wheel', { deltaX: 28.5, deltaY: -14.2, deltaMode: 0, bubbles: true, cancelable: true }));
    });
    const panned = await getView();
    expect(panned[0]).toBeGreaterThan(initial[0]);
    expect(panned[1]).toBeLessThan(initial[1]);
    expect(Math.abs(panned[2] - initial[2])).toBeLessThan(0.5);

    // Trackpad pinch-to-zoom (ctrlKey + pixel wheel delta)
    await page.evaluate(() => {
      const target = document.querySelector('#graph svg');
      target.dispatchEvent(new WheelEvent('wheel', { deltaY: -40, ctrlKey: true, deltaMode: 0, bubbles: true, cancelable: true, clientX: 600, clientY: 450 }));
    });
    const zoomed = await getView();
    expect(zoomed[2]).toBeLessThan(panned[2]);

    // Dragging starting directly on a card pans without triggering node selection
    const nodeBox = await page.locator('.graph-node[data-id="big-o"]').boundingBox();
    const nx = nodeBox.x + nodeBox.width / 2;
    const ny = nodeBox.y + nodeBox.height / 2;
    await page.mouse.move(nx, ny);
    await page.mouse.down();
    await page.mouse.move(nx + 36, ny + 24, { steps: 4 });
    await page.mouse.up();
    await expect(page.locator('#detail')).toBeHidden();
    const dragged = await getView();
    expect(dragged[0]).toBeLessThan(zoomed[0]);

    // Short click selects card normally
    await page.locator('.graph-node[data-id="big-o"]').click();
    await expect(page.locator('#detail')).toBeVisible();
    await expect(page.locator('#detail h2')).toContainText('O lớn');
    expect(errors).toEqual([]);
});

test('tracks are separated and no PDF links are rendered', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#track-algorithm')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.graph-node.track-math')).toHaveCount(0);
    await page.locator('#track-math').click();
    await expect(page.locator('.graph-node:not(.track-math)')).toHaveCount(0);
    await page.goto('/#piece=quick-sort');
    await expect(page.locator('a[href*="pdf"], a[href*="DOCUMENTS"]')).toHaveCount(0);
});

test('new courses THCS4 and OOP render chapters and lessons', async ({ page }) => {
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#course=THCS4');
    await expect(page.locator('#course-overview')).toBeVisible();
    await expect(page.locator('#course-path .chapter')).toHaveCount(8);

    await page.goto('/#course=OOP');
    await expect(page.locator('#course-overview')).toBeVisible();
    await expect(page.locator('#course-path .chapter')).toHaveCount(11);

    await page.goto('/lesson.html#course=THCS4&piece=cb-primitive-types-variables');
    await expect(page.locator('#lesson-content h1')).toContainText('Kiểu dữ liệu nguyên thủy');
    await expect(page.locator('#algorithm-animation .viz-controls')).toBeVisible();
    await expect(page.locator('.katex-error')).toHaveCount(0);

    await page.goto('/lesson.html#course=OOP&piece=oop-design-patterns-intro');
    await expect(page.locator('#lesson-content h1')).toContainText('Mẫu thiết kế');
    await expect(page.locator('#algorithm-animation .viz-controls')).toBeVisible();
    await expect(page.locator('.katex-error')).toHaveCount(0);
    expect(errors).toEqual([]);
});

test('visualizers run on every lesson without errors', async ({ page, request }) => {
    test.setTimeout(600000);
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    const data = await (await request.get('/data/pieces.json')).json();
    for (const p of data.pieces) {
        await page.goto('/lesson.html#piece=' + p.id);
        await expect(page.locator('#algorithm-animation .viz-controls'), p.id).toBeVisible();
        await page.locator('#algorithm-animation .viz-btn', { hasText: 'Bước tiếp' }).click();
        await expect(page.locator('.katex-error'), p.id).toHaveCount(0);
        await expect(page.locator('#lesson-content a[href*=".pdf"]'), p.id).toHaveCount(0);
    }
    expect(errors).toEqual([]);
});
