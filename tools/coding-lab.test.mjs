import test from 'node:test';
import assert from 'node:assert/strict';
import { CHALLENGES, prepareUserCode, runChallengeTests } from '../js/coding-lab.js';

test('all coding lab challenges have valid starters and passing reference solutions', () => {
    const ids = Object.keys(CHALLENGES);
    assert.ok(ids.length >= 25, `Expected at least 25 coding challenges, got ${ids.length}`);

    for (const id of ids) {
        const ch = CHALLENGES[id];
        assert.ok(ch.tests && ch.tests.length >= 1, `${id} must have tests`);

        // Starter should transpile to valid JS syntax
        const starterJs = prepareUserCode(ch.starter);
        assert.doesNotThrow(() => new Function(starterJs), `${id} starter syntax error`);

        // Reference solution must pass every test case
        const res = runChallengeTests(ch, ch.solution);
        assert.equal(res.error, null, `${id} solution error: ${res.error}`);
        assert.equal(res.ok, true, `${id} solution failed tests: ${JSON.stringify(res.results.filter(r => !r.pass))}`);
    }
});
