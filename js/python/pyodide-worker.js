/* global importScripts, loadPyodide */
/**
 * Dedicated Web Worker for browser-based Python execution via Pyodide (WebAssembly).
 * Runs 100% client-side with no SharedArrayBuffer or backend requirement.
 * Untrusted user code executes inside this Worker sandbox; infinite loops are
 * interrupted by terminating and recreating the Worker from the main thread.
 */

const PYODIDE_VERSION = '0.27.5';
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodide = null;
let initPromise = null;

const PYTHON_RUNTIME_BOOTSTRAP = `
import io
import json
import math
import sys
import traceback

class _HusTraceLimit(Exception):
    pass

def _hus_safe_serialize(val, depth=0, max_depth=4, max_items=40, seen=None):
    if seen is None:
        seen = set()
    if val is None or isinstance(val, (bool, int, str)):
        if isinstance(val, str) and len(val) > 200:
            return val[:197] + '...'
        if isinstance(val, int) and not isinstance(val, bool) and abs(val) > 10**15:
            return str(val)
        return val
    if isinstance(val, float):
        if math.isnan(val):
            return {'__type': 'float', 'repr': 'nan'}
        if math.isinf(val):
            return {'__type': 'float', 'repr': 'inf' if val > 0 else '-inf'}
        return val

    obj_id = id(val)
    if obj_id in seen:
        return {'__type': 'circular', 'repr': f'<circular {type(val).__name__}>'}
    if depth >= max_depth:
        try:
            r = repr(val)
        except Exception:
            r = f'<{type(val).__name__}>'
        if len(r) > 80:
            r = r[:77] + '...'
        return {'__type': type(val).__name__, 'repr': r, 'truncated': True}

    seen.add(obj_id)
    try:
        if isinstance(val, (list, tuple)):
            items = []
            truncated = len(val) > max_items
            for x in list(val)[:max_items]:
                items.append(_hus_safe_serialize(x, depth + 1, max_depth, max_items, seen))
            return {
                '__type': type(val).__name__,
                'length': len(val),
                'items': items,
                'truncated': truncated
            }
        if isinstance(val, set):
            raw = list(val)
            truncated = len(raw) > max_items
            items = [_hus_safe_serialize(x, depth + 1, max_depth, max_items, seen) for x in raw[:max_items]]
            return {
                '__type': 'set',
                'length': len(raw),
                'items': items,
                'truncated': truncated
            }
        if isinstance(val, dict):
            entries = []
            keys = list(val.keys())
            truncated = len(keys) > max_items
            for k in keys[:max_items]:
                entries.append([
                    _hus_safe_serialize(k, depth + 1, max_depth, max_items, seen),
                    _hus_safe_serialize(val[k], depth + 1, max_depth, max_items, seen)
                ])
            return {
                '__type': 'dict',
                'length': len(keys),
                'entries': entries,
                'truncated': truncated
            }
        try:
            r = repr(val)
        except Exception:
            r = f'<{type(val).__name__}>'
        if len(r) > 120:
            r = r[:117] + '...'
        return {'__type': type(val).__name__, 'repr': r}
    finally:
        seen.discard(obj_id)

def _hus_to_jsonable(val):
    if val is None or isinstance(val, (bool, int, str)):
        return val
    if isinstance(val, float):
        if math.isinf(val):
            return '__INF__' if val > 0 else '__NEG_INF__'
        if math.isnan(val):
            return '__NAN__'
        return val
    if isinstance(val, (list, tuple)):
        return [_hus_to_jsonable(x) for x in val]
    if isinstance(val, set):
        return [_hus_to_jsonable(x) for x in val]
    if isinstance(val, dict):
        return {str(k): _hus_to_jsonable(v) for k, v in val.items()}
    return repr(val)

def _hus_from_jsonable(val):
    if isinstance(val, list):
        return [_hus_from_jsonable(x) for x in val]
    if isinstance(val, dict):
        return {k: _hus_from_jsonable(v) for k, v in val.items()}
    if val == '__INF__':
        return float('inf')
    if val == '__NEG_INF__':
        return float('-inf')
    return val

def _hus_extract_error(exc):
    tb_lines = traceback.format_exception(type(exc), exc, exc.__traceback__)
    tb_text = ''.join(tb_lines)
    err_line = None
    if isinstance(exc, SyntaxError):
        err_line = exc.lineno
    else:
        tb = exc.__traceback__
        while tb is not None:
            if tb.tb_frame.f_code.co_filename == '<user_code>':
                err_line = tb.tb_lineno
            tb = tb.tb_next
    return {
        'error': f'{type(exc).__name__}: {exc}',
        'traceback': tb_text,
        'errorLine': err_line,
        'status': 'syntax_error' if isinstance(exc, SyntaxError) else 'runtime_error'
    }

class _HusVizCollector:
    def __init__(self):
        self._events = []

    def compare(self, i, j):
        self._events.append({'type': 'compare', 'indices': [int(i), int(j)], 'inferred': False})

    def swap(self, i, j):
        self._events.append({'type': 'swap', 'indices': [int(i), int(j)], 'inferred': False})

    def visit(self, node):
        self._events.append({'type': 'visit', 'node': node, 'inferred': False})

    def push(self, value):
        self._events.append({'type': 'push', 'value': _hus_to_jsonable(value), 'inferred': False})

    def pop(self):
        self._events.append({'type': 'pop', 'inferred': False})

    def mark(self, index, state='active'):
        self._events.append({'type': 'mark', 'index': int(index), 'state': str(state), 'inferred': False})

    def update(self, target, value):
        self._events.append({'type': 'update', 'target': str(target), 'value': _hus_to_jsonable(value), 'inferred': False})

    def drain(self):
        ev = self._events[:]
        self._events.clear()
        return ev

def _hus_exec(code_str, tests_json=None, fn_name=None, in_place=False):
    stdout_buf = io.StringIO()
    stderr_buf = io.StringIO()
    old_out, old_err = sys.stdout, sys.stderr
    sys.stdout, sys.stderr = stdout_buf, stderr_buf
    viz = _HusVizCollector()
    ns = {'__name__': '__main__', 'viz': viz}
    try:
        compiled = compile(code_str, '<user_code>', 'exec')
        exec(compiled, ns, ns)
    except Exception as exc:
        sys.stdout, sys.stderr = old_out, old_err
        info = _hus_extract_error(exc)
        return json.dumps({
            'ok': False,
            'status': info['status'],
            'stdout': stdout_buf.getvalue(),
            'stderr': stderr_buf.getvalue(),
            'error': info['error'],
            'traceback': info['traceback'],
            'errorLine': info['errorLine'],
            'results': []
        })

    if not tests_json or not fn_name:
        sys.stdout, sys.stderr = old_out, old_err
        return json.dumps({
            'ok': True,
            'status': 'completed',
            'stdout': stdout_buf.getvalue(),
            'stderr': stderr_buf.getvalue(),
            'error': None,
            'traceback': None,
            'errorLine': None,
            'results': []
        })

    fn = ns.get(fn_name)
    if not callable(fn):
        sys.stdout, sys.stderr = old_out, old_err
        return json.dumps({
            'ok': False,
            'status': 'runtime_error',
            'stdout': stdout_buf.getvalue(),
            'stderr': stderr_buf.getvalue(),
            'error': f'Không tìm thấy hàm "{fn_name}". Hãy giữ nguyên tên hàm trong khung code.',
            'traceback': None,
            'errorLine': None,
            'results': []
        })

    tests = json.loads(tests_json)
    results = []
    try:
        for idx, tc in enumerate(tests):
            tc_name = tc.get('name') or f'Test {idx + 1}'
            args = _hus_from_jsonable(tc.get('args', []))
            expected = _hus_from_jsonable(tc.get('expected'))
            try:
                raw_res = fn(*args)
                actual = args[0] if in_place else raw_res
                passed = actual == expected
                results.append({
                    'name': tc_name,
                    'pass': bool(passed),
                    'input': ', '.join(json.dumps(_hus_to_jsonable(a), ensure_ascii=False) for a in tc.get('args', [])),
                    'expected': json.dumps(_hus_to_jsonable(expected), ensure_ascii=False),
                    'actual': json.dumps(_hus_to_jsonable(actual), ensure_ascii=False),
                    'error': None
                })
            except Exception as tc_exc:
                results.append({
                    'name': tc_name,
                    'pass': False,
                    'input': ', '.join(json.dumps(_hus_to_jsonable(a), ensure_ascii=False) for a in tc.get('args', [])),
                    'expected': json.dumps(_hus_to_jsonable(expected), ensure_ascii=False),
                    'actual': 'Lỗi khi chạy',
                    'error': f'{type(tc_exc).__name__}: {tc_exc}'
                })
    finally:
        sys.stdout, sys.stderr = old_out, old_err

    return json.dumps({
        'ok': all(r['pass'] for r in results),
        'status': 'completed',
        'stdout': stdout_buf.getvalue(),
        'stderr': stderr_buf.getvalue(),
        'error': None,
        'traceback': None,
        'errorLine': None,
        'results': results
    })

def _hus_trace(code_str, max_steps=250, max_collection=40, max_depth=4):
    stdout_buf = io.StringIO()
    stderr_buf = io.StringIO()
    old_out, old_err = sys.stdout, sys.stderr
    sys.stdout, sys.stderr = stdout_buf, stderr_buf
    viz = _HusVizCollector()
    ns = {'__name__': '__main__', 'viz': viz}
    steps = []
    truncated = False
    truncation_reason = None
    prev_lists = {}

    def _is_num_list(v):
        return isinstance(v, list) and len(v) <= max_collection and all(isinstance(x, (int, float)) and not isinstance(x, bool) for x in v)

    def _infer_list_events(cur_locals):
        events = []
        primary = None
        for k, v in cur_locals.items():
            if _is_num_list(v):
                highlights = {}
                if k in prev_lists and len(prev_lists[k]) == len(v):
                    changed = [i for i in range(len(v)) if prev_lists[k][i] != v[i]]
                    if len(changed) == 2 and prev_lists[k][changed[0]] == v[changed[1]] and prev_lists[k][changed[1]] == v[changed[0]]:
                        events.append({'type': 'swap', 'target': k, 'indices': changed, 'inferred': True})
                        highlights[changed[0]] = 'swap'
                        highlights[changed[1]] = 'swap'
                    else:
                        for idx in changed:
                            events.append({'type': 'update', 'target': f'{k}[{idx}]', 'value': v[idx], 'inferred': True})
                            highlights[idx] = 'active'
                prev_lists[k] = v[:]
                if primary is None:
                    primary = {'name': k, 'values': v[:], 'highlights': highlights}
        return events, primary

    def _capture_locals(frame):
        out = {}
        raw = {}
        for k, v in frame.f_locals.items():
            if k.startswith('_') or k == 'viz':
                continue
            if callable(v) or type(v).__name__ == 'module':
                continue
            raw[k] = v
            out[k] = _hus_safe_serialize(v, 0, max_depth, max_collection)
        return out, raw

    def _capture_stack(frame):
        stack = []
        f = frame
        while f is not None:
            if f.f_code.co_filename == '<user_code>':
                fname = '<module>' if f.f_code.co_name == '<module>' else f.f_code.co_name
                arg_names = f.f_code.co_varnames[:f.f_code.co_argcount]
                args_parts = []
                for an in arg_names:
                    if an in f.f_locals:
                        sv = _hus_safe_serialize(f.f_locals[an], 0, 1, 8)
                        args_parts.append(f'{an}={sv.get("repr", sv) if isinstance(sv, dict) else repr(sv)}')
                stack.append({
                    'func': fname,
                    'line': f.f_lineno,
                    'argsSummary': ', '.join(args_parts[:4])
                })
            f = f.f_back
        stack.reverse()
        return stack

    def tracer(frame, event, arg):
        nonlocal truncated, truncation_reason
        if frame.f_code.co_filename != '<user_code>':
            return None
        if event not in ('line', 'call', 'return', 'exception'):
            return tracer
        if len(steps) >= max_steps:
            truncated = True
            truncation_reason = f'Đã đạt giới hạn {max_steps} bước theo dõi (maxSteps).'
            raise _HusTraceLimit()

        locals_ser, locals_raw = _capture_locals(frame)
        explicit_events = viz.drain()
        inferred_events, primary_list = _infer_list_events(locals_raw)
        all_events = explicit_events + inferred_events

        if primary_list is not None and explicit_events:
            for ev in explicit_events:
                if ev['type'] == 'compare':
                    for idx in ev.get('indices', []):
                        primary_list['highlights'].setdefault(idx, 'compare')
                elif ev['type'] == 'swap':
                    for idx in ev.get('indices', []):
                        primary_list['highlights'][idx] = 'swap'
                elif ev['type'] == 'mark':
                    primary_list['highlights'][ev['index']] = ev['state']

        steps.append({
            'stepIndex': len(steps),
            'line': frame.f_lineno,
            'event': event,
            'func': '<module>' if frame.f_code.co_name == '<module>' else frame.f_code.co_name,
            'locals': locals_ser,
            'callStack': _capture_stack(frame),
            'events': all_events,
            'primaryList': primary_list
        })
        return tracer

    try:
        compiled = compile(code_str, '<user_code>', 'exec')
        sys.settrace(tracer)
        try:
            exec(compiled, ns, ns)
        finally:
            sys.settrace(None)
    except _HusTraceLimit:
        pass
    except Exception as exc:
        sys.stdout, sys.stderr = old_out, old_err
        info = _hus_extract_error(exc)
        return json.dumps({
            'ok': False,
            'status': info['status'],
            'stdout': stdout_buf.getvalue(),
            'stderr': stderr_buf.getvalue(),
            'error': info['error'],
            'traceback': info['traceback'],
            'errorLine': info['errorLine'],
            'truncated': truncated,
            'truncationReason': truncation_reason,
            'steps': steps
        })

    sys.stdout, sys.stderr = old_out, old_err
    return json.dumps({
        'ok': True,
        'status': 'completed',
        'stdout': stdout_buf.getvalue(),
        'stderr': stderr_buf.getvalue(),
        'error': None,
        'traceback': None,
        'errorLine': None,
        'truncated': truncated,
        'truncationReason': truncation_reason,
        'steps': steps
    })
`;

async function ensurePyodide() {
    if (pyodide) return pyodide;
    if (!initPromise) {
        initPromise = (async () => {
            self.postMessage({ type: 'status', status: 'loading', message: 'Đang tải Pyodide (WebAssembly)…' });
            importScripts(`${PYODIDE_BASE_URL}pyodide.js`);
            const instance = await loadPyodide({ indexURL: PYODIDE_BASE_URL });
            instance.runPython(PYTHON_RUNTIME_BOOTSTRAP);
            pyodide = instance;
            self.postMessage({ type: 'status', status: 'ready', message: 'Python (Pyodide) đã sẵn sàng.' });
            return pyodide;
        })().catch(err => {
            initPromise = null;
            throw err;
        });
    }
    return initPromise;
}

self.onmessage = async event => {
    const { id, type, payload } = event.data || {};
    try {
        if (type === 'init') {
            await ensurePyodide();
            self.postMessage({ id, type: 'init_ok' });
            return;
        }

        const py = await ensurePyodide();

        if (type === 'execute') {
            const { code, tests, fnName, inPlace } = payload || {};
            py.globals.set('_hus_arg_code', String(code ?? ''));
            py.globals.set('_hus_arg_tests', tests ? JSON.stringify(tests) : null);
            py.globals.set('_hus_arg_fn', fnName || null);
            py.globals.set('_hus_arg_inplace', Boolean(inPlace));
            const jsonStr = py.runPython('_hus_exec(_hus_arg_code, _hus_arg_tests, _hus_arg_fn, _hus_arg_inplace)');
            self.postMessage({ id, type: 'result', data: JSON.parse(jsonStr) });
            return;
        }

        if (type === 'trace') {
            const { code, maxSteps = 250, maxCollectionSize = 40, maxDepth = 4 } = payload || {};
            py.globals.set('_hus_arg_code', String(code ?? ''));
            py.globals.set('_hus_arg_steps', Number(maxSteps));
            py.globals.set('_hus_arg_coll', Number(maxCollectionSize));
            py.globals.set('_hus_arg_depth', Number(maxDepth));
            const jsonStr = py.runPython('_hus_trace(_hus_arg_code, _hus_arg_steps, _hus_arg_coll, _hus_arg_depth)');
            self.postMessage({ id, type: 'result', data: JSON.parse(jsonStr) });
            return;
        }

        self.postMessage({ id, type: 'error', error: `Unknown worker message type: ${type}` });
    } catch (err) {
        self.postMessage({
            id,
            type: 'error',
            error: err && err.message ? err.message : String(err)
        });
    }
};
