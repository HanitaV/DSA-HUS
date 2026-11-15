import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize, ready, recommend, loadProgress, saveProgress, readRoute, route } from '../js/model.mjs';

test('Vietnamese search folds accents, Đ and decomposed text', () => {
    assert.equal(normalize('ĐỆ QUY VÀ ĐỒ THỊ'), 'de quy va do thi');
    assert.equal(normalize('Dữ liệu'.normalize('NFD')), 'du lieu');
});
const edges = [{ source: 'a', target: 'c', relation: 'prerequisite' }, { source: 'b', target: 'c', relation: 'prerequisite' }, { source: 'x', target: 'c', relation: 'applies' }];
test('readiness requires every incoming prerequisite and ignores applies', () => {
    assert.equal(ready('c', edges, new Set(['a'])), false);
    assert.equal(ready('c', edges, new Set(['a', 'b'])), true);
    assert.equal(ready('a', edges, new Set()), true);
});
test('unmarking a prerequisite blocks readiness again', () => {
    const learned = new Set(['a', 'b']); learned.delete('a');
    assert.equal(ready('c', edges, learned), false);
});
test('recommendations respect chapter order, dependencies outside course and completion', () => {
    const course = { chapters: [{ pieces: ['c', 'a'] }, { pieces: ['b'] }] };
    assert.equal(recommend(course, edges, new Set()), 'a');
    assert.equal(recommend(course, edges, new Set(['a'])), 'b');
    assert.equal(recommend(course, edges, new Set(['a', 'b'])), 'c');
    assert.equal(recommend(course, edges, new Set(['a', 'b', 'c'])), null);
    assert.equal(recommend({ chapters: [{ pieces: ['c'] }] }, edges, new Set()), null);
});
test('storage restrictions and malformed JSON do not break learning', () => {
    assert.equal(loadProgress(null).available, false);
    assert.equal(loadProgress({ getItem() { throw new Error('denied'); } }).available, false);
    assert.equal(loadProgress({ getItem: () => '{broken' }).learned.size, 0);
    assert.equal(saveProgress({ setItem() { throw new Error('quota'); } }, new Set(['a'])), false);
    assert.deepEqual([...loadProgress({ getItem: () => '["a", 12, null]' }).learned], ['a']);
});
test('routes round-trip with optional course and piece', () => {
    assert.deepEqual(readRoute(route({ piece: 'big-o', course: 'MAT3514' })), { piece: 'big-o', course: 'MAT3514' });
    assert.equal(route({ piece: 'big-o' }, 'lesson.html'), 'lesson.html#piece=big-o');
});
