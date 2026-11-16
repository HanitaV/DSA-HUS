import { createStepper, el, renderBars, renderCells } from '../visualizers/shared.js';

function formatSerializedValue(val) {
    if (val === null) return 'None';
    if (typeof val === 'boolean') return val ? 'True' : 'False';
    if (typeof val === 'number') return String(val);
    if (typeof val === 'string') return JSON.stringify(val);
    if (typeof val === 'object') {
        if (val.__type === 'float' || val.__type === 'circular') return val.repr || `<${val.__type}>`;
        if (val.__type === 'list' || val.__type === 'tuple' || val.__type === 'set') {
            const open = val.__type === 'list' ? '[' : val.__type === 'tuple' ? '(' : '{';
            const close = val.__type === 'list' ? ']' : val.__type === 'tuple' ? ')' : '}';
            const inner = (val.items || []).map(formatSerializedValue).join(', ');
            return `${open}${inner}${val.truncated ? ', …' : ''}${close}`;
        }
        if (val.__type === 'dict') {
            const inner = (val.entries || [])
                .map(([k, v]) => `${formatSerializedValue(k)}: ${formatSerializedValue(v)}`)
                .join(', ');
            return `{${inner}${val.truncated ? ', …' : ''}}`;
        }
        return val.repr || `<${val.__type || 'object'}>`;
    }
    return String(val);
}

function describeEvent(ev) {
    if (!ev) return '';
    const tag = ev.inferred ? ' (suy luận)' : '';
    switch (ev.type) {
        case 'compare':
            return `So sánh [${ev.indices?.[0]}] và [${ev.indices?.[1]}]${tag}`;
        case 'swap':
            return `Hoán đổi [${ev.indices?.[0]}] ⇄ [${ev.indices?.[1]}]${tag}`;
        case 'visit':
            return `Thăm đỉnh ${ev.node}${tag}`;
        case 'push':
            return `Push ${JSON.stringify(ev.value)}${tag}`;
        case 'pop':
            return `Pop${tag}`;
        case 'mark':
            return `Đánh dấu [${ev.index}] (${ev.state})${tag}`;
        case 'update':
            return `Cập nhật ${ev.target} = ${JSON.stringify(ev.value)}${tag}`;
        default:
            return ev.type;
    }
}

/**
 * Mounts an interactive Python execution trace visualizer using the platform's
 * shared createStepper() and array/callstack renderers.
 *
 * @param {HTMLElement} host
 * @param {object} traceResult - ExecutionTrace returned by PyodideExecutionEngine.trace()
 * @param {string} sourceCode - User Python source code
 * @param {{ onStepLine?: (line: number | null) => void }} [options]
 */
export function mountPythonTraceVisualizer(host, traceResult, sourceCode, options = {}) {
    const rawSteps = Array.isArray(traceResult?.steps) ? traceResult.steps : [];
    const codeLines = String(sourceCode || '').split('\n');

    if (!rawSteps.length) {
        host.hidden = false;
        host.innerHTML = '<p class="viz-loading">Không có bước thực thi nào được ghi lại.</p>';
        return null;
    }

    const steps = rawSteps.map((st, idx) => {
        const prevLocals = idx > 0 ? rawSteps[idx - 1].locals || {} : {};
        const curLocals = st.locals || {};
        const changedKeys = new Set(
            Object.keys(curLocals).filter(k => JSON.stringify(curLocals[k]) !== JSON.stringify(prevLocals[k]))
        );
        const eventNote = st.events?.length ? ` · ${st.events.map(describeEvent).join('; ')}` : '';
        return {
            ...st,
            line: Math.max(0, (st.line || 1) - 1),
            sourceLine: st.line || 1,
            changedKeys,
            msg: `Dòng ${st.line} (${st.func}) [${st.event}]${eventNote}`
        };
    });

    host.hidden = false;
    const stepper = createStepper(host, {
        title: 'Mô phỏng thực thi Python từng bước',
        subtitle: traceResult.truncated
            ? `Hiển thị ${steps.length} bước đầu tiên (${traceResult.truncationReason || 'đã giới hạn'}).`
            : `Đã ghi lại ${steps.length} bước thực thi thực tế qua Pyodide.`,
        badge: 'Python Trace',
        codeLines,
        steps,
        stats: frame => [
            ['Dòng', `L${frame.sourceLine}`],
            ['Hàm', frame.func],
            ['Call Stack', `${frame.callStack?.length || 0} khung`]
        ],
        render(stage, frame) {
            if (options.onStepLine) {
                options.onStepLine(frame.sourceLine);
            }

            if (frame.events?.length) {
                const evRow = el('div', { class: 'py-trace-events' },
                    frame.events.map(ev => el('span', {
                        class: `py-event-chip ${ev.inferred ? 'is-inferred' : 'is-explicit'}`,
                        text: describeEvent(ev)
                    }))
                );
                stage.append(evRow);
            }

            if (frame.primaryList && Array.isArray(frame.primaryList.values) && frame.primaryList.values.length) {
                const listBox = el('div', { class: 'py-trace-array' },
                    el('div', { class: 'py-trace-section-title', text: `Mảng / Danh sách: ${frame.primaryList.name}` })
                );
                const vals = frame.primaryList.values;
                const hi = frame.primaryList.highlights || {};
                if (vals.length <= 14 && vals.every(v => Math.abs(v) <= 200)) {
                    renderBars(listBox, vals, hi);
                } else {
                    renderCells(listBox, vals, hi);
                }
                stage.append(listBox);
            }

            const split = el('div', { class: 'py-trace-split' });

            // Call Stack panel (reusing .viz-callstack classes)
            const stackWrap = el('div', { class: 'viz-callstack-wrap py-trace-panel' },
                el('div', { class: 'viz-callstack-label', text: 'Call Stack' })
            );
            const frames = frame.callStack || [];
            if (!frames.length) {
                stackWrap.append(el('div', { class: 'viz-callstack-empty', text: '(Trống)' }));
            } else {
                const stackList = el('div', { class: 'viz-callstack' });
                [...frames].reverse().forEach((cf, idx) => {
                    stackList.append(el('div', { class: `viz-frame ${idx === 0 ? 'is-top' : ''}` },
                        el('span', { class: 'viz-frame-fn', text: `${cf.func}(${cf.argsSummary || ''})` }),
                        el('span', { class: 'viz-frame-state', text: `L${cf.line}` })
                    ));
                });
                stackWrap.append(stackList);
            }

            // Variable Inspector panel
            const varsWrap = el('div', { class: 'py-trace-panel py-vars-panel' },
                el('div', { class: 'viz-callstack-label', text: 'Biến cục bộ (Variables)' })
            );
            const entries = Object.entries(frame.locals || {});
            if (!entries.length) {
                varsWrap.append(el('div', { class: 'viz-callstack-empty', text: 'Chưa có biến cục bộ ở bước này.' }));
            } else {
                const table = el('table', { class: 'py-vars-table' },
                    el('thead', {}, el('tr', {}, el('th', { text: 'Tên' }), el('th', { text: 'Giá trị' }))),
                    el('tbody', {}, entries.map(([k, v]) => {
                        const changed = frame.changedKeys?.has(k);
                        return el('tr', { class: changed ? 'is-changed' : '' },
                            el('td', { class: 'py-var-name', text: k }),
                            el('td', { class: 'py-var-val', text: formatSerializedValue(v) })
                        );
                    }))
                );
                varsWrap.append(table);
            }

            split.append(stackWrap, varsWrap);
            stage.append(split);
        }
    });

    return stepper;
}
