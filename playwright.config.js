import { defineConfig } from '@playwright/test';
export default defineConfig({
    testDir: './tools/browser-tests', workers: 1, fullyParallel: false,
    timeout: 30000, reporter: 'list',
    outputDir: '.cache/test-results',
    use: { baseURL: 'http://127.0.0.1:4173', channel: process.platform === 'win32' ? 'msedge' : undefined, headless: true, viewport: { width: 1440, height: 900 }, screenshot: 'only-on-failure' },
    webServer: { command: 'node tools/serve.mjs', url: 'http://127.0.0.1:4173', reuseExistingServer: true },
});
