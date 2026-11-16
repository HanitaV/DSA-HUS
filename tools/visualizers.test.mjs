import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { VISUALIZER_REGISTRY } from '../js/visualizers/index.js';

test('every DSA piece has a registered visualizer', () => {
    const data = JSON.parse(readFileSync(new URL('../data/pieces.json', import.meta.url), 'utf8'));
    const ids = data.pieces.map(p => p.id);
    // Các mảnh của khóa THCS4 (cb-) và OOP (oop-) là bài đọc có code mẫu, chưa có mô phỏng.
    const needsViz = ids.filter(id => !/^(cb|oop)-/.test(id));
    assert.equal(needsViz.length, 104);
    assert.deepEqual(needsViz.filter(id => !(id in VISUALIZER_REGISTRY)), []);
    assert.deepEqual(Object.keys(VISUALIZER_REGISTRY).filter(id => !ids.includes(id)), []);
});
