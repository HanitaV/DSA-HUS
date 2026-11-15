import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const piece = id => ({ id, title: id, summary: 'Kiểm tra', type: 'concept', difficulty: 1, tags: [], sources: [{ file: 'docs/test.pdf', page: 1 }], lesson: '' });
function validate(mutate) {
    const root = mkdtempSync(join(tmpdir(), 'hus-validator-'));
    const data = { pieces: [piece('a'), piece('b')], edges: [{ source: 'a', target: 'b', relation: 'prerequisite' }] };
    const course = { id: 'TEST', name: 'Kiểm tra', aim: 'Kiểm tra', outcomes: ['Đọc dữ liệu'], chapters: [{ id: 'c1', title: 'Chương 1', pieces: ['a', 'b'] }] };
    mutate(data, course);
    try {
        mkdirSync(join(root, 'data/courses'), { recursive: true });
        writeFileSync(join(root, 'data/pieces.json'), JSON.stringify(data));
        writeFileSync(join(root, 'data/courses/index.json'), JSON.stringify({ courses: ['TEST'] }));
        writeFileSync(join(root, 'data/courses/TEST.json'), JSON.stringify(course));
        return spawnSync(process.execPath, ['tools/validate.mjs', '--root', root], { encoding: 'utf8' });
    } finally { rmSync(root, { recursive: true, force: true }); }
}
test('valid fixture succeeds', () => assert.equal(validate(() => {}).status, 0));
for (const [name, mutate, pattern] of [
    ['duplicate ID', d => d.pieces.push(piece('a')), /Trùng id/],
    ['dangling edge', d => d.edges[0].target = 'missing', /không tồn tại/],
    ['prerequisite cycle', d => d.edges.push({ source: 'b', target: 'a', relation: 'prerequisite' }), /Chu trình/],
    ['course missing node', (d, c) => c.chapters[0].pieces.push('missing'), /tham chiếu mảnh không tồn tại/],
    ['source absent', d => d.pieces[0].sources = [], /không có nguồn/]
]) test(`validator rejects ${name}`, () => { const result = validate(mutate); assert.equal(result.status, 1); assert.match(result.stdout, pattern); });
