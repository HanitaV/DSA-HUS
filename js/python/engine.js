/**
 * ExecutionEngine abstraction for browser-based Python execution via Web Worker.
 * Decouples Pyodide / Worker lifecycle, timeouts, and cancellation from UI & visualizers.
 */

export const DEFAULT_EXEC_TIMEOUT_MS = 5000;
export const DEFAULT_TRACE_TIMEOUT_MS = 8000;

export class PyodideExecutionEngine {
    /**
     * @param {{ workerUrl?: URL | string, workerFactory?: () => Worker }} [options]
     */
    constructor(options = {}) {
        this._workerUrl = options.workerUrl || new URL('./pyodide-worker.js', import.meta.url);
        this._workerFactory = options.workerFactory || (() => new Worker(this._workerUrl));
        this._worker = null;
        this._ready = false;
        this._initPromise = null;
        this._reqId = 0;
        this._pending = new Map();
        this._activeTimer = null;
        this._activeReqId = null;
        this._status = 'idle'; // idle | loading | ready | running | error | terminated
        this._statusListeners = new Set();
        this._queue = Promise.resolve();
    }

    get status() {
        return this._status;
    }

    isReady() {
        return this._ready;
    }

    onStatusChange(listener) {
        this._statusListeners.add(listener);
        return () => this._statusListeners.delete(listener);
    }

    _setStatus(status, message = '') {
        this._status = status;
        for (const fn of this._statusListeners) {
            try {
                fn(status, message);
            } catch {
                // ignore listener errors
            }
        }
    }

    _ensureWorker() {
        if (this._worker) return this._worker;
        const worker = this._workerFactory();
        worker.onmessage = event => {
            const { id, type, data, status, message, error } = event.data || {};
            if (type === 'status') {
                this._setStatus(status, message);
                return;
            }
            if (id == null || !this._pending.has(id)) return;
            const entry = this._pending.get(id);
            this._pending.delete(id);
            if (this._activeReqId === id) {
                this._clearActiveTimer();
                this._activeReqId = null;
            }
            if (type === 'error') {
                entry.reject(new Error(error || 'Lỗi Web Worker Python'));
            } else if (type === 'init_ok') {
                entry.resolve({ ok: true });
            } else {
                entry.resolve(data);
            }
        };
        worker.onerror = err => {
            const msg = err?.message || 'Web Worker gặp sự cố không xác định.';
            this._setStatus('error', msg);
            for (const [, entry] of this._pending) {
                entry.reject(new Error(msg));
            }
            this._pending.clear();
            this._clearActiveTimer();
            this._resetWorkerState();
        };
        this._worker = worker;
        return worker;
    }

    _clearActiveTimer() {
        if (this._activeTimer != null) {
            clearTimeout(this._activeTimer);
            this._activeTimer = null;
        }
    }

    _resetWorkerState() {
        if (this._worker) {
            try {
                this._worker.terminate();
            } catch {
                // ignore
            }
        }
        this._worker = null;
        this._ready = false;
        this._initPromise = null;
        this._activeReqId = null;
    }

    async initialize() {
        if (this._ready && this._worker) return;
        if (this._initPromise) return this._initPromise;

        this._setStatus('loading', 'Đang tải Python (Pyodide WebAssembly)…');
        this._initPromise = (async () => {
            const worker = this._ensureWorker();
            const id = ++this._reqId;
            await new Promise((resolve, reject) => {
                this._pending.set(id, { resolve, reject });
                worker.postMessage({ id, type: 'init' });
            });
            this._ready = true;
            this._setStatus('ready', 'Python (Pyodide) đã sẵn sàng.');
        })().catch(err => {
            this._initPromise = null;
            if (this._status !== 'terminated') {
                this._setStatus('error', err.message || 'Không thể tải Pyodide.');
            }
            throw err;
        });

        return this._initPromise;
    }

    _enqueue(fn) {
        const next = this._queue.then(fn, fn);
        this._queue = next.catch(() => {});
        return next;
    }

    /**
     * Execute Python code (and optional challenge tests) inside the Web Worker.
     * @param {string} code
     * @param {{ timeoutMs?: number, tests?: Array, fnName?: string, inPlace?: boolean }} [options]
     * @returns {Promise<object>}
     */
    execute(code, options = {}) {
        return this._enqueue(() => this._runWorkerTask('execute', {
            code: String(code ?? ''),
            tests: options.tests || null,
            fnName: options.fnName || null,
            inPlace: Boolean(options.inPlace)
        }, options.timeoutMs ?? DEFAULT_EXEC_TIMEOUT_MS));
    }

    /**
     * Execute Python code with sys.settrace() instrumentation for step-by-step visualization.
     * @param {string} code
     * @param {{ timeoutMs?: number, maxSteps?: number, maxCollectionSize?: number, maxDepth?: number }} [options]
     * @returns {Promise<object>}
     */
    trace(code, options = {}) {
        return this._enqueue(() => this._runWorkerTask('trace', {
            code: String(code ?? ''),
            maxSteps: options.maxSteps ?? 250,
            maxCollectionSize: options.maxCollectionSize ?? 40,
            maxDepth: options.maxDepth ?? 4
        }, options.timeoutMs ?? DEFAULT_TRACE_TIMEOUT_MS, true));
    }

    async _runWorkerTask(type, payload, timeoutMs, isTrace = false) {
        const started = performance.now();
        try {
            await this.initialize();
        } catch (err) {
            return {
                ok: false,
                status: err.message === '__CANCELLED__' ? 'cancelled' : 'runtime_error',
                stdout: '',
                stderr: '',
                error: err.message === '__CANCELLED__'
                    ? 'Đã dừng thực thi theo yêu cầu người dùng.'
                    : `Không thể khởi tạo Pyodide: ${err.message}`,
                traceback: null,
                errorLine: null,
                durationMs: Math.round(performance.now() - started),
                results: [],
                steps: isTrace ? [] : undefined
            };
        }

        const worker = this._ensureWorker();
        const id = ++this._reqId;
        this._activeReqId = id;
        this._setStatus('running', isTrace ? 'Đang chạy & ghi lại từng bước…' : 'Đang chạy Python…');

        try {
            const result = await new Promise((resolve, reject) => {
                this._pending.set(id, { resolve, reject });
                if (timeoutMs > 0) {
                    this._activeTimer = setTimeout(() => {
                        if (!this._pending.has(id)) return;
                        this._pending.delete(id);
                        this._resetWorkerState();
                        this._setStatus('terminated', `Quá thời gian (${timeoutMs}ms) — đã dừng Worker.`);
                        reject(new Error('__TIMEOUT__'));
                    }, timeoutMs);
                }
                worker.postMessage({ id, type, payload });
            });

            if (this._ready) {
                this._setStatus('ready', 'Hoàn tất.');
            }
            return {
                ...result,
                durationMs: Math.round(performance.now() - started)
            };
        } catch (err) {
            const durationMs = Math.round(performance.now() - started);
            if (err.message === '__TIMEOUT__') {
                return {
                    ok: false,
                    status: 'timeout',
                    stdout: '',
                    stderr: '',
                    error: `Chương trình vượt quá giới hạn thời gian (${timeoutMs}ms) — có thể do vòng lặp vô hạn. Worker đã được khởi động lại an toàn.`,
                    traceback: null,
                    errorLine: null,
                    durationMs,
                    results: [],
                    steps: isTrace ? [] : undefined
                };
            }
            if (err.message === '__CANCELLED__') {
                return {
                    ok: false,
                    status: 'cancelled',
                    stdout: '',
                    stderr: '',
                    error: 'Đã dừng thực thi theo yêu cầu.',
                    traceback: null,
                    errorLine: null,
                    durationMs,
                    results: [],
                    steps: isTrace ? [] : undefined
                };
            }
            return {
                ok: false,
                status: 'runtime_error',
                stdout: '',
                stderr: '',
                error: err.message || 'Lỗi thực thi Python.',
                traceback: null,
                errorLine: null,
                durationMs,
                results: [],
                steps: isTrace ? [] : undefined
            };
        }
    }

    /**
     * Immediately terminate the Worker (e.g., user clicked Stop or navigated away).
     * Cleanly rejects any pending execution and resets state for lazy recovery.
     */
    terminate(reason = '__CANCELLED__') {
        this._clearActiveTimer();
        for (const [, entry] of this._pending) {
            entry.reject(new Error(reason));
        }
        this._pending.clear();
        this._resetWorkerState();
        this._setStatus('terminated', 'Đã dừng chương trình.');
    }
}

let sharedEngine = null;

export function getSharedPythonEngine() {
    if (!sharedEngine) {
        sharedEngine = new PyodideExecutionEngine();
    }
    return sharedEngine;
}
