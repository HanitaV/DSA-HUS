import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { VISUALIZER_REGISTRY } from '../js/visualizers/index.js';

test('every piece has a registered visualizer', () => {
    const data = JSON.parse(readFileSync(new URL('../data/pieces.json', import.meta.url), 'utf8'));
    const ids = data.pieces.map(p => p.id);
    assert.equal(ids.length, 104);
    assert.deepEqual(ids.filter(id => !(id in VISUALIZER_REGISTRY)), []);
    assert.deepEqual(Object.keys(VISUALIZER_REGISTRY).filter(id => !ids.includes(id)), []);
});
