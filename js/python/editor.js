/**
 * Lightweight, zero-dependency code editor enhancing a <textarea> with
 * line numbers, syntax highlighting (Python & Java/JS), auto-indentation,
 * active-line / error-line highlighting, and keyboard shortcuts.
 */

const PY_KEYWORDS = new Set([
    'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break',
    'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally',
    'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal',
    'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'
]);

const PY_BUILTINS = new Set([
    'abs', 'all', 'any', 'bool', 'dict', 'enumerate', 'float', 'int', 'len',
    'list', 'max', 'min', 'print', 'range', 'reversed', 'round', 'set',
    'sorted', 'str', 'sum', 'tuple', 'zip', 'deque', 'viz'
]);

const JAVA_KEYWORDS = new Set([
    'public', 'private', 'protected', 'static', 'final', 'return', 'if', 'else',
    'for', 'while', 'do', 'break', 'continue', 'switch', 'case', 'default',
    'new', 'function', 'let', 'const', 'var', 'true', 'false', 'null', 'Infinity'
]);

const JAVA_TYPES = new Set([
    'void', 'int', 'long', 'double', 'float', 'boolean', 'char', 'String',
    'Arrays', 'Math', 'System'
]);

function escHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightLine(line, lang) {
    const isPy = lang === 'python';
    const kwSet = isPy ? PY_KEYWORDS : JAVA_KEYWORDS;
    const typeSet = isPy ? PY_BUILTINS : JAVA_TYPES;
    const tokenRe = isPy
        ? /(#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g
        : /(\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g;

    let out = '';
    let last = 0;
    for (const m of line.matchAll(tokenRe)) {
        if (m.index > last) out += escHtml(line.slice(last, m.index));
        const tok = m[0];
        if ((isPy && tok.startsWith('#')) || (!isPy && tok.startsWith('//'))) {
            out += `<span class="tok-comment">${escHtml(tok)}</span>`;
        } else if (tok.startsWith('"') || tok.startsWith("'")) {
            out += `<span class="tok-string">${escHtml(tok)}</span>`;
        } else if (/^\d/.test(tok)) {
            out += `<span class="tok-number">${escHtml(tok)}</span>`;
        } else if (kwSet.has(tok)) {
            out += `<span class="tok-kw">${escHtml(tok)}</span>`;
        } else if (typeSet.has(tok)) {
            out += `<span class="tok-type">${escHtml(tok)}</span>`;
        } else {
            out += escHtml(tok);
        }
        last = m.index + tok.length;
    }
    if (last < line.length) out += escHtml(line.slice(last));
    return out || ' ';
}

export function createCodeEditor(host, {
    initialValue = '',
    language = 'python',
    ariaLabel = 'Trình soạn thảo code thực hành',
    onChange = null,
    onRun = null
} = {}) {
    let lang = language;
    let activeLine = null;
    let errorLine = null;

    host.innerHTML = '';
    const shell = document.createElement('div');
    shell.className = 'ce-shell';

    const gutter = document.createElement('div');
    gutter.className = 'ce-gutter';
    gutter.setAttribute('aria-hidden', 'true');

    const stage = document.createElement('div');
    stage.className = 'ce-stage';

    const highlight = document.createElement('pre');
    highlight.className = 'ce-highlight';
    highlight.setAttribute('aria-hidden', 'true');

    const textarea = document.createElement('textarea');
    textarea.id = 'coding-editor';
    textarea.className = 'coding-editor ce-textarea';
    textarea.spellcheck = false;
    textarea.autocomplete = 'off';
    textarea.autocapitalize = 'off';
    textarea.setAttribute('aria-label', ariaLabel);
    textarea.value = initialValue;

    stage.append(highlight, textarea);
    shell.append(gutter, stage);
    host.append(shell);

    function syncScroll() {
        highlight.scrollTop = textarea.scrollTop;
        highlight.scrollLeft = textarea.scrollLeft;
        gutter.scrollTop = textarea.scrollTop;
    }

    function render() {
        const lines = textarea.value.split('\n');
        gutter.innerHTML = lines.map((_, idx) => {
            const ln = idx + 1;
            const cls = ln === errorLine ? 'ce-ln is-error' : ln === activeLine ? 'ce-ln is-active' : 'ce-ln';
            return `<div class="${cls}">${ln}</div>`;
        }).join('');

        highlight.innerHTML = lines.map((line, idx) => {
            const ln = idx + 1;
            const cls = ln === errorLine ? 'ce-code-line is-error' : ln === activeLine ? 'ce-code-line is-active' : 'ce-code-line';
            return `<div class="${cls}">${highlightLine(line, lang)}</div>`;
        }).join('');

        syncScroll();
    }

    function notifyChange() {
        render();
        if (onChange) onChange(textarea.value);
    }

    textarea.addEventListener('input', notifyChange);
    textarea.addEventListener('scroll', syncScroll);

    textarea.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const val = textarea.value;
            if (e.shiftKey) {
                const lineStart = val.lastIndexOf('\n', start - 1) + 1;
                if (val.slice(lineStart, lineStart + 4) === '    ') {
                    textarea.value = val.slice(0, lineStart) + val.slice(lineStart + 4);
                    textarea.selectionStart = Math.max(lineStart, start - 4);
                    textarea.selectionEnd = Math.max(lineStart, end - 4);
                    notifyChange();
                }
            } else {
                textarea.value = val.slice(0, start) + '    ' + val.slice(end);
                textarea.selectionStart = textarea.selectionEnd = start + 4;
                notifyChange();
            }
        } else if (e.key === 'Enter' && !(e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const val = textarea.value;
            const lineStart = val.lastIndexOf('\n', start - 1) + 1;
            const currentLine = val.slice(lineStart, start);
            const indentMatch = currentLine.match(/^\s*/);
            let indent = indentMatch ? indentMatch[0] : '';
            if (lang === 'python' && currentLine.trimEnd().endsWith(':')) {
                indent += '    ';
            }
            const insert = '\n' + indent;
            textarea.value = val.slice(0, start) + insert + val.slice(end);
            textarea.selectionStart = textarea.selectionEnd = start + insert.length;
            notifyChange();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (onRun) onRun();
        }
    });

    render();

    return {
        textarea,
        getValue: () => textarea.value,
        setValue(val) {
            textarea.value = String(val ?? '');
            errorLine = null;
            activeLine = null;
            render();
        },
        setLanguage(nextLang) {
            lang = nextLang;
            errorLine = null;
            activeLine = null;
            render();
        },
        setActiveLine(ln) {
            activeLine = ln;
            render();
        },
        setErrorLine(ln) {
            errorLine = ln;
            render();
        },
        clearHighlights() {
            activeLine = null;
            errorLine = null;
            render();
        }
    };
}
