import test from 'node:test';
import assert from 'node:assert/strict';
import { PyodideExecutionEngine } from '../js/python/engine.js';
import { CHALLENGES } from '../js/coding-lab.js';
import { PYTHON_CHALLENGES } from '../js/python/challenges.js';

function createMockWorker(shouldHang = () => false) {
    return {
        terminated: false,
        onmessage: null,
        onerror: null,
        postMessage(msg) {
            setTimeout(() => {
                if (this.terminated || !this.onmessage) return;
                if (msg.type === 'init') {
                    this.onmessage({ data: { id: msg.id, type: 'init_ok' } });
                } else if (msg.type === 'execute') {
                    if (shouldHang()) return;
                    this.onmessage({
                        data: {
                            id: msg.id,
                            type: 'result',
                            data: {
                                ok: true,
                                status: 'completed',
                                stdout: 'Hello World\n',
                                stderr: '',
                                error: null,
                                traceback: null,
                                errorLine: null,
                                results: []
                            }
                        }
                    });
                } else if (msg.type === 'trace') {
                    this.onmessage({
                        data: {
                            id: msg.id,
                            type: 'result',
                            data: {
                                ok: true,
                                status: 'completed',
                                stdout: '',
                                stderr: '',
                                error: null,
                                traceback: null,
                                errorLine: null,
                                truncated: false,
                                truncationReason: null,
                                steps: [
                                    { stepIndex: 0, line: 1, event: 'line', func: '<module>', locals: { x: 1 }, callStack: [], events: [], primaryList: null }
                                ]
                            }
                        }
                    });
                }
            }, 10);
        },
        terminate() {
            this.terminated = true;
        }
    };
}

test('PyodideExecutionEngine handles lazy init, execute, trace, timeout, and recovery', async () => {
    let spawned = 0;
    let hang = false;
    const workers = [];
    const engine = new PyodideExecutionEngine({
        workerFactory: () => {
            spawned++;
            const w = createMockWorker(() => hang);
            workers.push(w);
            return w;
        }
    });

    assert.equal(engine.isReady(), false);
    const res1 = await engine.execute('print("Hello World")');
    assert.equal(res1.ok, true);
    assert.equal(res1.stdout, 'Hello World\n');
    assert.equal(spawned, 1);

    const tr = await engine.trace('x = 1');
    assert.equal(tr.ok, true);
    assert.equal(tr.steps.length, 1);
    assert.equal(spawned, 1);

    // Timeout terminates worker and recovers on next run
    hang = true;
    const timedOut = await engine.execute('while True: pass', { timeoutMs: 40 });
    assert.equal(timedOut.ok, false);
    assert.equal(timedOut.status, 'timeout');
    assert.equal(workers[0].terminated, true);
    assert.equal(engine.isReady(), false);

    hang = false;
    const recovered = await engine.execute('print("recovered")');
    assert.equal(recovered.ok, true);
    assert.equal(spawned, 2);
});

test('PyodideExecutionEngine terminate() cancels in-flight execution cleanly', async () => {
    const engine = new PyodideExecutionEngine({
        workerFactory: () => createMockWorker(() => true)
    });
    const promise = engine.execute('while True: pass', { timeoutMs: 5000 });
    setTimeout(() => engine.terminate(), 25);
    const res = await promise;
    assert.equal(res.ok, false);
    assert.equal(res.status, 'cancelled');
});

test('every coding lab challenge has a matching Python starter and solution', () => {
    for (const id of Object.keys(CHALLENGES)) {
        const py = PYTHON_CHALLENGES[id];
        assert.ok(py, `Missing PYTHON_CHALLENGES entry for ${id}`);
        assert.ok(py.fnName, `${id} missing py.fnName`);
        assert.ok(py.starter.includes(`def ${py.fnName}`), `${id} starter must define ${py.fnName}`);
        assert.ok(py.solution.includes(`def ${py.fnName}`), `${id} solution must define ${py.fnName}`);
    }
});
